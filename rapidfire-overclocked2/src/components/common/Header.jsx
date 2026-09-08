import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Tv, ShieldCheck, Wifi, Radio } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

export const Header = ({ subtitle = "RAPID FIRE // LIVE" }) => {
  const location = useLocation();
  const { isConnectedToFirebase, session } = useGame();
  const { isDark } = useTheme();

  const isDisplay = location.pathname === '/rapidfire';
  const isAdmin = location.pathname === '/rapidfire/admin';

  return (
    <header className={`w-full border-b transition-colors duration-300 ${
      isDark 
        ? 'bg-overclock-dark-900/90 border-overclock-dark-700/80 backdrop-blur-md' 
        : 'bg-white/90 border-slate-200 backdrop-blur-md'
    } sticky top-0 z-40 px-4 md:px-8 py-3.5`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-overclock-orange via-overclock-red to-overclock-cyan p-[2px] shadow-glow-orange group-hover:scale-105 transition-transform duration-300">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isDark ? 'bg-overclock-dark-950' : 'bg-slate-900'}`}>
              <Zap className="w-5 h-5 text-overclock-cyan fill-overclock-cyan animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold tracking-wider text-xl md:text-2xl bg-gradient-to-r from-overclock-orange via-rose-500 to-overclock-cyan bg-clip-text text-transparent">
                OVERCLOCKED
              </span>
              <span className={`text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded border uppercase font-bold ${
                isDark 
                  ? 'bg-overclock-cyan/10 border-overclock-cyan/30 text-overclock-cyan' 
                  : 'bg-cyan-50 border-cyan-200 text-cyan-700'
              }`}>
                2026
              </span>
            </div>
            <p className={`text-xs font-mono font-medium tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          </div>
        </Link>

        {/* Middle Status Indicators (Display or Admin) */}
        <div className="hidden sm:flex items-center gap-2">
          {session.status === 'active' && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
              isDark 
                ? 'bg-overclock-red/10 border-overclock-red/40 text-overclock-red' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-overclock-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-overclock-red"></span>
              </span>
              LIVE ROUND
            </div>
          )}

          {/* Sync indicator */}
          <div 
            title={isConnectedToFirebase ? "Synced with Firebase Realtime Database" : "Synced via High-Speed Local Broadcast (Dual-Screen Sync Active)"}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
              isConnectedToFirebase
                ? isDark 
                  ? 'bg-overclock-green/10 border-overclock-green/30 text-overclock-green' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : isDark 
                  ? 'bg-overclock-cyan/10 border-overclock-cyan/30 text-overclock-cyan' 
                  : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}
          >
            {isConnectedToFirebase ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Cloud Sync</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5" />
                <span>Local Sync</span>
              </>
            )}
          </div>
        </div>

        {/* Right side navigation & Theme toggle */}
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Link
              to="/rapidfire"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase transition-all duration-200 border ${
                isDark
                  ? 'bg-overclock-dark-800 text-slate-300 border-overclock-dark-700 hover:text-white hover:border-overclock-cyan'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Open Projector Display in new tab"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Projector Display</span>
            </Link>
          )}

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
