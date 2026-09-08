import React, { useState, useRef } from 'react';
import { 
  Plus, Upload, Trash2, ArrowUp, ArrowDown, Edit2, 
  Check, X, Sparkles, AlertCircle, HelpCircle, FileSpreadsheet
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { parseQuestionsFromFile } from '../../utils/fileParser';
import { SAMPLE_QUESTIONS } from '../../utils/sampleData';

export const QuestionSetup = () => {
  const { session, updateSession } = useGame();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);

  const questions = session.questions || [];

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    });
  };

  const handleStartEdit = (q) => {
    setEditingId(q.id);
    setFormData({
      type: q.type || 'mcq',
      question: q.question || '',
      options: q.options && q.options.length >= 4 
        ? [...q.options] 
        : [
            q.options?.[0] || '',
            q.options?.[1] || '',
            q.options?.[2] || '',
            q.options?.[3] || ''
          ],
      correctAnswer: q.correctAnswer || ''
    });
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!formData.question.trim()) return;

    const cleanedOptions = formData.type === 'mcq'
      ? formData.options.map(o => o.trim()).filter(Boolean)
      : [];

    const newQuestionObj = {
      id: editingId || `q-${Date.now()}`,
      type: formData.type,
      question: formData.question.trim(),
      options: cleanedOptions,
      correctAnswer: formData.correctAnswer.trim() || (cleanedOptions[0] || '')
    };

    let updatedList;
    if (editingId) {
      updatedList = questions.map(q => q.id === editingId ? newQuestionObj : q);
    } else {
      updatedList = [...questions, newQuestionObj];
    }

    updateSession({ questions: updatedList });
    resetForm();
  };

  const handleDelete = (id) => {
    const updated = questions.filter(q => q.id !== id);
    updateSession({ questions: updated });
    if (editingId === id) resetForm();
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateSession({ questions: updated });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    try {
      const parsed = await parseQuestionsFromFile(file);
      updateSession({ questions: parsed });
      setUploadSuccess(`Successfully imported ${parsed.length} questions from ${file.name}!`);
    } catch (err) {
      setUploadError(err.message || 'Failed to parse file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleQuestions = () => {
    updateSession({ questions: SAMPLE_QUESTIONS });
    setUploadSuccess(`Loaded ${SAMPLE_QUESTIONS.length} curated Tech Fest questions!`);
  };

  const handleClearAllQuestions = () => {
    updateSession({ questions: [], currentQuestionIndex: 0 });
    setShowClearConfirm(false);
    resetForm();
    setUploadSuccess('All questions have been removed.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Bulk Upload Controls */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDark ? 'bg-overclock-dark-850/80 border-overclock-dark-700' : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          <h3 className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Question Bank ({questions.length} Questions)
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Upload CSV/Excel file or manually compose MCQ and direct text questions.
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
            Bulk Upload (CSV / XLSX)
          </button>

          <button
            type="button"
            onClick={handleLoadSampleQuestions}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all border ${
              isDark
                ? 'bg-overclock-orange/15 hover:bg-overclock-orange/25 text-overclock-orange border-overclock-orange/40 shadow-glow-orange'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Tech Sample Set
          </button>

          {questions.length > 0 && (
            showClearConfirm ? (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-red-500/20 border border-red-500/40">
                <span className="text-[11px] font-mono text-red-300 px-1">Clear all questions?</span>
                <button
                  type="button"
                  onClick={handleClearAllQuestions}
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
                title="Remove all questions from the round queue"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Questions
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

      {/* Question Form (Manual Entry / Editing) */}
      <form
        onSubmit={handleSaveQuestion}
        className={`p-6 rounded-2xl border transition-all ${
          isDark ? 'bg-overclock-dark-900 border-overclock-dark-700' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-inherit">
          <h4 className={`font-display font-bold text-base uppercase tracking-wider ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}>
            {editingId ? "Edit Question" : "Add New Question"}
          </h4>

          {/* Type Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'mcq' })}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                formData.type === 'mcq'
                  ? 'bg-overclock-cyan text-black shadow-glow-cyan'
                  : isDark ? 'bg-overclock-dark-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}
            >
              MCQ (4 Options)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'text' })}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                formData.type === 'text'
                  ? 'bg-overclock-orange text-white shadow-glow-orange'
                  : isDark ? 'bg-overclock-dark-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Direct Text Answer
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Question Text *
            </label>
            <textarea
              rows={2}
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. Which semiconductor company originally revolutionized modern GPUs in 1999?"
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${
                isDark
                  ? 'bg-overclock-dark-950 border-overclock-dark-700 text-white focus:border-overclock-cyan focus:ring-1 focus:ring-overclock-cyan'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-overclock-cyan focus:bg-white'
              }`}
              required
            />
          </div>

          {/* MCQ Options */}
          {formData.type === 'mcq' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <div key={letter}>
                  <label className={`block text-[11px] font-mono uppercase mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Option {letter}
                  </label>
                  <input
                    type="text"
                    value={formData.options[idx] || ''}
                    onChange={(e) => {
                      const newOpts = [...formData.options];
                      newOpts[idx] = e.target.value;
                      setFormData({ ...formData, options: newOpts });
                    }}
                    placeholder={`Option ${letter}`}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none ${
                      isDark
                        ? 'bg-overclock-dark-950 border-overclock-dark-700 text-white focus:border-overclock-cyan'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-overclock-cyan focus:bg-white'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Correct Answer field */}
          <div>
            <label className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
              isDark ? 'text-overclock-green' : 'text-emerald-700'
            }`}>
              Correct Answer (Used by Host as Reference)
            </label>
            <input
              type="text"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              placeholder={formData.type === 'mcq' ? "Enter exact text of the correct option (e.g. NVIDIA)" : "Expected answer keyword"}
              className={`w-full px-4 py-2 rounded-xl text-sm font-medium border focus:outline-none ${
                isDark
                  ? 'bg-overclock-dark-950 border-emerald-900/60 text-emerald-300 focus:border-overclock-green'
                  : 'bg-emerald-50/50 border-emerald-300 text-emerald-900 focus:border-emerald-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase border ${
                  isDark ? 'border-overclock-dark-700 text-slate-400' : 'border-slate-300 text-slate-600'
                }`}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-overclock-cyan text-black hover:bg-cyan-300 shadow-glow-cyan transition-all"
            >
              {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? "Update Question" : "Add Question"}
            </button>
          </div>
        </div>
      </form>

      {/* Running List of Questions */}
      <div className="space-y-3">
        <h4 className={`font-display font-bold text-sm uppercase tracking-wider ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Round Queue ({questions.length})
        </h4>

        {questions.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center font-mono text-xs ${
            isDark ? 'bg-overclock-dark-900/40 border-overclock-dark-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            No questions added yet. Use the form above or import a file.
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                session.currentQuestionIndex === idx
                  ? isDark 
                    ? 'bg-overclock-cyan/10 border-overclock-cyan/50 shadow-glow-cyan' 
                    : 'bg-cyan-50 border-cyan-300 shadow-sm'
                  : isDark 
                    ? 'bg-overclock-dark-900 border-overclock-dark-700/70 hover:border-slate-600' 
                    : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                  session.currentQuestionIndex === idx
                    ? 'bg-overclock-cyan text-black'
                    : isDark ? 'bg-overclock-dark-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      q.type === 'mcq'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {q.type}
                    </span>
                    {session.currentQuestionIndex === idx && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-overclock-cyan text-black font-bold uppercase">
                        Current Live
                      </span>
                    )}
                  </div>

                  <p className={`font-medium text-sm line-clamp-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {q.question}
                  </p>

                  {q.correctAnswer && (
                    <p className="text-xs font-mono text-emerald-400 mt-1">
                      Ans: <span className="font-semibold">{q.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Reorder and Action buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  className="p-1.5 rounded-lg border border-transparent hover:border-slate-500 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === questions.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  className="p-1.5 rounded-lg border border-transparent hover:border-slate-500 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStartEdit(q)}
                  className="p-1.5 rounded-lg border border-transparent hover:border-overclock-cyan/50 text-slate-400 hover:text-overclock-cyan"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 rounded-lg border border-transparent hover:border-red-500/50 text-slate-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
