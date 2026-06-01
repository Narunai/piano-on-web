import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';

// Shared sampler instance to avoid redundant loading
let sharedSampler = null;
let loadingPromise = null;

const usePianoSound = (oscillatorType = 'triangle', releaseTime = 1) => {
  const synth = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const currentType = useRef(oscillatorType);

  useEffect(() => {
    // Initialize PolySynth for basic sounds
    synth.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: oscillatorType === 'grand-piano' ? 'triangle' : oscillatorType },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: releaseTime,
      },
    }).toDestination();

    if (oscillatorType === 'grand-piano') {
      loadSampler();
    } else {
      setIsLoaded(true);
    }

    return () => {
      if (synth.current) synth.current.dispose();
    };
  }, []);

  // Update instrument and settings when they change
  useEffect(() => {
    currentType.current = oscillatorType;
    if (oscillatorType === 'grand-piano') {
      loadSampler();
    } else if (synth.current) {
      synth.current.set({ oscillator: { type: oscillatorType } });
    }
  }, [oscillatorType]);

  useEffect(() => {
    if (synth.current) {
      synth.current.set({ envelope: { release: releaseTime } });
    }
    if (sharedSampler) {
      sharedSampler.release = releaseTime;
    }
  }, [releaseTime]);

  const loadSampler = async () => {
    if (sharedSampler) {
      setIsLoaded(true);
      return;
    }

    if (loadingPromise) {
      await loadingPromise;
      setIsLoaded(true);
      return;
    }

    loadingPromise = new Promise((resolve, reject) => {
      const s = new Tone.Sampler({
        urls: {
          A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
          A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
          A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
          A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
          A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
          A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
          A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
          A7: "A7.mp3", C8: "C8.mp3"
        },
        release: releaseTime,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
          sharedSampler = s;
          setIsLoaded(true);
          resolve();
        },
        onerror: (err) => {
          console.error("Sampler Load Error:", err);
          setLoadError(true);
          setIsLoaded(true); // Allow fallback to synth
          reject(err);
        }
      }).toDestination();

      // Timeout safety
      setTimeout(() => {
        if (!sharedSampler) {
          console.warn("Sampler load timeout - falling back to synth");
          setLoadError(true);
          setIsLoaded(true);
          resolve();
        }
      }, 10000);
    });

    try {
      await loadingPromise;
    } catch (e) {
      setLoadError(true);
    }
  };

  const setTone = useCallback((type) => {
    currentType.current = type;
    if (type === 'grand-piano') {
        loadSampler();
    } else if (synth.current) {
      synth.current.set({ oscillator: { type } });
    }
  }, []);

  const setRelease = useCallback((time) => {
    if (synth.current) {
      synth.current.set({ envelope: { release: time } });
    }
    if (sharedSampler) {
      sharedSampler.release = time;
    }
  }, []);

  const playNote = useCallback((note) => {
    if (currentType.current === 'grand-piano' && sharedSampler && !loadError) {
      sharedSampler.triggerAttack(note);
    } else if (synth.current) {
      synth.current.triggerAttack(note);
    }
  }, [loadError]);

  const releaseNote = useCallback((note) => {
    if (currentType.current === 'grand-piano' && sharedSampler && !loadError) {
      sharedSampler.triggerRelease(note);
    } else if (synth.current) {
      synth.current.triggerRelease(note);
    }
  }, [loadError]);

  return { playNote, releaseNote, setTone, setRelease, isLoaded, loadError };
};

export default usePianoSound;
