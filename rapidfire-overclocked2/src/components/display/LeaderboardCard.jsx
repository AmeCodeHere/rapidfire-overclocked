import React, { useMemo } from 'react';
import { Trophy, Award, Medal } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

export const LeaderboardCard = () => {
  const { leaderboard, session } = useGame();
  const { isDark } = useTheme();

  const { teamOrder = [], currentTeamIndex = 0 } = session;
  const currentTeamName = teamOrder[currentTeamIndex];

  // Merge teamOrder to ensure all teams appear even if 0 points
  const sortedTeams = useMemo(() => {
    const map = { ...leaderboard };
    teamOrder.forEach(team => {
      if (map[team] === undefined) {
        map[team] = 0;
      }
    });

    return Object.entries(map)
      .map(([name, pts]) => ({
        name,
        points: Number(pts) || 0
      }))
      .sort((a, b) => b.points - a.points);
  }, [leaderboard, teamOrder]);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-yellow-400 text-black font-black text-xs shadow-glow-orange">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-300 text-black font-black text-xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-700 text-white font-black text-xs">
          3
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-lg text-slate-500 font-mono text-xs font-bold">
        {rank}
      </span>
    );
  };

  return (
    <div className={`w-full rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col h-full ${
      isDark 
        ? 'bg-overclock-dark-900/95 border-overclock-dark-700 shadow-2xl' 
        : 'bg-white border-slate-200 shadow-lg'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-3 border-b border-inherit">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-sm">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`font-display font-bold text-lg leading-tight uppercase tracking-wider ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Leaderboard
            </h3>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              Live Points
            </span>
          </div>
        </div>

        <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
          isDark 
            ? 'bg-overclock-dark-800 text-slate-300 border-overclock-dark-700' 
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {sortedTeams.length} Teams
        </span>
      </div>

      {/* Leaderboard Table List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[480px]">
        {sortedTeams.length === 0 ? (
          <div className="p-6 text-center text-slate-500 font-mono text-xs">
            No teams registered yet.
          </div>
        ) : (
          sortedTeams.map((item, index) => {
            const rank = index + 1;
            const isTurn = item.name === currentTeamName;

            return (
              <div
                key={item.name}
                className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 ${
                  isTurn
                    ? isDark
                      ? 'bg-overclock-cyan/15 border-overclock-cyan/60 shadow-glow-cyan transform scale-[1.02]'
                      : 'bg-cyan-50 border-cyan-300 shadow-md transform scale-[1.02]'
                    : isDark
                      ? 'bg-overclock-dark-850/70 border-overclock-dark-700/60 hover:border-slate-600'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(rank)}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-body font-bold text-sm sm:text-base truncate block ${
                        isTurn 
                          ? isDark ? 'text-overclock-cyan font-extrabold' : 'text-cyan-800 font-extrabold'
                          : isDark ? 'text-slate-100' : 'text-slate-800'
                      }`}>
                        {item.name}
                      </span>
                      {isTurn && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          isDark ? 'bg-overclock-cyan text-black' : 'bg-cyan-600 text-white'
                        }`}>
                          UP NOW
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <span className={`font-mono font-black text-base sm:text-lg tabular-nums ${
                    rank === 1
                      ? 'text-yellow-400 font-display'
                      : isTurn
                        ? isDark ? 'text-overclock-cyan' : 'text-cyan-700'
                        : isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {item.points}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 ml-1">pts</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
