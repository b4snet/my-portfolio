import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from 'motion/react';

type AudioListener = (isOn: boolean) => void;
const audioListeners = new Set<AudioListener>();

const BANSURI_AUDIO_SRC = '/audio/bansuri.mp3';
const VOLUME_STORAGE_KEY = 'portfolio_audio_volume';
const DEFAULT_VOLUME = 0.7;
const INITIAL_FADE_VOLUME = 0.15;

function readPersistedVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (raw !== null) {
      const parsed = Number.parseFloat(raw);
      if (Number.isFinite(parsed) && parsed > 0 && parsed <= 1) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage access errors in restricted frames
  }
  return DEFAULT_VOLUME;
}

// Global audio controller interface so other components (e.g. KrishnaCharacter) stay synced
export const globalAudioController = {
  toggleSound: () => {},
  isSoundOn: () => false,
  subscribe: (listener: AudioListener) => {
    audioListeners.add(listener);
    listener(globalAudioController.isSoundOn());
    return () => {
      audioListeners.delete(listener);
    };
  },
};

export const BackgroundMusic: React.FC = () => {
  // Always starts off on page load; audio triggers strictly on user interaction
  const [soundOn, setSoundOn] = useState(false);
  const [volume, setVolumeState] = useState<number>(readPersistedVolume);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundOnRef = useRef(false);
  const volumeRef = useRef(volume);
  const fadeFrameRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const notifyListeners = useCallback((state: boolean) => {
    soundOnRef.current = state;
    audioListeners.forEach((fn) => fn(state));
  }, []);

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  }, []);

  // Persist volume state updates and sync active audio element volume
  const setPersistentVolume = useCallback((nextVolume: number) => {
    const clamped = Math.max(0.05, Math.min(1, nextVolume));
    setVolumeState(clamped);
    volumeRef.current = clamped;

    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, clamped.toString());
    } catch {
      // Ignore storage errors
    }

    if (audioRef.current && soundOnRef.current) {
      try {
        audioRef.current.volume = clamped;
      } catch {
        // Ignore on read-only audio volume platforms
      }
    }
  }, []);

  // Smooth volume fader (durationMs)
  const fadeVolume = useCallback(
    (targetVolume: number, durationMs: number, onComplete?: () => void) => {
      cancelFade();

      const audio = audioRef.current;
      if (!audio) return;

      let startVolume = targetVolume;
      try {
        startVolume = audio.volume;
      } catch {
        return;
      }

      const startTime = performance.now();

      const step = (now: number) => {
        const currentAudio = audioRef.current;
        if (!currentAudio) {
          fadeFrameRef.current = null;
          return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const nextVol = Math.max(
          0,
          Math.min(1, startVolume + (targetVolume - startVolume) * progress)
        );

        try {
          currentAudio.volume = nextVol;
        } catch {
          // Ignore on read-only audio volume platforms
        }

        if (progress < 1) {
          fadeFrameRef.current = requestAnimationFrame(step);
        } else {
          fadeFrameRef.current = null;
          onComplete?.();
        }
      };

      fadeFrameRef.current = requestAnimationFrame(step);
    },
    [cancelFade]
  );

  // Create, configure, and manage the Audio object inside useEffect
  useEffect(() => {
    const audio = new Audio(BANSURI_AUDIO_SRC);
    audio.loop = true;
    audio.preload = 'metadata';
    audio.muted = false;
    try {
      audio.volume = volumeRef.current;
    } catch {
      // Ignore on read-only volume platforms
    }

    audioRef.current = audio;

    const handleAudioError = () => {
      console.warn('Failed to load audio source:', BANSURI_AUDIO_SRC);
      cancelFade();
      setSoundOn(false);
      notifyListeners(false);
    };

    const handleVisibilityChange = () => {
      if (!soundOnRef.current) return;

      if (document.hidden) {
        cancelFade();
        audio.pause();
      } else {
        audio.muted = false;
        try {
          audio.volume = volumeRef.current;
        } catch {}

        const resumePromise = audio.play();
        if (resumePromise !== undefined) {
          resumePromise.catch(() => {
            setSoundOn(false);
            notifyListeners(false);
          });
        }
      }
    };

    audio.addEventListener('error', handleAudioError);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Save initial default volume to persistent storage if not already set
    try {
      if (localStorage.getItem(VOLUME_STORAGE_KEY) === null) {
        localStorage.setItem(VOLUME_STORAGE_KEY, volumeRef.current.toString());
      }
    } catch {}

    return () => {
      cancelFade();
      audio.removeEventListener('error', handleAudioError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.pause();
      audio.src = '';
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [cancelFade, notifyListeners]);

  // Triggered strictly after explicit user interaction (sound icon click)
  const turnSoundOn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelFade();

    const targetVol = volumeRef.current;
    const startVol = Math.min(INITIAL_FADE_VOLUME, targetVol);

    audio.muted = false;
    try {
      audio.volume = startVol;
    } catch {
      // Ignore on read-only audio volume platforms
    }

    // Reload only if a prior load error occurred so active buffering isn't interrupted
    if (audio.error) {
      audio.load();
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      setSoundOn(true);
      notifyListeners(true);

      playPromise
        .then(() => {
          if (soundOnRef.current) {
            fadeVolume(targetVol, 1200, () => {
              setPersistentVolume(targetVol);
            });
          }
        })
        .catch((err) => {
          console.warn('Audio playback could not start until user interaction:', err);
          cancelFade();
          setSoundOn(false);
          notifyListeners(false);
        });
    } else {
      setSoundOn(true);
      notifyListeners(true);
      fadeVolume(targetVol, 1200);
    }
  }, [cancelFade, fadeVolume, notifyListeners, setPersistentVolume]);

  const turnSoundOff = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setSoundOn(false);
    notifyListeners(false);

    fadeVolume(0, 800, () => {
      if (!soundOnRef.current) {
        audio.pause();
      }
    });
  }, [fadeVolume, notifyListeners]);

  const handleToggleSound = useCallback(() => {
    if (soundOnRef.current) {
      turnSoundOff();
    } else {
      turnSoundOn();
    }
  }, [turnSoundOff, turnSoundOn]);

  // Keep external controller bound to latest interaction handler
  useEffect(() => {
    globalAudioController.toggleSound = handleToggleSound;
    globalAudioController.isSoundOn = () => soundOnRef.current;
  }, [handleToggleSound]);

  return (
    <button
      type="button"
      onClick={handleToggleSound}
      aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
      aria-pressed={soundOn}
      title={soundOn ? 'Turn sound off' : 'Turn sound on'}
      className="fixed bottom-6 left-6 z-40 w-10 h-10 p-0 rounded-none bg-transparent border-0 flex items-center justify-center text-[#86868b] hover:text-white transition-colors cursor-pointer mix-blend-difference focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#86868b] shadow-none drop-shadow-none select-none"
    >
      {soundOn ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 pointer-events-none"
          aria-hidden="true"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path
            d="M15.54 8.46a5 5 0 0 1 0 7.07"
            className={shouldReduceMotion ? '' : 'animate-sound-wave-1'}
          />
          <path
            d="M18.36 5.64a9 9 0 0 1 0 12.72"
            className={shouldReduceMotion ? '' : 'animate-sound-wave-2'}
          />
          <path
            d="M21.19 2.81a13 13 0 0 1 0 18.38"
            className={shouldReduceMotion ? '' : 'animate-sound-wave-3'}
          />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 pointer-events-none"
          aria-hidden="true"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      )}
    </button>
  );
};
