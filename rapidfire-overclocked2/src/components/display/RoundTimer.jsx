import React from 'react';
import { Clock } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

export const RoundTimer = () => {
  const { session } = useGame();
  const { isDark } = useTheme();

  const totalSeconds = session.totalRoundTimeRemaining ?? session.totalRoundTimerDurationSeconds ?? 600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = totalSeconds <= 60 && totalSeconds > 0;

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
      isLowTime
        ? isDark 
          ? 'bg-rose-950/40 border-overclock-red shadow-glow-red animate-pulse' 
          : 'bg-rose-50 border-rose-400 text-rose-700 animate-pulse'
        : isDark
          ? 'bg-overclock-dark-850/80 border-overclock-dark-700 text-slate-200'
          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      <div className={`p-1.5 rounded-lg ${
        isLowTime 
          ? 'bg-overclock-red text-white' 
          : isDark ? 'bg-overclock-dark-700 text-overclock-cyan' : 'bg-slate-100 text-slate-600'
      }`}>
        <Clock className="w-4 h-4" />
      </div>

      <div>
        <span className={`text-[10px] font-mono tracking-widest uppercase block ${
          isLowTime ? 'text-overclock-red font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Round Time Remaining
        </span>
        <span className={`font-mono font-black text-2xl tracking-wider ${
          isLowTime
            ? 'text-overclock-red text-glow-red'
            : isDark ? 'text-slate-100 font-display' : 'text-slate-900 font-display'
        }`}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
