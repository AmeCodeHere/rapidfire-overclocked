import React, { useState } from 'react';
import { X, Plus, Minus, Edit3, ShieldAlert, Check } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

export const ManualPointAdjustment = ({ isOpen, onClose }) => {
  const { leaderboard, session, adjustTeamScore, setTeamScoreDirectly } = useGame();
  const { isDark } = useTheme();

  const [selectedTeam, setSelectedTeam] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const teamList = session.teamOrder || Object.keys(leaderboard);

  const handleAdjust = (team, delta) => {
    adjustTeamScore(team, delta);
    setFeedback(`Updated ${team}: ${delta > 0 ? `+${delta}` : delta} pts`);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleSetExact = (e) => {
    e.preventDefault();
    if (!selectedTeam || customValue === '') return;
    setTeamScoreDirectly(selectedTeam, Number(customValue));
    setFeedback(`Set ${selectedTeam} score to ${customValue} pts`);
    setCustomValue('');
    setTimeout(() => setFeedback(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl transition-all ${
        isDark ? 'bg-overclock-dark-900 border-overclock-dark-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-inherit">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-overclock-orange/20 text-overclock-orange">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Score Override Tool</h3>
              <p className="text-xs font-mono text-slate-400">Manual adjustments for technical delays or disputes</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="mb-4 p-2.5 rounded-xl bg-overclock-cyan/15 border border-overclock-cyan/40 text-overclock-cyan text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Team Score List with Quick Buttons */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-5">
          {teamList.map((team) => {
            const score = leaderboard[team] !== undefined ? leaderboard[team] : 0;
            return (
              <div
                key={team}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-overclock-dark-950 border-overclock-dark-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="min-w-0">
                  <span className="font-bold text-sm truncate block">{team}</span>
                  <span className="text-xs font-mono text-slate-400 font-bold">{score} pts</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjust(team, -5)}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjust(team, -1)}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjust(team, +1)}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjust(team, +5)}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjust(team, +10)}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-overclock-cyan/20 text-overclock-cyan hover:bg-overclock-cyan/30 border border-overclock-cyan/40"
                  >
                    +10
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Exact score form */}
        <form onSubmit={handleSetExact} className="pt-3 border-t border-inherit flex items-center gap-2">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none ${
              isDark ? 'bg-overclock-dark-950 border-overclock-dark-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="">Select Team to Set Exact Score</option>
            {teamList.map(t => (
              <option key={t} value={t}>{t} (Currently: {leaderboard[t] || 0} pts)</option>
            ))}
          </select>

          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Score"
            className={`w-20 px-3 py-2 rounded-xl text-xs font-mono font-bold border focus:outline-none ${
              isDark ? 'bg-overclock-dark-950 border-overclock-dark-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />

          <button
            type="submit"
            disabled={!selectedTeam || customValue === ''}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-overclock-orange text-white hover:bg-orange-600 disabled:opacity-40"
          >
            Set
          </button>
        </form>
      </div>
    </div>
  );
};
