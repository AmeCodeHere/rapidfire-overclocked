import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Tv, ShieldCheck, Play, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export const Launcher = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col tech-grid-bg transition-colors duration-300 ${
      isDark ? 'bg-overclock-dark-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Simple Header */}
      <header className={`w-full border-b px-6 py-4 flex items-center justify-between ${
        isDark ? 'bg-overclock-dark-900/80 border-overclock-dark-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-overclock-orange to-overclock-cyan shadow-glow-orange">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-wider">
            OVERCLOCKED <span className="text-overclock-orange">2026</span>
          </span>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Hero & Card Selectors */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-overclock-orange/10 border border-overclock-orange/30 text-overclock-orange font-mono text-xs font-bold uppercase tracking-widest mb-6 shadow-glow-orange">
          <Sparkles className="w-3.5 h-3.5" />
          Production Control Hub
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight mb-4">
          RAPID FIRE <span className="bg-gradient-to-r from-overclock-orange via-rose-500 to-overclock-cyan bg-clip-text text-transparent">ARENA</span>
        </h1>

        <p className="font-body text-base sm:text-lg max-w-2xl text-slate-400 mb-12">
          High-energy college tech-fest competition engine featuring real-time audience display telemetry, sequential seating turn cycling, and silent host controls.
        </p>

        {/* Dual Screen Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
          {/* Projector Screen */}
          <Link
            to="/rapidfire"
            className={`group p-8 rounded-3xl border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
              isDark
                ? 'bg-overclock-dark-900 border-overclock-dark-700 hover:border-overclock-cyan hover:shadow-glow-cyan'
                : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-xl'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-overclock-cyan/20 border border-overclock-cyan/40 text-overclock-cyan flex items-center justify-center mb-6 shadow-glow-cyan">
                <Tv className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-overclock-cyan">
                Route: /rapidfire
              </span>
              <h2 className={`font-display font-black text-2xl uppercase mt-1 mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Audience Projector
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Put this full-screen on the stage projector. Displays current question, live leaderboard, circular team turn indicator, and animated green/red score feedback.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 font-mono text-xs font-bold uppercase text-overclock-cyan group-hover:translate-x-1 transition-transform">
              <span>Open Projector View</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Admin Screen */}
          <Link
            to="/rapidfire/admin"
            className={`group p-8 rounded-3xl border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
              isDark
                ? 'bg-overclock-dark-900 border-overclock-dark-700 hover:border-overclock-orange hover:shadow-glow-orange'
                : 'bg-white border-slate-200 hover:border-orange-400 hover:shadow-xl'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-overclock-orange/20 border border-overclock-orange/40 text-overclock-orange flex items-center justify-center mb-6 shadow-glow-orange">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-overclock-orange">
                Route: /rapidfire/admin
              </span>
              <h2 className={`font-display font-black text-2xl uppercase mt-1 mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Host Admin Panel
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Run by the stage host. Configure questions (manual or CSV/Excel), physical seating order, scoring rules, timer controls, inline score confirmation, and client-side leaderboard export.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 font-mono text-xs font-bold uppercase text-overclock-orange group-hover:translate-x-1 transition-transform">
              <span>Open Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Pro Tip */}
        <div className="mt-12 p-4 rounded-2xl border border-slate-800 bg-overclock-dark-900/50 text-xs font-mono text-slate-400 max-w-xl">
          💡 <strong>Host Tip:</strong> Open the Projector screen in one browser window on the stage display, and the Admin Panel on the host laptop. Both screens sync in real time!
        </div>
      </main>
    </div>
  );
};
