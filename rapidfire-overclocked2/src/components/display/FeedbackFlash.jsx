import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, Zap, FastForward } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const FeedbackFlash = () => {
  const { session } = useGame();
  const [activeFeedback, setActiveFeedback] = useState(null);

  useEffect(() => {
    if (!session.flashEvent) return;

    setActiveFeedback(session.flashEvent);

    // If correct, launch celebratory confetti burst!
    if (session.flashEvent.type === 'correct') {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00FF66', '#00F0FF', '#FF5500', '#FFFFFF']
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }

    // Auto dismiss overlay after 1.8 seconds
    const timer = setTimeout(() => {
      setActiveFeedback(null);
    }, 1800);

    return () => clearTimeout(timer);
  }, [session.flashEvent?.id]);

  if (!activeFeedback) return null;

  const isCorrect = activeFeedback.type === 'correct';

  return (
    <div className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center transition-all duration-300 ${
      isCorrect
        ? 'bg-emerald-950/70 backdrop-blur-sm animate-flash-green'
        : 'bg-rose-950/70 backdrop-blur-sm animate-flash-red'
    }`}>
      <div className={`transform transition-all duration-300 scale-100 p-8 sm:p-12 rounded-3xl border-2 text-center max-w-lg mx-4 shadow-2xl ${
        isCorrect
          ? 'bg-overclock-dark-900 border-overclock-green shadow-glow-green text-white'
          : 'bg-overclock-dark-900 border-overclock-red shadow-glow-red text-white'
      }`}>
        {isCorrect ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-overclock-green/20 border-2 border-overclock-green flex items-center justify-center animate-bounce shadow-glow-green">
                <CheckCircle className="w-12 h-12 text-overclock-green" />
              </div>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-6xl tracking-wider text-overclock-green text-glow-green mb-2">
              CORRECT!
            </h1>

            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="font-display text-xl font-bold text-slate-200">
                {activeFeedback.teamName}
              </span>
            </div>

            {activeFeedback.pointsAwarded !== undefined && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-overclock-green/20 border border-overclock-green/40 text-overclock-green font-mono font-black text-2xl shadow-glow-green">
                <Zap className="w-6 h-6 fill-overclock-green" />
                +{activeFeedback.pointsAwarded} POINTS!
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-overclock-red/20 border-2 border-overclock-red flex items-center justify-center animate-pulse shadow-glow-red">
                <XCircle className="w-12 h-12 text-overclock-red" />
              </div>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-6xl tracking-wider text-overclock-red text-glow-red mb-2">
              WRONG!
            </h1>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-display text-xl font-bold text-slate-200">
                {activeFeedback.teamName}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-overclock-red/20 border border-overclock-red/40 text-rose-300 font-mono text-sm">
              <FastForward className="w-4 h-4 text-overclock-red" />
              Passing to next team in order...
            </div>
          </>
        )}
      </div>
    </div>
  );
};
