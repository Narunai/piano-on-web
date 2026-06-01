import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as Tone from 'tone';
import PianoKey from './PianoKey';
import usePianoSound from '../hooks/usePianoSound';
import '../styles/Piano.css';

const SETTINGS_KEY = 'piano_web_v1_settings';

const DEFAULT_CHORD_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'z', 'x', 'c', 'v', 'b'];
const DEFAULT_MELODY_KEYS = ['n', 'u', 'i', 'o', 'p', '[', ']', '\\'];

const DEFAULT_ONE_HAND_WHITE_KEYS = [
  'a', 's', 'd', 'f', 'g', 'h', 'j', 
  'q', 'w', 'e', 'r', 't', 'y', 'u', 
  '1', '2', '3', '4', '5', '6', '7'  
];

const DEFAULT_ONE_HAND_BLACK_KEYS = [
  'w', 'e', '', 't', 'y', 'u', '', 
  '2', '3', '', '5', '6', '7', '', 
  '8', '9', '', '0', '-', '=', ''  
];

const DEFAULT_DUAL_BLACK_KEYS = {
  'w': 1, 'e': 3, 't': 6, 'y': 8, '7': 10, '9': 13, '0': 15, '-': 18, '=': 20, 'q': 22, '2': 25, '3': 27, '5': 30, '6': 32, '8': 34
};

const ALL_NOTES = [
  'A0', 'A#0', 'B0',
  'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
  'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6',
  'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7', 'B7',
  'C8'
];

const WHITE_NOTES = ALL_NOTES.filter(n => !n.includes('#'));

const TONE_OPTIONS = [
  { label: 'Grand Piano (Real)', value: 'grand-piano' },
  { label: 'Triangle', value: 'triangle' },
  { label: 'Sine', value: 'sine' },
  { label: 'Square', value: 'square' },
  { label: 'Sawtooth', value: 'sawtooth' },
];

const Piano = () => {
  const savedSettings = useMemo(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {};
  }, []);

  const [playMode, setPlayMode] = useState(savedSettings.playMode || 'dual');
  const [oneHandWhiteKeys, setOneHandWhiteKeys] = useState(savedSettings.oneHandWhiteKeys || DEFAULT_ONE_HAND_WHITE_KEYS);
  const [oneHandBlackKeys, setOneHandBlackKeys] = useState(savedSettings.oneHandBlackKeys || DEFAULT_ONE_HAND_BLACK_KEYS);
  const [dualChordKeys, setDualChordKeys] = useState(savedSettings.dualChordKeys || DEFAULT_CHORD_KEYS);
  const [dualMelodyKeys, setDualMelodyKeys] = useState(savedSettings.dualMelodyKeys || DEFAULT_MELODY_KEYS);
  const [dualBlackKeys, setDualBlackKeys] = useState(savedSettings.dualBlackKeys || DEFAULT_DUAL_BLACK_KEYS);

  const [chordTone, setChordTone] = useState(savedSettings.chordTone || 'grand-piano');
  const [melodyTone, setMelodyTone] = useState(savedSettings.melodyTone || 'grand-piano');
  const [chordShift, setChordShift] = useState(savedSettings.chordShift || 0); 
  const [melodyShift, setMelodyShift] = useState(savedSettings.melodyShift || 0);
  const [chordSustain, setChordSustain] = useState(savedSettings.chordSustain || 1);
  const [melodySustain, setMelodySustain] = useState(savedSettings.melodySustain || 1);
  const [isCompact, setIsCompact] = useState(savedSettings.isCompact || false);
  const [isExtraWide, setIsExtraWide] = useState(savedSettings.isExtraWide || false);

  const chordSynth = usePianoSound(chordTone, chordSustain);
  const melodySynth = usePianoSound(melodyTone, melodySustain);

  const [activeNotes, setActiveNotes] = useState(new Set());

  useEffect(() => {
    const settings = {
      playMode, oneHandWhiteKeys, oneHandBlackKeys, dualChordKeys, dualMelodyKeys, dualBlackKeys,
      chordTone, melodyTone, chordShift, melodyShift, chordSustain, melodySustain, isCompact, isExtraWide
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [playMode, oneHandWhiteKeys, oneHandBlackKeys, dualChordKeys, dualMelodyKeys, dualBlackKeys,
      chordTone, melodyTone, chordShift, melodyShift, chordSustain, melodySustain, isCompact, isExtraWide]);

  const keyMap = useMemo(() => {
    const map = {};
    const c3Idx = ALL_NOTES.indexOf('C3');
    
    if (playMode === 'dual') {
      const whiteBaseIdx = WHITE_NOTES.indexOf('C3');
      dualChordKeys.forEach((key, i) => {
        if (!key) return;
        const noteIdx = ALL_NOTES.indexOf(WHITE_NOTES[whiteBaseIdx + i]);
        const shiftedIdx = Math.max(0, Math.min(ALL_NOTES.length - 1, noteIdx + chordShift));
        map[key.toLowerCase()] = { note: ALL_NOTES[shiftedIdx], section: 'chord' };
      });

      const melodyBaseIdx = WHITE_NOTES.indexOf('E5');
      dualMelodyKeys.forEach((key, i) => {
        if (!key) return;
        const noteIdx = ALL_NOTES.indexOf(WHITE_NOTES[melodyBaseIdx + i]);
        const shiftedIdx = Math.max(0, Math.min(ALL_NOTES.length - 1, noteIdx + melodyShift));
        map[key.toLowerCase()] = { note: ALL_NOTES[shiftedIdx], section: 'melody' };
      });

      Object.entries(dualBlackKeys).forEach(([key, baseIdx]) => {
          if (!key) return;
          const absoluteBaseIdx = c3Idx + baseIdx;
          const section = absoluteBaseIdx < ALL_NOTES.indexOf('E5') ? 'chord' : 'melody';
          const shift = section === 'chord' ? chordShift : melodyShift;
          const shiftedIdx = Math.max(0, Math.min(ALL_NOTES.length - 1, absoluteBaseIdx + shift));
          map[key.toLowerCase()] = { note: ALL_NOTES[shiftedIdx], section };
      });
    } else {
      const whiteBaseIdx = WHITE_NOTES.indexOf('C3');
      oneHandWhiteKeys.forEach((key, i) => {
        if (!key) return;
        const noteIdx = ALL_NOTES.indexOf(WHITE_NOTES[whiteBaseIdx + i]);
        const shiftedIdx = Math.max(0, Math.min(ALL_NOTES.length - 1, noteIdx + melodyShift));
        map[key.toLowerCase()] = { note: ALL_NOTES[shiftedIdx], section: 'melody' };
      });
      oneHandBlackKeys.forEach((key, i) => {
        if (!key) return;
        const octave = Math.floor(i / 7);
        const offsets = [1, 3, null, 6, 8, 10, null];
        const offset = offsets[i % 7];
        if (offset !== null) {
            const absoluteBaseIdx = c3Idx + (octave * 12) + offset;
            const shiftedIdx = Math.max(0, Math.min(ALL_NOTES.length - 1, absoluteBaseIdx + melodyShift));
            map[key.toLowerCase()] = { note: ALL_NOTES[shiftedIdx], section: 'melody' };
        }
      });
    }
    return map;
  }, [playMode, oneHandWhiteKeys, oneHandBlackKeys, dualChordKeys, dualMelodyKeys, dualBlackKeys, chordShift, melodyShift]);

  const handlePlay = useCallback(async (note, section) => {
    // Ensure AudioContext is started on first interaction
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    
    setActiveNotes((prev) => new Set(prev).add(note));
    if (section === 'chord') {
      chordSynth.playNote(note);
    } else {
      melodySynth.playNote(note);
    }
  }, [chordSynth, melodySynth]);

  const handleRelease = useCallback((note, section) => {
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    if (section === 'chord') {
      chordSynth.releaseNote(note);
    } else {
      melodySynth.releaseNote(note);
    }
  }, [chordSynth, melodySynth]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const mapping = keyMap[e.key.toLowerCase()];
      if (mapping && !activeNotes.has(mapping.note)) {
        handlePlay(mapping.note, mapping.section);
      }
    };
    const handleKeyUp = (e) => {
      const mapping = keyMap[e.key.toLowerCase()];
      if (mapping) handleRelease(mapping.note, mapping.section);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyMap, activeNotes, handlePlay, handleRelease]);

  const [showOverlay, setShowOverlay] = useState(true);
  useEffect(() => {
    if (chordSynth.isLoaded && melodySynth.isLoaded) setShowOverlay(false);
  }, [chordSynth.isLoaded, melodySynth.isLoaded]);

  const resetToDefaults = () => {
    if (window.confirm("Reset all settings and key mappings to defaults?")) {
      localStorage.removeItem(SETTINGS_KEY);
      window.location.reload();
    }
  };

  const updateDualBlackKey = (oldKey, newKey) => {
    const newMap = { ...dualBlackKeys };
    const value = newMap[oldKey];
    delete newMap[oldKey];
    if (newKey) newMap[newKey.toLowerCase()] = value;
    setDualBlackKeys(newMap);
  };

  const renderDualHandEditor = () => (
    <div className="mapping-editor">
      <h3>Key Mapping Editor (Dual Hand)</h3>
      <div className="editor-groups">
        <div className="editor-group">
            <h4>Chord Hand (Left)</h4>
            <div className="key-grid">
                {dualChordKeys.map((key, i) => (
                    <div key={i} className="key-input-group white">
                        <label>{WHITE_NOTES[WHITE_NOTES.indexOf('C3') + i]}</label>
                        <input type="text" maxLength="1" value={key} onChange={(e) => {
                            const next = [...dualChordKeys];
                            next[i] = e.target.value.toLowerCase();
                            setDualChordKeys(next);
                        }} />
                    </div>
                ))}
            </div>
        </div>
        <div className="editor-group">
            <h4>Melody Hand (Right)</h4>
            <div className="key-grid">
                {dualMelodyKeys.map((key, i) => (
                    <div key={i} className="key-input-group white">
                        <label>{WHITE_NOTES[WHITE_NOTES.indexOf('E5') + i]}</label>
                        <input type="text" maxLength="1" value={key} onChange={(e) => {
                            const next = [...dualMelodyKeys];
                            next[i] = e.target.value.toLowerCase();
                            setDualMelodyKeys(next);
                        }} />
                    </div>
                ))}
            </div>
        </div>
        <div className="editor-group">
            <h4>Shared Black Keys (Sharps)</h4>
            <div className="key-grid">
                {Object.entries(dualBlackKeys).map(([key, baseIdx]) => (
                    <div key={baseIdx} className="key-input-group black">
                        <label>{ALL_NOTES[ALL_NOTES.indexOf('C3') + baseIdx]}</label>
                        <input type="text" maxLength="1" value={key} onChange={(e) => updateDualBlackKey(key, e.target.value)} />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );

  const renderOctaveEditor = (octaveIdx) => {
    const start = octaveIdx * 7;
    const offsets = [1, 3, null, 6, 8, 10, null];
    const c3Idx = WHITE_NOTES.indexOf('C3');
    return (
      <div className="octave-editor">
        <h4>Octave {octaveIdx + 1}</h4>
        <div className="piano-editor-layout">
            <div className="black-keys-row">
                {offsets.map((offset, i) => (
                    <div key={i} className={`key-input-group black ${offset === null ? 'spacer' : ''}`}>
                        {offset !== null && (
                            <>
                                <label>{ALL_NOTES[ALL_NOTES.indexOf('C3') + (octaveIdx * 12) + offset]}</label>
                                <input 
                                    type="text" maxLength="1" value={oneHandBlackKeys[start + i]} 
                                    onChange={(e) => {
                                        const next = [...oneHandBlackKeys];
                                        next[start+i] = e.target.value.toLowerCase();
                                        setOneHandBlackKeys(next);
                                    }} 
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="white-keys-row">
                {oneHandWhiteKeys.slice(start, start + 7).map((key, i) => (
                    <div key={i} className="key-input-group white">
                        <label>{WHITE_NOTES[c3Idx + start + i]}</label>
                        <input type="text" maxLength="1" value={key} onChange={(e) => {
                            const next = [...oneHandWhiteKeys];
                            next[start+i] = e.target.value.toLowerCase();
                            setOneHandWhiteKeys(next);
                        }} />
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`piano-wrapper ${isCompact ? 'compact-mode' : ''} ${playMode === 'one-hand' ? 'one-hand-mode' : ''}`}>
      <div className="piano-container">
        {showOverlay && (!chordSynth.isLoaded || !melodySynth.isLoaded) && (
          <div className="loading-overlay">
            <div className="loading-content"><div className="spinner"></div><p>Loading Samples...</p><button onClick={() => setShowOverlay(false)}>Skip</button></div>
          </div>
        )}
        <div className="piano-keyboard">
          {ALL_NOTES.slice(isExtraWide ? 0 : 27, isExtraWide ? 88 : 68).map((note) => { 
            const isBlack = note.includes('#');
            const isActive = activeNotes.has(note);
            const mappedKey = Object.entries(keyMap).find(([_, m]) => m.note === note)?.[0];
            return (
              <PianoKey key={note} note={note} keyboardKey={mappedKey} isBlack={isBlack} isActive={isActive} isCompact={isCompact}
                onPlay={(n) => handlePlay(n, ALL_NOTES.indexOf(n) < ALL_NOTES.indexOf('E5') ? 'chord' : 'melody')}
                onRelease={(n) => handleRelease(n, ALL_NOTES.indexOf(n) < ALL_NOTES.indexOf('E5') ? 'chord' : 'melody')}
              />
            );
          })}
        </div>
      </div>

      <div className="view-toggle-container">
          <div className="view-toggle">
            <button className={!isCompact ? 'active' : ''} onClick={() => setIsCompact(false)}>Full Keyboard</button>
            <button className={isCompact ? 'active' : ''} onClick={() => setIsCompact(true)}>Compact Keyboard</button>
          </div>
          <div className="width-toggle">
            <button className={isExtraWide ? 'active' : ''} onClick={() => setIsExtraWide(!isExtraWide)}>
              {isExtraWide ? 'Standard Width' : 'Extra Wide (+28 Notes)'}
            </button>
          </div>
          <div className="mode-toggle">
            <button className={playMode === 'dual' ? 'active' : ''} onClick={() => setPlayMode('dual')}>Dual Hand</button>
            <button className={playMode === 'one-hand' ? 'active' : ''} onClick={() => setPlayMode('one-hand')}>One Hand</button>
          </div>
          <button className="reset-btn" onClick={resetToDefaults}>Reset All Defaults</button>
      </div>

      <div className="controls-panel bottom-controls">
        <div className="section-controls">
          <h3>{playMode === 'dual' ? 'Chord Section (Left)' : 'Piano Tone'}</h3>
          <div className="control-group"><label>Tone: </label>
            <select value={chordTone} onChange={(e) => setChordTone(e.target.value)}>{TONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          <div className="control-group"><label>Octave Shift: {chordShift / 12 > 0 ? `+${chordShift / 12}` : chordShift / 12}</label>
            <div className="shift-buttons"><button onClick={() => setChordShift(s => s - 12)}>-1</button><button onClick={() => setChordShift(s => s + 12)}>+1</button><button onClick={() => setChordShift(0)}>Reset</button></div></div>
          <div className="control-group"><label>Sustain: {chordSustain}s</label><input type="range" min="0.1" max="4" step="0.1" value={chordSustain} onChange={(e) => setChordSustain(parseFloat(e.target.value))} /></div>
        </div>
        {playMode === 'dual' && (
            <div className="section-controls">
            <h3>Melody Section (Right)</h3>
            <div className="control-group"><label>Tone: </label><select value={melodyTone} onChange={(e) => setMelodyTone(e.target.value)}>{TONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
            <div className="control-group"><label>Octave Shift: {melodyShift / 12 > 0 ? `+${melodyShift / 12}` : melodyShift / 12}</label>
                <div className="shift-buttons"><button onClick={() => setMelodyShift(s => s - 12)}>-1</button><button onClick={() => setMelodyShift(s => s + 12)}>+1</button><button onClick={() => setMelodyShift(0)}>Reset</button></div></div>
            <div className="control-group"><label>Sustain: {melodySustain}s</label><input type="range" min="0.1" max="4" step="0.1" value={melodySustain} onChange={(e) => setMelodySustain(parseFloat(e.target.value))} /></div>
            </div>
        )}
      </div>

      {playMode === 'one-hand' ? (
          <div className="mapping-editor">
              <h3>Key Mapping Editor (One Hand)</h3>
              <div className="octaves-container">
                  {renderOctaveEditor(0)}
                  {renderOctaveEditor(1)}
                  {renderOctaveEditor(2)}
              </div>
          </div>
      ) : renderDualHandEditor()}
    </div>
  );
};

export default Piano;
