import React, { useState, useRef } from 'react';
import { 
  Plus, Upload, Trash2, ArrowUp, ArrowDown, Users, 
  Sparkles, Check, AlertCircle, RefreshCw, GripVertical
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { parseTeamListFromFile } from '../../utils/fileParser';
import { SAMPLE_TEAMS } from '../../utils/sampleData';

export const TeamSetup = () => {
  const { session, leaderboard, updateSession, updateLeaderboard, clearAllTeams } = useGame();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);

  const teamOrder = session.teamOrder || [];

  const [newTeamName, setNewTeamName] = useState('');
  const [initialScore, setInitialScore] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleAddTeam = (e) => {
    e.preventDefault();
    const trimmed = newTeamName.trim();
    if (!trimmed) return;

    if (teamOrder.includes(trimmed)) {
      setUploadError(`Team "${trimmed}" is already in the seating order.`);
      return;
    }

    const updatedTeams = [...teamOrder, trimmed];
    updateSession({ teamOrder: updatedTeams });

    // Update leaderboard with starting score
    updateLeaderboard({ [trimmed]: Number(initialScore) || 0 });

    setNewTeamName('');
    setInitialScore(0);
    setUploadError('');
  };

  const handleRemoveTeam = (teamName) => {
    const updated = teamOrder.filter(t => t !== teamName);
    updateSession({
      teamOrder: updated,
      currentTeamIndex: Math.min(session.currentTeamIndex, Math.max(0, updated.length - 1))
    });

    const newLeaderboard = { ...leaderboard };
    delete newLeaderboard[teamName];
    updateLeaderboard(newLeaderboard);
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= teamOrder.length) return;
    const updated = [...teamOrder];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    updateSession({ teamOrder: updated });
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...teamOrder];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setDraggedIndex(null);
    updateSession({ teamOrder: updated });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    try {
      const parsedTeams = await parseTeamListFromFile(file);
      updateSession({
        teamOrder: parsedTeams,
        currentTeamIndex: 0
      });

      // Reset leaderboard to 0 points for these teams
      const newBoard = {};
      parsedTeams.forEach(t => {
        newBoard[t] = leaderboard[t] !== undefined ? leaderboard[t] : 0;
      });
      updateLeaderboard(newBoard);

      setUploadSuccess(`Extracted ${parsedTeams.length} teams from ${file.name} (ignored extra export columns)!`);
    } catch (err) {
      setUploadError(err.message || 'Error processing file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleTeams = () => {
    updateSession({
      teamOrder: SAMPLE_TEAMS,
      currentTeamIndex: 0
    });
    const sampleBoard = {};
    SAMPLE_TEAMS.forEach(t => {
      sampleBoard[t] = 0;
    });
    updateLeaderboard(sampleBoard);
    setUploadSuccess(`Loaded ${SAMPLE_TEAMS.length} sample esports/tech teams!`);
  };

  return (
    <div className="space-y-6">
      {/* Banner & Upload Controls */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDark ? 'bg-overclock-dark-850/80 border-overclock-dark-700' : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          <h3 className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Physical Seating Order & Teams ({teamOrder.length} Teams)
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Reorder to match physical seating arrangement on stage. Turn passes sequentially along this list.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all border ${
              isDark
                ? 'bg-overclock-dark-800 hover:bg-overclock-dark-700 text-overclock-cyan border-overclock-cyan/40 hover:border-overclock-cyan'
                : 'bg-white hover:bg-slate-100 text-cyan-700 border-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File (Slido / CSV / XLSX)
          </button>

          <button
            type="button"
            onClick={handleLoadSampleTeams}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all border ${
              isDark
                ? 'bg-overclock-orange/15 hover:bg-overclock-orange/25 text-overclock-orange border-overclock-orange/40 shadow-glow-orange'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Teams
          </button>

          {teamOrder.length > 0 && (
            showClearConfirm ? (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-red-500/20 border border-red-500/40">
                <span className="text-[11px] font-mono text-red-300 px-1">Clear all {teamOrder.length} teams?</span>
                <button
                  type="button"
                  onClick={() => {
                    clearAllTeams();
                    setShowClearConfirm(false);
                    setUploadSuccess("All teams have been removed.");
                  }}
                  className="px-2 py-1 rounded-lg text-xs font-mono font-bold uppercase bg-red-600 text-white"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 text-xs font-mono text-slate-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/40 transition-all"
                title="Remove all teams from the seating order"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Teams
              </button>
            )
          )}
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Manual Team Addition Form */}
      <form
        onSubmit={handleAddTeam}
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-end gap-3 ${
          isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex-1 w-full">
          <label className={`block text-xs font-mono uppercase tracking-wider mb-1 font-semibold ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Team Name *
          </label>
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="e.g. CyberPunks"
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium border focus:outline-none ${
              isDark
                ? 'bg-overclock-dark-950 border-overclock-dark-700 text-white focus:border-overclock-cyan'
                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-overclock-cyan'
            }`}
            required
          />
        </div>

        <div className="w-full sm:w-32">
          <label className={`block text-xs font-mono uppercase tracking-wider mb-1 font-semibold ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Initial Pts
          </label>
          <input
            type="number"
            value={initialScore}
            onChange={(e) => setInitialScore(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono border focus:outline-none ${
              isDark
                ? 'bg-overclock-dark-950 border-overclock-dark-700 text-white focus:border-overclock-cyan'
                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-overclock-cyan'
            }`}
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase bg-overclock-cyan text-black hover:bg-cyan-300 shadow-glow-cyan transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Team
        </button>
      </form>

      {/* Seating Order List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className={`font-display font-bold text-sm uppercase tracking-wider ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Physical Seating Sequence (Drag or use arrows to rearrange)
          </h4>
          <span className="text-xs font-mono text-slate-500">
            Current turn index: #{session.currentTeamIndex + 1} ({teamOrder[session.currentTeamIndex] || 'None'})
          </span>
        </div>

        {teamOrder.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center font-mono text-xs ${
            isDark ? 'bg-overclock-dark-900/40 border-overclock-dark-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            No teams configured. Add teams using the form above or import an event sheet.
          </div>
        ) : (
          teamOrder.map((team, idx) => {
            const isTurn = session.currentTeamIndex === idx;
            const points = leaderboard[team] !== undefined ? leaderboard[team] : 0;

            return (
              <div
                key={team}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing ${
                  isTurn
                    ? isDark
                      ? 'bg-overclock-cyan/15 border-overclock-cyan/50 shadow-glow-cyan'
                      : 'bg-cyan-50 border-cyan-300 shadow-sm'
                    : isDark
                      ? 'bg-overclock-dark-900 border-overclock-dark-700 hover:border-slate-600'
                      : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />

                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                    isTurn
                      ? 'bg-overclock-cyan text-black'
                      : isDark ? 'bg-overclock-dark-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>

                  <div className="min-w-0">
                    <span className={`font-body font-bold text-sm sm:text-base truncate block ${
                      isTurn ? isDark ? 'text-overclock-cyan' : 'text-cyan-800' : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {team}
                    </span>
                    {isTurn && (
                      <span className="text-[10px] font-mono uppercase tracking-widest text-overclock-cyan font-bold">
                        &larr; UP FIRST / CURRENT TURN
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 mr-2">
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{points}</strong> pts
                  </span>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20"
                    title="Move Earlier in Seating"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={idx === teamOrder.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20"
                    title="Move Later in Seating"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveTeam(team)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400"
                    title="Remove Team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
