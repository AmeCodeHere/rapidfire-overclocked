import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import { DisplayScreen } from './pages/DisplayScreen';
import { AdminPanel } from './pages/AdminPanel';
import { Launcher } from './pages/Launcher';

export function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Launcher />} />
            <Route path="/rapidfire" element={<DisplayScreen />} />
            <Route path="/rapidfire/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
