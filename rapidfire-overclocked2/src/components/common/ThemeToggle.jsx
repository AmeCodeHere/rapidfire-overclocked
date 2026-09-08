import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 border ${
        isDark
          ? 'bg-overclock-dark-800/80 hover:bg-overclock-dark-700 text-overclock-cyan border-overclock-dark-700 hover:border-overclock-cyan/50 shadow-sm'
          : 'bg-white hover:bg-slate-100 text-overclock-orange border-slate-200 hover:border-overclock-orange/50 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
