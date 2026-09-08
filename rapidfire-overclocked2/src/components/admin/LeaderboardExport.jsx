import React, { useState } from 'react';
import { Download, FileSpreadsheet, Check, ChevronDown } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { downloadLeaderboardFile } from '../../utils/exportLeaderboard';

export const LeaderboardExport = ({ className = '' }) => {
  const { leaderboard, session } = useGame();
  const { isDark } = useTheme();

  const [downloadMsg, setDownloadMsg] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleDownload = (format = 'csv') => {
    try {
      const filename = downloadLeaderboardFile(leaderboard, session.teamOrder, format);
      setDownloadMsg(`Saved ${filename}`);
      setShowOptions(false);
      setTimeout(() => setDownloadMsg(''), 3000);
    } catch (e) {
      console.error('Download error:', e);
      setDownloadMsg('Export failed.');
      setTimeout(() => setDownloadMsg(''), 3000);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => handleDownload('csv')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-l-xl text-xs font-mono font-bold uppercase transition-all border ${
            isDark
              ? 'bg-overclock-dark-800 hover:bg-overclock-dark-700 text-slate-200 border-overclock-dark-700 hover:border-slate-500'
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
          }`}
          title="Download current leaderboard standings as CSV"
        >
          {downloadMsg ? <Check className="w-3.5 h-3.5 text-overclock-green" /> : <Download className="w-3.5 h-3.5 text-overclock-cyan" />}
          <span>{downloadMsg || 'Download Leaderboard'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowOptions(prev => !prev)}
          className={`p-2 rounded-r-xl border-y border-r transition-all ${
            isDark
              ? 'bg-overclock-dark-800 hover:bg-overclock-dark-700 text-slate-300 border-overclock-dark-700'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
          }`}
          title="Select format (CSV or Excel)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {showOptions && (
        <div className={`absolute right-0 mt-1.5 w-44 rounded-xl border shadow-xl z-30 py-1 ${
          isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => handleDownload('csv')}
            className={`w-full px-3 py-2 text-left text-xs font-mono flex items-center gap-2 ${
              isDark ? 'hover:bg-overclock-dark-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-overclock-cyan" />
            <span>CSV Format (.csv)</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownload('xlsx')}
            className={`w-full px-3 py-2 text-left text-xs font-mono flex items-center gap-2 ${
              isDark ? 'hover:bg-overclock-dark-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel Sheet (.xlsx)</span>
          </button>
        </div>
      )}
    </div>
  );
};
