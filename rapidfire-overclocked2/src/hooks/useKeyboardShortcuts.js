import { useEffect } from 'react';

/**
 * Silent keyboard listener for 'c'/'C' (Correct) and 'x'/'X' (Wrong).
 * Disabled if target is an input/textarea/contentEditable.
 */
export const useKeyboardShortcuts = ({ onCorrect, onWrong, isEnabled = true }) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e) => {
      // Ignore if user is typing in form inputs
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }

      // Ignore modifier combinations like Ctrl+C, Ctrl+X, Alt, etc.
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'c') {
        e.preventDefault();
        onCorrect && onCorrect();
      } else if (key === 'x') {
        e.preventDefault();
        onWrong && onWrong();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCorrect, onWrong, isEnabled]);
};
