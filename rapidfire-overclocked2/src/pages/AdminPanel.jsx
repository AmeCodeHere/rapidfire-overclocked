import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { LiveControlPanel } from '../components/admin/LiveControlPanel';
import { QuestionSetup } from '../components/admin/QuestionSetup';
import { TeamSetup } from '../components/admin/TeamSetup';
import { ScoringSetup } from '../components/admin/ScoringSetup';
import { 
  Play, ListOrdered, Users, Settings2, 
  RotateCcw, ShieldCheck, Check, Wifi 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';

export const AdminPanel = () => {
  const { session, resetRound, isConnectedToFirebase } = useGame();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'questions' | 'teams' | 'scoring'
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col tech-grid-bg transition-colors duration-300 ${
      isDark ? 'bg-overclock-dark-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Brand Header */}
      <Header subtitle="HOST CONTROL CENTER" />

      {/* Admin Shell */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className={`p-2 rounded-2xl border flex flex-wrap items-center justify-between gap-2 ${
          isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'live'
                  ? 'bg-overclock-orange text-white shadow-glow-orange'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-overclock-dark-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Live Control
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'questions'
                  ? 'bg-overclock-cyan text-black shadow-glow-cyan'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-overclock-dark-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Questions ({session.questions?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'teams'
                  ? 'bg-overclock-cyan text-black shadow-glow-cyan'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-overclock-dark-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Teams & Seating ({session.teamOrder?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scoring')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'scoring'
                  ? 'bg-overclock-cyan text-black shadow-glow-cyan'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-overclock-dark-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Scoring & Rules
            </button>
          </div>

          {/* Reset Round button */}
          <div className="flex items-center gap-2">
            {showResetConfirm ? (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-red-500/20 border border-red-500/40">
                <span className="text-[11px] font-mono text-red-300 px-2">Confirm Reset?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetRound();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase bg-red-600 text-white"
                >
                  Yes, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 text-xs font-mono text-slate-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
                title="Reset session to question 1 and 0 points"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Game
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1">
          {activeTab === 'live' && <LiveControlPanel />}
          {activeTab === 'questions' && <QuestionSetup />}
          {activeTab === 'teams' && <TeamSetup />}
          {activeTab === 'scoring' && <ScoringSetup />}
        </div>
      </main>
    </div>
  );
};
