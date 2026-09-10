import React from 'react';
import { HelpCircle, CheckCircle2, FileText, ListOrdered } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

export const QuestionDisplay = () => {
  const { session } = useGame();
  const { isDark } = useTheme();

  const { questions, currentQuestionIndex, attemptedTeamsForCurrentQuestion = [], currentTeamTimeRemaining = 0 } = session;
  const totalQuestions = questions ? questions.length : 0;
  const currentQ = session.status === 'active' && questions && questions[currentQuestionIndex]
    ? questions[currentQuestionIndex]
    : null;
  const passCount = attemptedTeamsForCurrentQuestion.length;
  const currentQuestionMultiplier = passCount + 1;
  const currentPassBonus = currentQuestionMultiplier * Math.max(0, currentTeamTimeRemaining);

  if (!currentQ) {
    return (
      <div className={`w-full p-12 rounded-3xl border text-center transition-all ${
        isDark 
          ? 'bg-overclock-dark-850/60 border-overclock-dark-700/80 text-slate-400' 
          : 'bg-white border-slate-200 text-slate-600 shadow-lg'
      }`}>
        <HelpCircle className="w-16 h-16 mx-auto mb-4 text-overclock-orange animate-bounce" />
        <h3 className="font-display font-bold text-2xl mb-2">No Questions Active</h3>
        <p className="font-mono text-sm max-w-md mx-auto">
          Add or load questions from the Admin Control Panel to initiate the Rapid Fire round.
        </p>
      </div>
    );
  }

  const isMcq = currentQ.type === 'mcq';
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className={`relative w-full rounded-3xl p-6 sm:p-8 md:p-10 border transition-all duration-300 ${
      isDark
        ? 'bg-gradient-to-b from-overclock-dark-900 to-overclock-dark-850 border-overclock-dark-700/80 shadow-2xl shadow-black/40'
        : 'bg-white border-slate-200 shadow-xl'
    }`}>
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-inherit">
        <div className="flex items-center gap-3">
          <span className={`px-3.5 py-1.5 rounded-xl font-display font-black text-sm tracking-wider uppercase flex items-center gap-2 ${
            isDark
              ? 'bg-overclock-orange/15 text-overclock-orange border border-overclock-orange/30 shadow-glow-orange'
              : 'bg-orange-50 text-orange-600 border border-orange-200 font-bold'
          }`}>
            <ListOrdered className="w-4 h-4" />
            QUESTION {currentQuestionIndex + 1} OF {totalQuestions}
          </span>

          <span className={`px-3 py-1 rounded-xl font-mono text-xs font-semibold uppercase flex items-center gap-1.5 ${
            isMcq
              ? isDark 
                ? 'bg-overclock-cyan/10 text-overclock-cyan border border-overclock-cyan/30' 
                : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
              : isDark
                ? 'bg-purple-950/40 text-purple-400 border border-purple-800/40'
                : 'bg-purple-50 text-purple-700 border border-purple-200'
          }`}>
            {isMcq ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Multiple Choice
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                Direct Text Answer
              </>
            )}
          </span>
        </div>

        {/* Attempt indicator */}
        {passCount > 0 && (
          <div className={`text-xs font-mono px-3 py-1 rounded-full border flex items-center gap-2 ${
            isDark 
              ? 'bg-overclock-red/10 border-overclock-red/30 text-overclock-red' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <span>Passed {passCount} time{passCount === 1 ? '' : 's'}</span>
            <span className="font-black text-overclock-orange">Next bonus: +{currentPassBonus}</span>
          </div>
        )}
      </div>

      {/* Main Question Text */}
      <div className="mb-8">
        <h2 className={`font-display font-extrabold text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {currentQ.question}
        </h2>
      </div>

      {/* Question Options or Text Indicator */}
      {isMcq && currentQ.options && currentQ.options.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => {
              const letter = optionLetters[idx] || `${idx + 1}`;
              return (
                <div
                  key={idx}
                  className={`relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 select-none ${
                    isDark
                      ? 'bg-overclock-dark-800/70 border-overclock-dark-700/80 text-slate-100'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-display font-black text-lg flex-shrink-0 ${
                    isDark
                      ? 'bg-overclock-cyan/15 text-overclock-cyan border border-overclock-cyan/30'
                      : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                  }`}>
                    {letter}
                  </div>

                  <span className="font-body text-base sm:text-lg font-medium">
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={`py-2.5 px-4 rounded-xl text-center text-xs font-mono font-semibold uppercase tracking-wider border ${
            isDark 
              ? 'bg-overclock-dark-950/60 border-overclock-dark-800 text-slate-400' 
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            🎤 Speak answer verbally on the mic &mdash; Host records result
          </div>
        </div>
      ) : (
        <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center ${
          isDark 
            ? 'bg-overclock-dark-800/40 border-overclock-dark-700 text-slate-300' 
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2 text-overclock-orange font-display font-bold text-base uppercase">
            <span>🎤 VERBAL ANSWER QUESTION</span>
          </div>
          <p className="font-mono text-xs text-slate-400">
            Speak your answer directly on the stage microphone. Host will verify and award points.
          </p>
        </div>
      )}
    </div>
  );
};
