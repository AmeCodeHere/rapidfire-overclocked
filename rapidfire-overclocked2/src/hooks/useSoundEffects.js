import { useCallback, useRef } from 'react';
import { soundSynth } from '../utils/audioSynthesizer';

export const useSoundEffects = () => {
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const tickAudioRef = useRef(null);
  const roundConcludedAudioRef = useRef(null);

  // Initialize or get audio elements
  const getAudio = (path, ref) => {
    if (!ref.current) {
      ref.current = new Audio(path);
      ref.current.preload = 'auto';
    }
    return ref.current;
  };

  const playCorrect = useCallback(() => {
    try {
      const audio = getAudio('/sounds/correct.mp3', correctAudioRef);
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // File not found or unplayable, fallback to Web Audio API synthesizer
          soundSynth.playCorrect();
        });
      }
    } catch (e) {
      soundSynth.playCorrect();
    }
  }, []);

  const playWrong = useCallback(() => {
    try {
      const audio = getAudio('/sounds/wrong.mp3', wrongAudioRef);
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          soundSynth.playWrong();
        });
      }
    } catch (e) {
      soundSynth.playWrong();
    }
  }, []);

  const playTick = useCallback(() => {
    try {
      const audio = getAudio('/sounds/tick.mp3', tickAudioRef);
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          soundSynth.playTick();
        });
      }
    } catch (e) {
      soundSynth.playTick();
    }
  }, []);

  const playRoundConcluded = useCallback(() => {
    try {
      const audio = getAudio('/sounds/round-concluded.mp3', roundConcludedAudioRef);
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => soundSynth.playRoundConcluded());
      }
    } catch (e) {
      soundSynth.playRoundConcluded();
    }
  }, []);

  return { playCorrect, playWrong, playTick, playRoundConcluded };
};
