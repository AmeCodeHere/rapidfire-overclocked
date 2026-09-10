import React from 'react';
import { Settings, Zap, Clock, Timer, RotateCcw, ArrowRight } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

export const ScoringSetup = () => {
  const { session, updateSession } = useGame();
  const { isDark } = useTheme();

  const {
    basePointsPerCorrectAnswer = 10,
    perTeamTimerDurationSeconds = 15,
    totalRoundTimerDurationSeconds = 600
  } = session;

  const handleChange = (key, value) => {
    updateSession({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-2xl border ${
        isDark ? 'bg-overclock-dark-850/80 border-overclock-dark-700' : 'bg-slate-50 border-slate-200'
      }`}>
        <h3 className={`font-display font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Scoring Rules & Timer Constraints
        </h3>
        <p className="text-xs font-mono text-slate-400">
          Configure points awarded, speed bonus formula, and per-team countdown constraints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Base Points */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-overclock-cyan/15 text-overclock-cyan border border-overclock-cyan/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`font-display font-bold text-sm uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Base Points per Correct Answer
              </h4>
              <p className="text-[11px] font-mono text-slate-400">Standard points granted for answering correctly.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="100"
              value={basePointsPerCorrectAnswer}
              onChange={(e) => handleChange('basePointsPerCorrectAnswer', Math.max(1, Number(e.target.value)))}
              className={`w-32 px-4 py-2.5 rounded-xl font-mono text-lg font-bold border focus:outline-none ${
                isDark
                  ? 'bg-overclock-dark-950 border-overclock-dark-700 text-white focus:border-overclock-cyan'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-overclock-cyan'
              }`}
            />
            <span className="text-xs font-mono text-slate-500">points (Default: 10)</span>
          </div>
        </div>

        {/* Question Timer Duration in Minutes */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-rose-500/15 text-overclock-red border border-rose-500/30">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`font-display font-bold text-sm uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Question Time Limit (in Minutes)
              </h4>
              <p className="text-[11px] font-mono text-slate-400">Duration allocated per team turn in minutes.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.25"
                value={Math.round((perTeamTimerDurationSeconds / 60) * 100) / 100}
                onChange={(e) => {
                  const mins = Math.max(0.1, Number(e.target.value));
                  const secs = Math.round(mins * 60);
                  handleChange('perTeamTimerDurationSeconds', secs);
                  handleChange('currentTeamTimeRemaining', secs);
                }}
                className={`w-32 px-4 py-2.5 rounded-xl font-mono text-lg font-bold border focus:outline-none ${
                  isDark
                    ? 'bg-overclock-dark-950 border-overclock-dark-700 text-white focus:border-overclock-red'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-overclock-red'
                }`}
              />
              <span className="text-xs font-mono text-slate-400">
                minutes <strong>({perTeamTimerDurationSeconds}s)</strong>
              </span>
            </div>

            {/* Quick minute presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { label: '0.5 min (30s)', mins: 0.5 },
                { label: '1 min (60s)', mins: 1 },
                { label: '1.5 min (90s)', mins: 1.5 },
                { label: '2 min (120s)', mins: 2 }
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const secs = Math.round(preset.mins * 60);
                    handleChange('perTeamTimerDurationSeconds', secs);
                    handleChange('currentTeamTimeRemaining', secs);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                    perTeamTimerDurationSeconds === Math.round(preset.mins * 60)
                      ? 'bg-overclock-red text-white'
                      : isDark ? 'bg-overclock-dark-950 text-slate-400 hover:text-white border border-overclock-dark-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Round Duration in Minutes */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`font-display font-bold text-sm uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Total Round Duration (in Minutes)
              </h4>
              <p className="text-[11px] font-mono text-slate-400">Overall time budget for this Rapid Fire round.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="60"
                step="1"
                value={Math.round(totalRoundTimerDurationSeconds / 60)}
                onChange={(e) => {
                  const mins = Math.max(1, Number(e.target.value));
                  const secs = mins * 60;
                  handleChange('totalRoundTimerDurationSeconds', secs);
                  handleChange('totalRoundTimeRemaining', secs);
                }}
                className={`w-32 px-4 py-2.5 rounded-xl font-mono text-lg font-bold border focus:outline-none ${
                  isDark
                    ? 'bg-overclock-dark-950 border-overclock-dark-700 text-white focus:border-purple-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-400'
                }`}
              />
              <span className="text-xs font-mono text-slate-400">
                minutes <strong>({totalRoundTimerDurationSeconds}s)</strong>
              </span>
            </div>

            {/* Quick round presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[5, 10, 15, 20].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    const secs = mins * 60;
                    handleChange('totalRoundTimerDurationSeconds', secs);
                    handleChange('totalRoundTimeRemaining', secs);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                    totalRoundTimerDurationSeconds === mins * 60
                      ? 'bg-purple-600 text-white'
                      : isDark ? 'bg-overclock-dark-950 text-slate-400 hover:text-white border border-overclock-dark-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h4 className={`font-display font-bold text-sm uppercase mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Equal Team Turns
        </h4>
        <p className="text-xs font-mono text-slate-400">
          Each turn advances to the next team and a new question after a correct answer. Incorrect answers pass the current question to the next team.
        </p>
      </div>
    </div>
  );
};
