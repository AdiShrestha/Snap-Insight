import React, { useState, useEffect, useCallback, useRef } from 'react';

const compactContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center', 
  justifyContent: 'center',
  padding: '10px', 
  pointerEvents: 'none',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const compactBarStyle = {
  background: 'rgba(0,0,0,0.85)',
  backdropFilter: 'blur(20px)',
  borderRadius: '30px',
  padding: '8px 16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minWidth: '400px',
  pointerEvents: 'auto'
};

const compactInputStyle = {
  background: 'transparent',
  border: 'none',
  color: '#ffffff',
  fontSize: '14px',
  flex: 1,
  outline: 'none'
};

const compactButtonStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  borderRadius: '20px',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: '#ffffff'
};

export default function CompactOverlay({ onExpand, onClose }) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'audio'
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const notifyActivity = useCallback(() => {
    if (window.screenshot?.notifyUserActivity) {
      window.screenshot.notifyUserActivity();
    }
  }, []);

  useEffect(() => {
    // Add CSS animations
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('overlay-animations');
      if (!existingStyle) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'overlay-animations';
        styleSheet.textContent = `
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `;
        document.head.appendChild(styleSheet);
      }
    }

    // Focus input when component mounts
    if (inputRef.current && inputMode === 'text') {
      inputRef.current.focus();
    }

    // Activity tracking
    const trackActivity = () => notifyActivity();
    
    document.addEventListener('click', trackActivity);
    document.addEventListener('mousemove', trackActivity);
    document.addEventListener('keydown', trackActivity);

    return () => {
      document.removeEventListener('click', trackActivity);
      document.removeEventListener('mousemove', trackActivity);
      document.removeEventListener('keydown', trackActivity);
    };
  }, [notifyActivity, inputMode]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    notifyActivity();
    
    // Remove auto-expand on typing - only expand on Enter
  };

  const handleKeyPress = (e) => {
    notifyActivity();
    if (e.key === 'Enter' && inputValue.trim()) {
      // Send query with auto-screenshot
      sendQuery();
    }
    if (e.key === 'Escape') {
      if (onClose) {
        onClose();
      }
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        setHasRecording(true);
        setIsRecording(false);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setInputMode('audio');
      notifyActivity();
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Error accessing microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const switchToTextMode = () => {
    setInputMode('text');
    setHasRecording(false);
    setIsRecording(false);
    audioChunksRef.current = [];
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };  // Auto-capture screenshot and send query
  const sendQuery = async () => {
    // Check if we have input (text or audio)
    const hasTextInput = inputValue.trim();
    const hasAudioInput = hasRecording && audioChunksRef.current.length > 0;
    
    if (!hasTextInput && !hasAudioInput) return;

    setIsLoading(true);
    notifyActivity();

    try {
      // Expand the overlay first to show the chat
      if (onExpand) {
        onExpand();
      }

      // Small delay to allow expansion, then trigger auto-capture
      setTimeout(() => {
        if (inputMode === 'text' && hasTextInput) {
          // Store the query for the expanded view
          const queryText = inputValue.trim();
          setInputValue(''); // Clear input immediately
          
          if (window.screenshot?.autoCaptureAndQuery) {
            window.screenshot.autoCaptureAndQuery(queryText);
          }
        } else if (inputMode === 'audio' && hasAudioInput) {
          // Create audio blob and send with screenshot
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          
          if (window.screenshot?.autoCaptureAndQueryWithAudio) {
            window.screenshot.autoCaptureAndQueryWithAudio(audioBlob);
          }
          
          // Reset audio state
          setHasRecording(false);
          audioChunksRef.current = [];
        }
        setIsLoading(false);
      }, 300);
      
    } catch (err) {
      console.error('Error:', err);
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    notifyActivity();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    notifyActivity();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Expand overlay to handle file upload
      if (onExpand) {
        onExpand();
      }
    }
  };

  return (
    <div style={compactContainerStyle}>
      <div 
        style={compactBarStyle}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
          🔍
        </div>
        
        {inputMode === 'text' ? (
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask anything (auto captures screenshot)..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            style={compactInputStyle}
            disabled={isLoading}
          />
        ) : (
          <div style={{
            ...compactInputStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isRecording ? '#ff4444' : hasRecording ? '#44ff44' : 'rgba(255,255,255,0.7)',
            fontSize: '14px'
          }}>
            {isRecording ? (
              <>🎤 Recording... Speak now</>
            ) : hasRecording ? (
              <>✅ Recording ready to send</>
            ) : (
              <>🎤 Press microphone to record</>
            )}
          </div>
        )}
        
        {/* Microphone button */}
        <button
          style={{
            ...compactButtonStyle,
            background: inputMode === 'audio' ? (
              isRecording ? 'rgba(255,68,68,0.3)' : hasRecording ? 'rgba(68,255,68,0.3)' : 'rgba(255,255,255,0.2)'
            ) : 'rgba(255,255,255,0.1)',
            border: inputMode === 'audio' ? '1px solid rgba(255,255,255,0.3)' : 'none',
            animation: isRecording ? 'pulse 1.5s infinite' : 'none'
          }}
          onClick={handleMicrophoneClick}
          disabled={isLoading}
          title={isRecording ? "Stop recording" : inputMode === 'audio' ? "Record again" : "Switch to voice input"}
        >
          {isRecording ? '⏹' : inputMode === 'audio' && hasRecording ? '🎤' : '🎤'}
        </button>

        {/* Text/Audio mode toggle - only show when not recording */}
        {!isRecording && (
          <button
            style={{
              ...compactButtonStyle,
              background: inputMode === 'text' ? 'rgba(68,170,255,0.2)' : 'rgba(255,255,255,0.1)',
              fontSize: '12px'
            }}
            onClick={inputMode === 'text' ? () => setInputMode('audio') : switchToTextMode}
            disabled={isLoading}
            title={inputMode === 'text' ? "Switch to voice input" : "Switch to text input"}
          >
            {inputMode === 'text' ? 'Aa' : 'Aa'}
          </button>
        )}
        
        <button
          style={{
            ...compactButtonStyle,
            background: isLoading ? 'rgba(255,255,255,0.05)' : 'rgba(0,255,0,0.15)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            border: isLoading ? 'none' : '1px solid rgba(0,255,0,0.3)'
          }}
          onClick={sendQuery}
          disabled={isLoading || (!inputValue.trim() && !hasRecording)}
          onMouseEnter={(e) => !isLoading && (inputValue.trim() || hasRecording) && (e.target.style.background = 'rgba(0,255,0,0.25)')}
          onMouseLeave={(e) => !isLoading && (e.target.style.background = 'rgba(0,255,0,0.15)')}
          title="Send (auto-captures screenshot)"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
        
        <button
          style={compactButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,0,0,0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          title="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}