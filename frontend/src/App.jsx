import React, { useState, useRef, useEffect } from 'react';
import useWebRTC from './hooks/useWebRTC';
import './App.css';

function App() {
  const [roomName, setRoomName] = useState('lobby');
  const [joined, setJoined] = useState(false);
  const { localStream, remoteStream, startCall } = useWebRTC(joined ? roomName : null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleJoin = () => {
    if (roomName.trim()) {
      setJoined(true);
    }
  };

  const handleLeave = () => {
    // Clear video elements before unmounting hook (prevents srcObject errors)
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setJoined(false);
  };

  return (
    <div className="app-container">
      <header className="glass-header">
        <h1>Nexus Call</h1>
        {joined && <div className="room-badge">🔴 Room: {roomName}</div>}
      </header>

      <main className="main-content">
        {!joined ? (
          <div className="join-container glass-card">
            <div className="join-icon">📹</div>
            <h2>Start a Video Call</h2>
            <p className="join-subtitle">Enter a room name to connect with others</p>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="e.g. secret-meeting"
              className="room-input"
            />
            <button onClick={handleJoin} className="btn-primary">
              Join Room →
            </button>
          </div>
        ) : (
          <div className="call-layout">
            {/* Main remote video */}
            <div className="video-wrapper remote-video glass-card">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="video-element"
              />
              {!remoteStream && (
                <div className="video-placeholder">
                  <div className="pulse-ring">
                    <div className="pulse-dot"></div>
                  </div>
                  <span>Waiting for peer to join...</span>
                  <small>Share the room name: <strong>{roomName}</strong></small>
                </div>
              )}
              <div className="video-label">Remote</div>
            </div>

            {/* Local video overlay */}
            <div className="local-video-overlay glass-card">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="video-element"
              />
              {!localStream && (
                <div className="video-placeholder small">
                  <span>No camera</span>
                </div>
              )}
              <div className="video-label">You</div>
            </div>

            {/* Controls */}
            <div className="controls-bar glass-card">
              <button
                onClick={startCall}
                className="btn-call"
                disabled={!localStream}
                title="Initiate call to peer in room"
              >
                <span>📞</span> Start Call
              </button>
              <button onClick={handleLeave} className="btn-hangup">
                <span>✖</span> Leave
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>WebRTC · Django Channels · Peer-to-Peer</p>
      </footer>
    </div>
  );
}

export default App;
