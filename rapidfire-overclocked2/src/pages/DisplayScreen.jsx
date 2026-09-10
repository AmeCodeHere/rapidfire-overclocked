import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '../components/common/Header';
import { QuestionDisplay } from '../components/display/QuestionDisplay';
import { TurnIndicator } from '../components/display/TurnIndicator';
import { RoundTimer } from '../components/display/RoundTimer';
import { LeaderboardCard } from '../components/display/LeaderboardCard';
import { FeedbackFlash } from '../components/display/FeedbackFlash';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { Zap, Trophy, Shield } from 'lucide-react';

export const DisplayScreen = () => {
  const { session, leaderboard } = useGame();
  const { isDark } = useTheme();
  const { playRoundConcluded } = useSoundEffects();

  const isEnded = session.status === 'ended';

  useEffect(() => {
    if (!isEnded) return undefined;

    playRoundConcluded();
    const celebration = [
      confetti({ particleCount: 140, spread: 100, startVelocity: 55, origin: { x: 0.1, y: 0.7 } }),
      confetti({ particleCount: 140, spread: 100, startVelocity: 55, origin: { x: 0.9, y: 0.7 } })
    ];
    const followUp = window.setTimeout(() => {
      confetti({ particleCount: 180, spread: 120, startVelocity: 35, origin: { x: 0.5, y: 0.45 } });
    }, 450);

    return () => {
      celebration.forEach(animation => animation?.reset?.());
      window.clearTimeout(followUp);
    };
  }, [isEnded, playRoundConcluded]);

  // Find winner if ended
  const topTeam = Object.entries(leaderboard || {})
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className={`min-h-screen flex flex-col tech-grid-bg transition-colors duration-300 ${
      isDark ? 'bg-overclock-dark-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Brand Header with Theme Toggle */}
      <Header subtitle="AUDIENCE PROJECTOR DISPLAY" />

      {/* Main Production Stage Container */}
      <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Production Telemetry Bar: Event Title & Round Timer */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-overclock-orange/20 to-overclock-red/20 border border-overclock-orange/40">
              <Zap className="w-4 h-4 text-overclock-orange animate-pulse" />
              <span className="font-display font-black text-sm tracking-wider uppercase text-overclock-orange">
                RAPID FIRE SHOWDOWN
              </span>
            </div>

            <span className="hidden sm:inline text-xs font-mono text-slate-400">
              Tech Fest 2026 // Stage A
            </span>
          </div>

          <RoundTimer />
        </div>

        {isEnded ? (
          /* Round Completed Trophy Showcase */
          <div className={`flex-1 flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border text-center my-auto ${
            isDark ? 'bg-overclock-dark-900 border-overclock-dark-700 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <div className="w-24 h-24 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center mb-6 shadow-glow-orange animate-bounce">
              <Trophy className="w-14 h-14 text-yellow-400" />
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl tracking-wider uppercase mb-2 bg-gradient-to-r from-yellow-400 via-overclock-orange to-rose-500 bg-clip-text text-transparent">
              ROUND CONCLUDED!
            </h1>

            {topTeam && (
              <div className="my-6 p-6 rounded-2xl bg-overclock-dark-950 border border-yellow-500/50 max-w-md w-full shadow-glow-orange">
                <span className="text-xs font-mono text-yellow-400 uppercase tracking-widest block font-bold mb-1">
                  1st Place Champion
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase">
                  {topTeam[0]}
                </h2>
                <span className="font-mono font-bold text-xl text-yellow-400 mt-2 block">
                  {topTeam[1]} Total Points
                </span>
              </div>
            )}

            <div className="w-full max-w-2xl mt-4">
              <LeaderboardCard />
            </div>
          </div>
        ) : (
          /* Live Game Grid: Main Arena & Leaderboard */
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)] gap-6 flex-1 items-stretch">
            {/* Left 8 Cols: Current Turn Indicator & Large Question Card */}
            <div className="min-w-0 flex flex-col gap-6">
              <TurnIndicator />
              <QuestionDisplay />
            </div>

            {/* Right 4 Cols: Live Tournament Leaderboard */}
            <div className="min-w-0 h-full">
              <LeaderboardCard />
            </div>
          </div>
        )}
      </main>

      {/* Screen Flash Overlay & Audio Feedback */}
      <FeedbackFlash />
    </div>
  );
};
