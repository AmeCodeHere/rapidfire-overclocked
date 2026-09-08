import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { db, isConfigured as isFirebaseConfigured, ref, onValue, set, update } from '../firebase';
import { SAMPLE_TEAMS } from '../utils/sampleData';
import { useSoundEffects } from '../hooks/useSoundEffects';

const GameContext = createContext();

const BROADCAST_CHANNEL_NAME = 'overclocked_rapidfire_sync';

const DEFAULT_SESSION = {
  status: 'setup', // 'setup' | 'active' | 'ended'
  questions: [],
  currentQuestionIndex: 0,
  teamOrder: [], // Empty by default: admin configures actual teams
  currentTeamIndex: 0,
  attemptedTeamsForCurrentQuestion: [],
  basePointsPerCorrectAnswer: 10,
  speedBonusMultiplier: 1,
  perTeamTimerDurationSeconds: 60, // 1 minute default
  currentTeamTimeRemaining: 60,
  totalRoundTimerDurationSeconds: 600, // 10 minutes
  totalRoundTimeRemaining: 600,
  timerStatus: 'paused', // 'running' | 'paused' | 'stopped'
  turnCycleMode: 'continue', // 'continue' | 'restart'
  flashEvent: null // { id, type: 'correct'|'wrong', teamName, pointsAwarded, timestamp }
};

const DEFAULT_LEADERBOARD = {};

const hasLegacyAutoLoadedQuestions = (questions) => (
  Array.isArray(questions)
  && questions.length === 12
  && questions.every((question, index) => question?.id === `q-${index + 1}`)
);

export const GameProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('rapidfire_session');
      if (!saved) return DEFAULT_SESSION;

      const savedSession = JSON.parse(saved);
      return {
        ...DEFAULT_SESSION,
        ...savedSession,
        questions: hasLegacyAutoLoadedQuestions(savedSession.questions)
          ? []
          : (savedSession.questions || [])
      };
    } catch {
      return DEFAULT_SESSION;
    }
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      const saved = localStorage.getItem('rapidfire_leaderboard');
      return saved ? JSON.parse(saved) : DEFAULT_LEADERBOARD;
    } catch {
      return DEFAULT_LEADERBOARD;
    }
  });

  const [isConnectedToFirebase, setIsConnectedToFirebase] = useState(isFirebaseConfigured);
  const broadcastChannelRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isUpdatingFromRemoteRef = useRef(false);

  const { playCorrect, playWrong, playTick } = useSoundEffects();

  // Keep ref to latest state for interval operations
  const sessionRef = useRef(session);
  const leaderboardRef = useRef(leaderboard);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
  useEffect(() => {
    leaderboardRef.current = leaderboard;
  }, [leaderboard]);

  // Sync state broadcast / save
  const broadcastState = useCallback((newSession, newLeaderboard) => {
    const s = newSession || sessionRef.current;
    const l = newLeaderboard || leaderboardRef.current;

    // Save to localStorage for instant local tab sync & persistence
    try {
      localStorage.setItem('rapidfire_session', JSON.stringify(s));
      localStorage.setItem('rapidfire_leaderboard', JSON.stringify(l));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Broadcast across tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'SYNC_ALL',
        session: s,
        leaderboard: l,
        timestamp: Date.now()
      });
    }

    // Push to Firebase Realtime Database
    if (isFirebaseConfigured && db) {
      try {
        // Strip undefined fields to ensure clean Firebase transmission
        const cleanSession = JSON.parse(JSON.stringify(s));
        const cleanLeaderboard = JSON.parse(JSON.stringify(l));
        set(ref(db, 'rapidfireSession'), cleanSession);
        set(ref(db, 'rapidfireLeaderboard'), cleanLeaderboard);
      } catch (e) {
        console.warn('Firebase sync error:', e);
      }
    }
  }, []);

  // Update session and sync
  const updateSession = useCallback((updater) => {
    setSession(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      broadcastState(updated, null);
      return updated;
    });
  }, [broadcastState]);

  // Update leaderboard and sync
  const updateLeaderboard = useCallback((updater) => {
    setLeaderboard(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      broadcastState(null, updated);
      return updated;
    });
  }, [broadcastState]);

  // Initialize BroadcastChannel and Firebase listeners
  useEffect(() => {
    // 1. BroadcastChannel setup for local tab-to-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (!event.data) return;
        const { type, session: remoteSession, leaderboard: remoteLeaderboard } = event.data;
        if (type === 'SYNC_ALL') {
          isUpdatingFromRemoteRef.current = true;
          if (remoteSession) setSession(remoteSession);
          if (remoteLeaderboard) setLeaderboard(remoteLeaderboard);
          setTimeout(() => { isUpdatingFromRemoteRef.current = false; }, 50);
        }
      };
    }

    // 2. Firebase Realtime Database setup (if configured)
    if (isFirebaseConfigured && db) {
      try {
        const sessionDbRef = ref(db, 'rapidfireSession');
        const unsubSession = onValue(sessionDbRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setSession(prev => ({ ...DEFAULT_SESSION, ...data }));
            setIsConnectedToFirebase(true);
          } else {
            // Initialize fresh Firebase DB with initial session
            set(ref(db, 'rapidfireSession'), DEFAULT_SESSION);
            set(ref(db, 'rapidfireLeaderboard'), DEFAULT_LEADERBOARD);
            setIsConnectedToFirebase(true);
          }
        }, (err) => {
          console.warn('Firebase onValue error:', err);
          setIsConnectedToFirebase(false);
        });

        const leaderboardDbRef = ref(db, 'rapidfireLeaderboard');
        const unsubLeaderboard = onValue(leaderboardDbRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setLeaderboard(data);
          }
        });

        return () => {
          unsubSession();
          unsubLeaderboard();
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.close();
          }
        };
      } catch (e) {
        console.warn('Firebase listener setup error:', e);
      }
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);

  // Audio trigger on flashEvent change
  useEffect(() => {
    if (!session.flashEvent) return;
    const { type } = session.flashEvent;
    if (type === 'correct') {
      playCorrect();
    } else if (type === 'wrong') {
      playWrong();
    }
  }, [session.flashEvent?.id, playCorrect, playWrong]);

  // Audio tick trigger during final 3 seconds
  useEffect(() => {
    if (session.timerStatus === 'running' && session.currentTeamTimeRemaining <= 3 && session.currentTeamTimeRemaining > 0) {
      playTick();
    }
  }, [session.timerStatus, session.currentTeamTimeRemaining, playTick]);

  // GAME ACTION HANDLERS

  // Handle WRONG answer or auto-timeout
  const handleWrongAnswer = useCallback(() => {
    const currentSess = sessionRef.current;
    const {
      questions,
      currentQuestionIndex,
      teamOrder,
      currentTeamIndex,
      attemptedTeamsForCurrentQuestion,
      perTeamTimerDurationSeconds
    } = currentSess;

    if (!teamOrder || teamOrder.length === 0) return;

    const currentTeam = teamOrder[currentTeamIndex] || `Team ${currentTeamIndex + 1}`;
    const newAttempted = [...(attemptedTeamsForCurrentQuestion || [])];
    if (!newAttempted.includes(currentTeam)) {
      newAttempted.push(currentTeam);
    }

    const flash = {
      id: `flash-${Date.now()}`,
      type: 'wrong',
      teamName: currentTeam,
      pointsAwarded: 0,
      timestamp: Date.now()
    };

    // Check if ALL teams in seating order have now attempted this question
    const allTeamsAttempted = newAttempted.length >= teamOrder.length;

    if (allTeamsAttempted) {
      // Advance to next question, pass turn to next team in seating order
      const nextQIndex = currentQuestionIndex + 1;
      const isRoundOver = nextQIndex >= questions.length;
      const nextTeamIdx = (currentTeamIndex + 1) % teamOrder.length;

      updateSession({
        currentQuestionIndex: isRoundOver ? currentQuestionIndex : nextQIndex,
        currentTeamIndex: nextTeamIdx,
        attemptedTeamsForCurrentQuestion: [],
        currentTeamTimeRemaining: perTeamTimerDurationSeconds,
        flashEvent: flash,
        status: isRoundOver ? 'ended' : currentSess.status
      });
    } else {
      // Pass SAME question to NEXT team in seating order
      const nextTeamIdx = (currentTeamIndex + 1) % teamOrder.length;

      updateSession({
        currentTeamIndex: nextTeamIdx,
        attemptedTeamsForCurrentQuestion: newAttempted,
        currentTeamTimeRemaining: perTeamTimerDurationSeconds,
        flashEvent: flash
      });
    }
  }, [updateSession]);

  // Handle CORRECT answer confirmation
  const handleCorrectAnswer = useCallback((winningTeamName) => {
    const currentSess = sessionRef.current;
    const currentBoard = leaderboardRef.current;
    const {
      questions,
      currentQuestionIndex,
      teamOrder,
      currentTeamIndex,
      basePointsPerCorrectAnswer,
      speedBonusMultiplier,
      perTeamTimerDurationSeconds,
      currentTeamTimeRemaining,
      turnCycleMode
    } = currentSess;

    const targetTeam = winningTeamName || teamOrder[currentTeamIndex];
    const timeRemaining = Math.max(0, currentTeamTimeRemaining);
    const speedBonus = speedBonusMultiplier * timeRemaining;
    const totalAwarded = basePointsPerCorrectAnswer + speedBonus;

    // Update leaderboard
    const newLeaderboard = {
      ...currentBoard,
      [targetTeam]: (Number(currentBoard[targetTeam]) || 0) + totalAwarded
    };

    const flash = {
      id: `flash-${Date.now()}`,
      type: 'correct',
      teamName: targetTeam,
      pointsAwarded: totalAwarded,
      basePoints: basePointsPerCorrectAnswer,
      speedBonus: speedBonus,
      timeRemaining: timeRemaining,
      timestamp: Date.now()
    };

    // Determine next question & next team
    const nextQIndex = currentQuestionIndex + 1;
    const isRoundOver = nextQIndex >= questions.length;

    // Turn cycle logic: default "continue" from next team in order, or "restart" from top
    let nextTeamIdx;
    if (turnCycleMode === 'restart') {
      nextTeamIdx = 0;
    } else {
      nextTeamIdx = (currentTeamIndex + 1) % teamOrder.length;
    }

    const updatedSession = {
      ...currentSess,
      currentQuestionIndex: isRoundOver ? currentQuestionIndex : nextQIndex,
      currentTeamIndex: nextTeamIdx,
      attemptedTeamsForCurrentQuestion: [],
      currentTeamTimeRemaining: perTeamTimerDurationSeconds,
      flashEvent: flash,
      status: isRoundOver ? 'ended' : currentSess.status
    };

    setSession(updatedSession);
    setLeaderboard(newLeaderboard);
    broadcastState(updatedSession, newLeaderboard);
  }, [broadcastState]);

  // Timer Tick (Active host execution)
  const tickTimer = useCallback(() => {
    const currentSess = sessionRef.current;
    if (currentSess.timerStatus !== 'running') return;

    let newTeamTime = currentSess.currentTeamTimeRemaining - 1;
    let newRoundTime = Math.max(0, currentSess.totalRoundTimeRemaining - 1);

    if (newTeamTime <= 0) {
      // Auto timeout: trigger WRONG answer logic
      handleWrongAnswer();
    } else {
      updateSession({
        currentTeamTimeRemaining: newTeamTime,
        totalRoundTimeRemaining: newRoundTime
      });
    }
  }, [handleWrongAnswer, updateSession]);

  // Start timer runner interval (only on host admin tab to avoid multi-tab clock collision)
  useEffect(() => {
    const isHostTab = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
    if (!isHostTab) return;

    if (session.timerStatus === 'running') {
      timerIntervalRef.current = setInterval(tickTimer, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [session.timerStatus, tickTimer]);

  // Timer Controls
  const pauseTimer = useCallback(() => {
    updateSession({ timerStatus: 'paused' });
  }, [updateSession]);

  const resumeTimer = useCallback(() => {
    updateSession({ timerStatus: 'running' });
  }, [updateSession]);

  const resetTimer = useCallback(() => {
    updateSession(prev => ({
      currentTeamTimeRemaining: prev.perTeamTimerDurationSeconds,
      timerStatus: 'paused'
    }));
  }, [updateSession]);

  const addExtraFiveSeconds = useCallback(() => {
    updateSession(prev => ({
      currentTeamTimeRemaining: prev.currentTeamTimeRemaining + 5
    }));
  }, [updateSession]);

  const skipToNextQuestion = useCallback(() => {
    const currentSess = sessionRef.current;
    const { questions, currentQuestionIndex, teamOrder, currentTeamIndex, perTeamTimerDurationSeconds } = currentSess;
    const nextQIndex = currentQuestionIndex + 1;
    const isRoundOver = nextQIndex >= questions.length;
    const nextTeamIdx = (currentTeamIndex + 1) % teamOrder.length;

    updateSession({
      currentQuestionIndex: isRoundOver ? currentQuestionIndex : nextQIndex,
      currentTeamIndex: nextTeamIdx,
      attemptedTeamsForCurrentQuestion: [],
      currentTeamTimeRemaining: perTeamTimerDurationSeconds,
      status: isRoundOver ? 'ended' : currentSess.status
    });
  }, [updateSession]);

  const resetRound = useCallback(() => {
    const resetSess = {
      ...DEFAULT_SESSION,
      questions: sessionRef.current.questions,
      teamOrder: sessionRef.current.teamOrder,
      basePointsPerCorrectAnswer: sessionRef.current.basePointsPerCorrectAnswer,
      speedBonusMultiplier: sessionRef.current.speedBonusMultiplier,
      perTeamTimerDurationSeconds: sessionRef.current.perTeamTimerDurationSeconds,
      totalRoundTimerDurationSeconds: sessionRef.current.totalRoundTimerDurationSeconds,
      currentTeamTimeRemaining: sessionRef.current.perTeamTimerDurationSeconds,
      totalRoundTimeRemaining: sessionRef.current.totalRoundTimerDurationSeconds,
      turnCycleMode: sessionRef.current.turnCycleMode,
      status: 'setup'
    };

    const resetBoard = sessionRef.current.teamOrder.reduce((acc, t) => {
      acc[t] = 0;
      return acc;
    }, {});

    setSession(resetSess);
    setLeaderboard(resetBoard);
    broadcastState(resetSess, resetBoard);
  }, [broadcastState]);

  const adjustTeamScore = useCallback((teamName, delta) => {
    setLeaderboard(prev => {
      const updated = {
        ...prev,
        [teamName]: Math.max(0, (Number(prev[teamName]) || 0) + delta)
      };
      broadcastState(null, updated);
      return updated;
    });
  }, [broadcastState]);

  const setTeamScoreDirectly = useCallback((teamName, score) => {
    setLeaderboard(prev => {
      const updated = {
        ...prev,
        [teamName]: Math.max(0, Number(score) || 0)
      };
      broadcastState(null, updated);
      return updated;
    });
  }, [broadcastState]);

  const setQuestionTimeInMinutes = useCallback((minutes) => {
    const totalSecs = Math.max(5, Math.round(Number(minutes) * 60));
    updateSession({
      perTeamTimerDurationSeconds: totalSecs,
      currentTeamTimeRemaining: totalSecs
    });
  }, [updateSession]);

  const clearAllTeams = useCallback(() => {
    const updatedSession = {
      ...sessionRef.current,
      teamOrder: [],
      currentTeamIndex: 0,
      attemptedTeamsForCurrentQuestion: []
    };
    setSession(updatedSession);
    setLeaderboard({});
    broadcastState(updatedSession, {});
  }, [broadcastState]);

  const removeTeam = useCallback((teamName) => {
    const currentSession = sessionRef.current;
    const removedIndex = currentSession.teamOrder.indexOf(teamName);
    if (removedIndex === -1) return;

    const updatedTeamOrder = currentSession.teamOrder.filter(team => team !== teamName);
    const nextCurrentTeamIndex = removedIndex < currentSession.currentTeamIndex
      ? currentSession.currentTeamIndex - 1
      : currentSession.currentTeamIndex;
    const updatedSession = {
      ...currentSession,
      teamOrder: updatedTeamOrder,
      currentTeamIndex: Math.min(nextCurrentTeamIndex, Math.max(0, updatedTeamOrder.length - 1))
    };
    const updatedLeaderboard = { ...leaderboardRef.current };
    delete updatedLeaderboard[teamName];

    setSession(updatedSession);
    setLeaderboard(updatedLeaderboard);
    broadcastState(updatedSession, updatedLeaderboard);
  }, [broadcastState]);

  return (
    <GameContext.Provider
      value={{
        session,
        leaderboard,
        isConnectedToFirebase,
        updateSession,
        updateLeaderboard,
        handleWrongAnswer,
        handleCorrectAnswer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        addExtraFiveSeconds,
        skipToNextQuestion,
        resetRound,
        adjustTeamScore,
        setTeamScoreDirectly,
        setQuestionTimeInMinutes,
        clearAllTeams,
        removeTeam
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider');
  }
  return ctx;
};
