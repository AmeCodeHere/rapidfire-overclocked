import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, SkipForward, CheckCircle2, 
  XCircle, Zap, Clock, Users, ArrowRight, ShieldAlert,
  Edit3, HelpCircle
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { ManualPointAdjustment } from './ManualPointAdjustment';
import { LeaderboardExport } from './LeaderboardExport';

export const LiveControlPanel = () => {
  const { 
    session, 
    leaderboard, 
    handleCorrectAnswer, 
    handleWrongAnswer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addExtraFiveSeconds,
    skipToNextQuestion,
    updateSession,
    setQuestionTimeInMinutes
  } = useGame();

  const { isDark } = useTheme();

  const {
    questions = [],
    currentQuestionIndex = 0,
    teamOrder = [],
    currentTeamIndex = 0,
    attemptedTeamsForCurrentQuestion = [],
    currentTeamTimeRemaining = 60,
    perTeamTimerDurationSeconds = 60,
    basePointsPerCorrectAnswer = 10,
    timerStatus = 'paused',
    status = 'setup'
  } = session;

  const currentQ = questions[currentQuestionIndex];
  const currentTeam = teamOrder[currentTeamIndex] || `Team #${currentTeamIndex + 1}`;

  // Inline Correct Dropdown state
  const [showInlineCorrect, setShowInlineCorrect] = useState(false);
  const [selectedWinnerTeam, setSelectedWinnerTeam] = useState(currentTeam);
  const [showManualPointsModal, setShowManualPointsModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const handleSetMinutes = (mins) => {
    setQuestionTimeInMinutes(mins);
  };

  const handleApplyCustomMinutes = (e) => {
    e.preventDefault();
    const val = parseFloat(customMinutes);
    if (!isNaN(val) && val > 0) {
      setQuestionTimeInMinutes(val);
      setCustomMinutes('');
    }
  };

  const addExtraOneMinute = () => {
    updateSession(prev => ({
      currentTeamTimeRemaining: prev.currentTeamTimeRemaining + 60
    }));
  };

  // Update selected team whenever currentTeam changes
  useEffect(() => {
    if (currentTeam) {
      setSelectedWinnerTeam(currentTeam);
    }
  }, [currentTeam]);

  // Points calculation breakdown
  const timeRemaining = Math.max(0, currentTeamTimeRemaining);
  const passCount = attemptedTeamsForCurrentQuestion.length;
  const currentQuestionMultiplier = passCount + 1;
  const speedBonus = currentQuestionMultiplier * timeRemaining;
  const totalCalculatedPoints = basePointsPerCorrectAnswer + speedBonus;
  const currentPassBonus = speedBonus;

  // Silent keyboard shortcut handler
  // Note: NO shortcut labels/hints are shown on the UI!
  useKeyboardShortcuts({
    onCorrect: () => {
      // Reveal inline dropdown without blocking modal
      setShowInlineCorrect(true);
      setSelectedWinnerTeam(currentTeam);
    },
    onWrong: () => {
      // Immediately mark current team wrong and pass turn
      setShowInlineCorrect(false);
      handleWrongAnswer();
    },
    isEnabled: status === 'active' || status === 'setup'
  });

  const handleConfirmCorrect = () => {
    handleCorrectAnswer(selectedWinnerTeam);
    setShowInlineCorrect(false);
  };

  const handleStartRound = () => {
    updateSession({
      status: 'active',
      timerStatus: 'running'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Quick Actions Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              status === 'active' && timerStatus === 'running' 
                ? 'bg-overclock-green animate-ping' 
                : timerStatus === 'paused' ? 'bg-amber-400' : 'bg-slate-500'
            }`} />
            <span className={`font-mono text-xs font-bold uppercase tracking-wider ${
              status === 'active' ? (isDark ? 'text-overclock-cyan' : 'text-cyan-700') : 'text-slate-400'
            }`}>
              {status === 'active' ? (timerStatus === 'running' ? 'ROUND IN PROGRESS' : 'ROUND PAUSED') : 'READY FOR START'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status !== 'active' ? (
            <button
              type="button"
              onClick={handleStartRound}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-gradient-to-r from-overclock-orange to-rose-600 text-white shadow-glow-orange hover:scale-105 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch Rapid Fire Round
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {timerStatus === 'running' ? (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Pause Timer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeTimer}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-overclock-green/20 text-overclock-green border border-overclock-green/40 hover:bg-overclock-green/30 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-overclock-green" />
                  Resume Timer
                </button>
              )}

              <button
                type="button"
                onClick={resetTimer}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-all"
                title="Reset team timer to full duration"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Timer
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={addExtraOneMinute}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-all"
            title="Grant 1 extra minute"
          >
            <Plus className="w-3.5 h-3.5" />
            +1 min
          </button>

          <button
            type="button"
            onClick={addExtraFiveSeconds}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
            title="Grant 5 extra seconds"
          >
            <Plus className="w-3.5 h-3.5" />
            +5s
          </button>

          {/* Quick Minute Preset Controls */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase hidden xl:inline">Set Question Time:</span>
            {[0.5, 1, 1.5, 2].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => handleSetMinutes(mins)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                  perTeamTimerDurationSeconds === Math.round(mins * 60)
                    ? 'bg-overclock-red text-white'
                    : isDark ? 'bg-overclock-dark-800 text-slate-400 hover:text-white border border-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={`Set question timer to ${mins} minute(s)`}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Custom Manual Minute Input */}
          <form onSubmit={handleApplyCustomMinutes} className="flex items-center gap-1">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Min"
              className={`w-14 px-2 py-1.5 rounded-lg text-xs font-mono border focus:outline-none ${
                isDark ? 'bg-overclock-dark-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            <button
              type="submit"
              disabled={!customMinutes}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-overclock-cyan text-black hover:bg-cyan-300 disabled:opacity-40"
            >
              Set
            </button>
          </form>

          <button
            type="button"
            onClick={skipToNextQuestion}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-slate-500/15 text-slate-300 border border-slate-500/30 hover:text-white transition-all"
            title="Manually advance to next question"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip Question
          </button>

          <button
            type="button"
            onClick={() => setShowManualPointsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:text-white transition-all"
            title="Manually adjust team scores"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Adjust Scores
          </button>

          <LeaderboardExport />
        </div>
      </div>

      {/* Main Grid: Mirrored Live Display Card & Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question and Live Turn View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Question & Team Turn Card */}
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDark 
              ? 'bg-overclock-dark-900 border-overclock-dark-700 shadow-xl' 
              : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-inherit">
              <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${
                isDark ? 'bg-overclock-orange/15 text-overclock-orange border border-overclock-orange/30' : 'bg-orange-50 text-orange-600 border border-orange-200'
              }`}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">Team Countdown:</span>
                <div className={`px-3 py-1 rounded-xl font-mono font-black text-xl tabular-nums ${
                  currentTeamTimeRemaining <= 3 
                    ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 animate-pulse'
                    : isDark ? 'bg-overclock-cyan/15 text-overclock-cyan border border-overclock-cyan/30' : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                }`}>
                  {currentTeamTimeRemaining >= 60 
                    ? `${Math.floor(currentTeamTimeRemaining / 60)}:${String(currentTeamTimeRemaining % 60).padStart(2, '0')}` 
                    : `${currentTeamTimeRemaining}s`}
                </div>
              </div>
            </div>

            {/* Current Team Turn Highlight */}
            <div className={`p-4 rounded-2xl mb-5 flex items-center justify-between border ${
              isDark ? 'bg-overclock-dark-950 border-overclock-cyan/40 shadow-glow-cyan' : 'bg-cyan-50 border-cyan-300'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-overclock-cyan/20 text-overclock-cyan flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-overclock-cyan block font-bold">
                    CURRENT TEAM ATTEMPTING
                  </span>
                  <h3 className={`font-display font-black text-xl sm:text-2xl uppercase ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {currentTeam}
                  </h3>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-400">
                Seating #{currentTeamIndex + 1} of {teamOrder.length}
              </div>
            </div>

            {passCount > 0 && (
              <div className={`p-4 rounded-2xl mb-5 border flex items-center justify-between gap-4 ${
                isDark ? 'bg-overclock-orange/10 border-overclock-orange/40' : 'bg-orange-50 border-orange-200'
              }`}>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-overclock-orange block font-bold">
                    QUESTION PASSED {passCount} TIME{passCount === 1 ? '' : 'S'}
                  </span>
                  <p className={`text-xs font-mono mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Bonus increases for this team if they answer correctly.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-lg text-overclock-orange">
                    {currentQuestionMultiplier}x
                  </div>
                  <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    +{currentPassBonus} bonus pts
                  </div>
                </div>
              </div>
            )}

            {/* Question Text & Answer */}
            {currentQ ? (
              <div className="space-y-4">
                <h2 className={`font-display font-bold text-xl sm:text-2xl leading-snug ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  {currentQ.question}
                </h2>

                {currentQ.type === 'mcq' && currentQ.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentQ.options.map((opt, i) => {
                      const letter = ['A', 'B', 'C', 'D'][i] || `${i+1}`;
                      const isCorrect = currentQ.correctAnswer && (
                        currentQ.correctAnswer.toLowerCase().trim() === opt.toLowerCase().trim() ||
                        currentQ.correctAnswer.toLowerCase().trim() === letter.toLowerCase()
                      );
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                            isCorrect
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                              : isDark ? 'bg-overclock-dark-950/60 border-overclock-dark-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold ${
                            isCorrect ? 'bg-emerald-500 text-black' : isDark ? 'bg-overclock-dark-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {letter}
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrect && <span className="ml-auto text-[10px] font-mono uppercase bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">Key</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQ.correctAnswer && currentQ.type !== 'mcq' && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Host Answer Key: <strong>{currentQ.correctAnswer}</strong></span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 font-mono text-xs">
                No active question found.
              </div>
            )}
          </div>

          {/* ACTION BUTTONS (NO SHORTCUT LABELS VISIBLE - BACKGROUND SHORTCUTS ONLY) */}
          <div className={`p-6 rounded-3xl border transition-all ${
            isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-inherit">
              <h4 className={`font-display font-bold text-sm uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Host Live Scoring Action
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                Silent shortcuts active in background
              </span>
            </div>

            {/* Inline Correct Dropdown Box (Appears within layout on Correct shortcut or button) */}
            {showInlineCorrect ? (
              <div className={`p-5 rounded-2xl border mb-4 transition-all duration-300 animate-fadeIn ${
                isDark 
                  ? 'bg-emerald-950/40 border-overclock-green/60 shadow-glow-green' 
                  : 'bg-emerald-50 border-emerald-300 shadow-md'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <span className="text-[11px] font-mono uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                      Confirm Scoring Team
                    </span>
                    <select
                      value={selectedWinnerTeam}
                      onChange={(e) => setSelectedWinnerTeam(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-sm font-bold border focus:outline-none ${
                        isDark 
                          ? 'bg-overclock-dark-950 border-emerald-500/50 text-white' 
                          : 'bg-white border-emerald-400 text-slate-900'
                      }`}
                    >
                      {teamOrder.map(team => (
                        <option key={team} value={team}>
                          {team} {team === currentTeam ? '(Current Turn)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Calculated Points Breakdown */}
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
                    isDark ? 'bg-overclock-dark-900 border-emerald-500/30 text-emerald-300' : 'bg-white border-emerald-300 text-emerald-800'
                  }`}>
                    <div>
                      <span className="text-[10px] font-mono block text-slate-400 uppercase">
                        Score Breakdown
                      </span>
                      <span className="text-xs font-mono font-medium">
                        Base ({basePointsPerCorrectAnswer}) + Pass Bonus ({currentQuestionMultiplier} &times; {timeRemaining}s = {speedBonus})
                      </span>
                    </div>

                    <div className="text-right font-mono font-black text-xl text-overclock-green border-l pl-3 border-emerald-500/30">
                      +{totalCalculatedPoints}
                      <span className="text-[10px] block text-slate-400">PTS</span>
                    </div>
                  </div>

                  {/* Confirm / Cancel Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setShowInlineCorrect(false)}
                      className="px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCorrect}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase bg-overclock-green text-black hover:bg-emerald-300 shadow-glow-green transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Score
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Main Action Trigger Buttons (Labels do NOT mention shortcut keys!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowInlineCorrect(true);
                  setSelectedWinnerTeam(currentTeam);
                }}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl font-display font-extrabold text-base uppercase bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 hover:border-emerald-500 transition-all shadow-glow-green group"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Award Correct Answer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowInlineCorrect(false);
                  handleWrongAnswer();
                }}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl font-display font-extrabold text-base uppercase bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 hover:border-rose-500 transition-all shadow-glow-red group"
              >
                <XCircle className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Mark Wrong & Pass Turn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Leaderboard Snapshot */}
        <div>
          <div className={`p-5 rounded-3xl border h-full transition-all ${
            isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-inherit">
              <h4 className={`font-display font-bold text-sm uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Live Leaderboard Standings
              </h4>
              <button
                type="button"
                onClick={() => setShowManualPointsModal(true)}
                className="text-[11px] font-mono text-overclock-cyan hover:underline"
              >
                Adjust
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {teamOrder.map((team, idx) => {
                const score = leaderboard[team] !== undefined ? leaderboard[team] : 0;
                const isTurn = team === currentTeam;

                return (
                  <div
                    key={team}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isTurn
                        ? isDark ? 'bg-overclock-cyan/15 border-overclock-cyan/60 shadow-glow-cyan' : 'bg-cyan-50 border-cyan-300'
                        : isDark ? 'bg-overclock-dark-950 border-overclock-dark-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs text-slate-400">
                        {idx + 1}
                      </span>
                      <span className={`text-xs font-bold truncate ${
                        isTurn ? (isDark ? 'text-overclock-cyan' : 'text-cyan-800') : (isDark ? 'text-slate-200' : 'text-slate-800')
                      }`}>
                        {team}
                      </span>
                    </div>

                    <div className="font-mono font-bold text-sm tabular-nums">
                      {score} <span className="text-[10px] text-slate-500">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Score Adjustment Modal */}
      <ManualPointAdjustment
        isOpen={showManualPointsModal}
        onClose={() => setShowManualPointsModal(false)}
      />
    </div>
  );
};
