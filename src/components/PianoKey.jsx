import React from 'react';

const PianoKey = ({ note, keyboardKey, isBlack, isActive, isCompact, onPlay, onRelease }) => {
  return (
    <div
      className={`piano-key ${isBlack ? 'black-key' : 'white-key'} ${isActive ? 'active' : ''} ${isCompact ? 'compact' : ''}`}
      onMouseDown={() => onPlay(note)}
      onMouseUp={() => onRelease(note)}
      onMouseEnter={(e) => {
        if (e.buttons === 1) onPlay(note);
      }}
      onMouseLeave={() => onRelease(note)}
    >
      {!isCompact && keyboardKey && <div className="key-label">{keyboardKey.toUpperCase()}</div>}
    </div>
  );
};

export default PianoKey;
