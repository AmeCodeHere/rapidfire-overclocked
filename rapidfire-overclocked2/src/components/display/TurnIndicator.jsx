import React from 'react';
import { Users, Flame, FastForward, Pause, Play } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

export const TurnIndicator = () => {
  const { session } = useGame();
  const { isDark } = useTheme();

  const {
    teamOrder = [],
    currentTeamIndex = 0,
    currentTeamTimeRemaining = 15,
    perTeamTimerDurationSeconds = 15,
    timerStatus = 'paused'
  } = session;

  const currentTeam = teamOrder[currentTeamIndex] || "No Team Selected";
  const nextTeamIndex = teamOrder.length > 0 ? (currentTeamIndex + 1) % teamOrder.length : 0;
  const nextTeam = teamOrder[nextTeamIndex] || "";

  // Visual calculations for per-team timer
  const percentage = Math.max(0, Math.min(100, (currentTeamTimeRemaining / (perTeamTimerDurationSeconds || 15)) * 100));
  const isUrgent = currentTeamTimeRemaining <= 3 && currentTeamTimeRemaining > 0;
  const isWarning = currentTeamTimeRemaining <= 6 && !isUrgent;

  // Colors: Cyan -> Orange -> Red
  let timerColorClass = 'text-overclock-cyan text-glow-cyan';
  let barColorClass = 'bg-gradient-to-r from-overclock-cyan to-teal-400 shadow-glow-cyan';
  let badgeBorderClass = 'border-overclock-cyan/40';

  if (isUrgent) {
    timerColorClass = 'text-overclock-red text-glow-red animate-pulse';
    barColorClass = 'bg-gradient-to-r from-rose-600 to-overclock-red shadow-glow-red';
    badgeBorderClass = 'border-overclock-red shadow-glow-red animate-pulse';
  } else if (isWarning) {
    timerColorClass = 'text-overclock-orange text-glow-orange';
    barColorClass = 'bg-gradient-to-r from-amber-500 to-overclock-orange shadow-glow-orange';
    badgeBorderClass = 'border-overclock-orange/50';
  }

  return (
    <div className={`w-full rounded-3xl p-6 sm:p-7 border transition-all duration-300 relative overflow-hidden ${
      isDark
        ? 'bg-gradient-to-br from-overclock-dark-900 via-overclock-dark-850 to-overclock-dark-900 border-overclock-dark-700 shadow-xl'
        : 'bg-white border-slate-200 shadow-lg'
    }`}>
      {/* Progress Bar background track */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800/40">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Current Team Badge */}
        <div className="flex items-center gap-4 sm:gap-5 w-full lg:w-auto">
          <div className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-[2px] transition-transform duration-300 ${
            isUrgent ? 'scale-105' : ''
          }`}>
            <div className={`absolute inset-0 rounded-2xl ${
              isUrgent ? 'bg-overclock-red animate-ping opacity-30' : 'bg-overclock-cyan opacity-20'
            }`} />
            <div className={`relative w-full h-full rounded-2xl flex items-center justify-center border-2 ${badgeBorderClass} ${
              isDark ? 'bg-overclock-dark-950' : 'bg-slate-100'
            }`}>
              <Flame className={`w-7 h-7 sm:w-8 sm:h-8 ${
                isUrgent ? 'text-overclock-red animate-bounce' : isWarning ? 'text-overclock-orange' : 'text-overclock-cyan'
              }`} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 ${
                isDark ? 'text-overclock-cyan' : 'text-cyan-700'
              }`}>
                <Users className="w-3.5 h-3.5" />
                CURRENT TURN
              </span>
              {timerStatus === 'paused' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                  <Pause className="w-2.5 h-2.5" /> PAUSED
                </span>
              )}
            </div>

            <h1 className={`font-display font-black text-2xl sm:text-3xl md:text-4xl tracking-tight uppercase truncate max-w-[320px] sm:max-w-md ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {currentTeam}
            </h1>

            {nextTeam && (
              <p className={`text-xs font-mono flex items-center gap-1.5 mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <FastForward className="w-3 h-3 text-slate-400" />
                <span>Next up: <span className="font-semibold text-slate-300">{nextTeam}</span></span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Per-Team Countdown Timer (Visually Distinct) */}
        <div className={`flex items-center justify-between sm:justify-end gap-5 w-full lg:w-auto px-6 py-3 rounded-2xl border ${
          isDark 
            ? 'bg-overclock-dark-950/80 border-overclock-dark-700' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="text-left sm:text-right">
            <span className={`text-[11px] font-mono uppercase tracking-widest block font-bold ${
              isUrgent ? 'text-overclock-red' : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Team Timer
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {timerStatus === 'running' ? 'Active' : 'Standby'}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className={`font-mono font-black text-4xl sm:text-5xl tracking-tighter tabular-nums ${timerColorClass}`}>
              {currentTeamTimeRemaining >= 60
                ? `${Math.floor(currentTeamTimeRemaining / 60)}:${String(currentTeamTimeRemaining % 60).padStart(2, '0')}`
                : String(currentTeamTimeRemaining).padStart(2, '0')
              }
            </span>
            <span className={`font-mono text-lg font-bold ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {currentTeamTimeRemaining >= 60 ? 'm' : 's'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
