import React, { useState } from 'react';
import Piano from './components/Piano';
import './App.css';

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoWidth, setVideoWidth] = useState(800);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    
    // Extract video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      setVideoId(match[2]);
    } else {
      setVideoId('');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Interactive Piano</h1>
      </header>
      
      <main className="main-content">
        {/* New Fixed-Width Video Input Section */}
        <section className="video-setup-section">
          <div className="input-card">
            <div className="url-input-wrapper">
              <div className="yt-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Paste YouTube Video Link here to practice..." 
                value={youtubeUrl}
                onChange={handleUrlChange}
              />
              <button className="load-video-btn" onClick={() => handleUrlChange({ target: { value: youtubeUrl }})}>
                Load Video
              </button>
            </div>
            {videoId && (
              <div className="video-size-control">
                <span>Video Size: {videoWidth}px</span>
                <input 
                  type="range" 
                  min="320" 
                  max="1400" 
                  step="10" 
                  value={videoWidth} 
                  onChange={(e) => setVideoWidth(parseInt(e.target.value))} 
                />
              </div>
            )}
          </div>
        </section>

        {/* Resizable Video Display Area */}
        {videoId && (
          <section className="video-display-section" style={{ width: '100%' }}>
            <div className="video-wrapper" style={{ width: `${videoWidth}px`, maxWidth: '95vw' }}>
              <div className="video-frame">
                <iframe
                  width="100%"
                  height={(videoWidth * 9) / 16}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </section>
        )}

        <Piano />
      </main>

      <footer>
        <p>Built with React & Tone.js</p>
      </footer>
    </div>
  );
}

export default App;
