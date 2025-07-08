import React, { useState, useEffect, useCallback, useRef } from 'react';
import CompactOverlay from './CompactOverlay';

const compactInputStyle = {
  background: 'transparent',
  border: 'gray 1px solid',
  color: '#ffffff',
  fontSize: '14px',
  flex: 1,
  outline: 'none',
  minWidth:'300px',
  minHeight: '36px',
  padding: '8px 12px',
  borderRadius: '20px',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
  transition: 'all 0.2s ease',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#ffffff',
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

const containerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '40px',
  pointerEvents: 'none',
  maxHeight: '100vh',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const panelStyle = {
  background: `
    linear-gradient(135deg, 
      rgba(10,10,20,0.98) 0%, 
      rgba(20,20,40,0.95) 25%,
      rgba(15,15,35,0.97) 50%,
      rgba(25,25,45,0.95) 75%,
      rgba(18,18,38,0.98) 100%
    )
  `,
  backdropFilter: 'blur(50px) saturate(2) brightness(1.1)',
  borderRadius: '28px',
  padding: '0',
  boxShadow: `
    0 40px 80px rgba(0,0,0,0.7),
    0 20px 40px rgba(0,0,0,0.4),
    0 0 0 1px rgba(255,255,255,0.12),
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.2)
  `,
  border: '1px solid rgba(255,255,255,0.15)',
  minWidth: '580px',
  maxWidth: '680px',
  height: '760px',
  pointerEvents: 'auto',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  transform: 'translateZ(0)',
  willChange: 'transform',
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(0,122,255,0.02) 0%, rgba(0,212,255,0.01) 100%)',
    borderRadius: '28px',
    pointerEvents: 'none'
  }
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px 32px 20px 32px',
  borderBottom: '1px solid rgba(255,255,255,0.12)',
  background: `
    linear-gradient(135deg, 
      rgba(255,255,255,0.05) 0%, 
      rgba(255,255,255,0.02) 50%,
      rgba(255,255,255,0.01) 100%
    )
  `,
  backdropFilter: 'blur(20px)',
  position: 'relative',
  '::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(0,122,255,0.3) 50%, transparent 100%)'
  }
};

const chatContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, transparent 100%)',
};

const messageContainerStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '4px'
};

const userMessageContainerStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '4px',
  marginBottom: '4px',
  flexDirection: 'row-reverse'
};

const userMessageStyle = {
  background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-hover))',
  color: 'var(--color-text)',
  padding: '12px 16px',
  borderRadius: '24px 24px 8px 24px',
  maxWidth: '320px',
  fontSize: '15px',
  lineHeight: '1.6',
  boxShadow: '0 0 12px rgba(138, 43, 226, 0.4)',
  position: 'relative',
  fontWeight: '500',
  letterSpacing: '0.2px',
  transform: 'translateZ(0)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
    borderRadius: '24px 24px 8px 24px',
    pointerEvents: 'none'
  }
};

const aiMessageStyle = {
  background: `
    linear-gradient(135deg, 
      rgba(255,255,255,0.15) 0%, 
      rgba(255,255,255,0.08) 50%,
      rgba(255,255,255,0.12) 100%
    )
  `,
  color: '#f8f9fa',
  padding: '16px 20px',
  borderRadius: '24px 24px 24px 8px',
  maxWidth: '80%',
  wordBreak: 'break-word',
  fontSize: '15px',
  lineHeight: '1.6',
  boxShadow: `
    0 8px 24px rgba(0,0,0,0.2),
    0 4px 12px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.1)
  `,
  border: '1px solid rgba(255,255,255,0.08)',
  position: 'relative',
  fontWeight: '400',
  letterSpacing: '0.3px',
  backdropFilter: 'blur(10px)',
  transform: 'translateZ(0)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
    borderRadius: '24px 24px 24px 8px',
    pointerEvents: 'none'
  }
};

const errorMessageStyle = {
  background: 'linear-gradient(135deg, rgba(255,99,99,0.15) 0%, rgba(255,71,87,0.1) 100%)',
  color: '#ffb3b3',
  padding: '14px 18px',
  borderRadius: '20px 20px 20px 6px',
  maxWidth: '80%',
  wordBreak: 'break-word',
  fontSize: '14px',
  lineHeight: '1.5',
  border: '1px solid rgba(255,99,99,0.2)',
  boxShadow: '0 2px 8px rgba(255,0,0,0.1)'
};

const inputContainerStyle = {
  padding: '24px 28px 28px 28px',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-end',
  background: `
    linear-gradient(135deg, 
      rgba(255,255,255,0.04) 0%, 
      rgba(255,255,255,0.02) 50%,
      rgba(255,255,255,0.01) 100%
    )
  `,
  backdropFilter: 'blur(20px)',
  position: 'relative',
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(0,122,255,0.3) 50%, transparent 100%)'
  }
};

const textareaStyle = {
  background: `
    linear-gradient(135deg, 
      rgba(255,255,255,0.12) 0%, 
      rgba(255,255,255,0.08) 50%,
      rgba(255,255,255,0.10) 100%
    )
  `,
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '24px',
  padding: '16px 20px',
  color: '#f8f9fa',
  fontSize: '15px',
  resize: 'none',
  outline: 'none',
  flex: 1,
  maxHeight: '120px',
  minHeight: '52px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(20px)',
  fontWeight: '400',
  letterSpacing: '0.3px',
  lineHeight: '1.5',
  boxShadow: `
    0 4px 16px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.1)
  `,
  '::placeholder': {
    color: 'rgba(255,255,255,0.5)'
  },
  ':focus': {
    borderColor: 'rgba(0,122,255,0.6)',
    boxShadow: `
      0 0 0 4px rgba(0,122,255,0.15),
      0 8px 32px rgba(0,122,255,0.2),
      inset 0 1px 0 rgba(255,255,255,0.15)
    `,
    background: `
      linear-gradient(135deg, 
        rgba(255,255,255,0.15) 0%, 
        rgba(255,255,255,0.10) 50%,
        rgba(255,255,255,0.12) 100%
      )
    `
  }
};

const avatarStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  flexShrink: 0,
  fontWeight: '600',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'translateZ(0)'
};

const userAvatarStyle = {
  ...avatarStyle,
  background: `
    linear-gradient(135deg, 
      #007AFF 0%, 
      #0056CC 50%,
      #003D99 100%
    )
  `,
  boxShadow: `
    0 8px 24px rgba(0,122,255,0.4),
    0 4px 12px rgba(0,122,255,0.2),
    inset 0 1px 0 rgba(255,255,255,0.2)
  `,
  border: '2px solid rgba(255,255,255,0.15)',
  '::before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: 'linear-gradient(135deg, rgba(0,122,255,0.3) 0%, rgba(0,86,204,0.2) 100%)',
    borderRadius: '50%',
    zIndex: -1,
    animation: 'pulse 2s infinite'
  }
};

const aiAvatarStyle = {
  ...avatarStyle,
  background: `
    linear-gradient(135deg, 
      rgba(255,255,255,0.18) 0%, 
      rgba(255,255,255,0.08) 50%,
      rgba(255,255,255,0.15) 100%
    )
  `,
  border: '2px solid rgba(255,255,255,0.12)',
  boxShadow: `
    0 8px 24px rgba(0,0,0,0.15),
    0 4px 12px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.1)
  `,
  backdropFilter: 'blur(10px)',
  '::before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(0,122,255,0.1) 100%)',
    borderRadius: '50%',
    zIndex: -1,
    animation: 'pulse 3s infinite ease-in-out'
  }
};

const titleSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const statusDotStyle = {
  width: '8px',
  height: '8px',
  background: 'linear-gradient(135deg, #00d4ff 0%, #00b4d8 50%, #0077b6 100%)',
  borderRadius: '50%',
  animation: 'pulse 2s infinite ease-in-out',
  boxShadow: `
    0 0 12px rgba(0,212,255,0.5),
    0 0 24px rgba(0,180,216,0.3),
    inset 0 1px 0 rgba(255,255,255,0.3)
  `,
  position: 'relative',
  '::before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(0,180,216,0.1) 100%)',
    borderRadius: '50%',
    animation: 'pulse 2s infinite ease-in-out',
    zIndex: -1
  }
};

const titleStyle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700',
  margin: 0,
  letterSpacing: '0.5px',
  background: 'linear-gradient(135deg, #ffffff 0%, #e8f4f8 50%, #ffffff 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundSize: '200% 200%',
  animation: 'gradientShift 3s ease-in-out infinite',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const controlsStyle = {
  display: 'flex',
  gap: '8px'
};

const buttonStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: '#ffffff',
  backdropFilter: 'blur(10px)'
};

const timestampStyle = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.4)',
  marginTop: '4px',
  textAlign: 'right'
};

const messageGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

export default function OverlayAssistant() {
  const [dataUrl, setDataUrl] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [inputMode, setInputMode] = useState('text');
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [overlayState, setOverlayState] = useState('compact');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: '👋 Welcome to SnapInsight AI! I can analyze screenshots and answer questions about what you see. Just type your query and I\'ll automatically capture a screenshot to provide context!', 
      timestamp: new Date(), 
      id: 1 
    }
  ]);
  const [error, setError] = useState('');

  const notifyActivity = useCallback(() => {
    if (window.screenshot?.notifyUserActivity) {
      window.screenshot.notifyUserActivity();
    }
  }, []);

  const keepAlive = useCallback(() => {
    if (window.screenshot?.keepOverlayAlive) {
      window.screenshot.keepOverlayAlive();
    }
  }, []);

  const handleScreenshotCaptured = useCallback((dataUrl) => {
    setDataUrl(dataUrl);
    if (dataUrl) {
      notifyActivity();
      if (overlayState === 'compact') {
        handleExpand();
      }
    }
  }, [notifyActivity, overlayState]);

  const handleOverlayStateChanged = useCallback((state) => {
    console.log('OverlayAssistant: handleOverlayStateChanged called with state:', state);
    setOverlayState(state);
  }, []);

  const handleAutoCaptureResponse = useCallback(async (captureData) => {
    try {
      const isAudioData = captureData.audioData && !captureData.queryText;
      
      let userMessage;
      
      if (isAudioData) {
        userMessage = {
          role: 'user',
          content: '🎤 Voice message',
          timestamp: new Date(),
          id: Date.now(),
          isAudio: true
        };
      } else {
        const userMessageExists = messages.some(msg => 
          msg.content === captureData.queryText && 
          msg.role === 'user' && 
          Date.now() - new Date(msg.timestamp).getTime() < 5000
        );

        if (!userMessageExists) {
          userMessage = {
            role: 'user',
            content: captureData.queryText,
            timestamp: new Date(),
            id: Date.now()
          };
        }
      }
      
      if (userMessage) {
        setMessages(prev => [...prev, userMessage]);
      }

      if (captureData.error && !captureData.screenshot) {
        throw new Error(captureData.error);
      }

      const formData = new FormData();
      
      if (isAudioData) {
        const audioBuffer = new Uint8Array(captureData.audioData);
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        formData.append('audio', audioBlob, 'recording.wav');
      } else {
        formData.append('text', captureData.queryText);
      }
      
      if (captureData.screenshot) {
        const response = await fetch(captureData.screenshot);
        const blob = await response.blob();
        formData.append('image', blob, 'screenshot.png');
      }

      const apiResponse = await fetch('http://0.0.0.0:8000/query', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      
      const aiMessage = {
        role: 'ai',
        content: result.result || 'No response received',
        timestamp: new Date(),
        id: Date.now() + 1,
        screenshot: captureData.screenshot
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      console.error('Auto-capture API Error:', err);
      const errorMessage = {
        role: 'ai',
        content: `❌ Sorry, I encountered an error: ${err.message}`,
        timestamp: new Date(),
        id: Date.now() + 1,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('overlay-animations');
      if (!existingStyle) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'overlay-animations';
        styleSheet.textContent = `
          @keyframes pulse {
            0%, 100% { 
              opacity: 1; 
              transform: scale(1);
            }
            50% { 
              opacity: 0.7; 
              transform: scale(1.05);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `;
        document.head.appendChild(styleSheet);
      }
    }

    if (typeof window !== 'undefined' && window.screenshot) {
      window.screenshot.screenshotCaptured(handleScreenshotCaptured);
      window.screenshot.onOverlayStateChanged(handleOverlayStateChanged);

      window.screenshot.onAutoCaptureReady((data) => {
        handleAutoCaptureResponse(data);
      });

      const trackActivity = () => notifyActivity();
      
      document.addEventListener('click', trackActivity);
      document.addEventListener('mousemove', trackActivity);
      document.addEventListener('keydown', trackActivity);
      document.addEventListener('scroll', trackActivity);

      const keepAliveInterval = setInterval(keepAlive, 5000);

      return () => {
        if (window.screenshot?.removeScreenshotTaken) {
          window.screenshot.removeScreenshotTaken();
        }
        if (window.screenshot?.removeOverlayStateListener) {
          window.screenshot.removeOverlayStateListener();
        }
        if (window.screenshot?.removeAutoCaptureListener) {
          window.screenshot.removeAutoCaptureListener();
        }
        
        document.removeEventListener('click', trackActivity);
        document.removeEventListener('mousemove', trackActivity);
        document.removeEventListener('keydown', trackActivity);
        document.removeEventListener('scroll', trackActivity);
        
        clearInterval(keepAliveInterval);
      };
    }
  }, [handleScreenshotCaptured, handleOverlayStateChanged, notifyActivity, keepAlive]);

  const handleExpand = () => {
    console.log('OverlayAssistant: handleExpand called, window.screenshot:', typeof window.screenshot);
    if (window.screenshot?.expandOverlay) {
      console.log('OverlayAssistant: Calling window.screenshot.expandOverlay');
      window.screenshot.expandOverlay();
    } else {
      console.log('OverlayAssistant: window.screenshot.expandOverlay not available');
    }
  };

  const handleCompact = () => {
    if (window.screenshot?.compactOverlay) {
      window.screenshot.compactOverlay();
    }
  };

  const handleCapture = () => {
    notifyActivity();
    if (window.screenshot?.captureScreenshot) {
      window.screenshot.captureScreenshot();
    }
  };

  const handleRegionCapture = () => {
    notifyActivity();
    if (window.screenshot?.captureRegionScreenshot) {
      window.screenshot.captureRegionScreenshot();
    }
  };

  const handleOpenFull = () => {
    notifyActivity();
    if (window.screenshot?.showMainWindow) {
      window.screenshot.showMainWindow();
    }
  };

  const handleClose = () => {
    if (window.screenshot?.hideOverlay) {
      window.screenshot.hideOverlay();
    }
  };

  const sendQuery = async () => {
    const hasTextInput = inputValue.trim();
    const hasAudioInput = hasRecording && audioChunksRef.current.length > 0;
    
    if (!hasTextInput && !hasAudioInput) {
      setError('Please enter a text query or record an audio message');
      return;
    }

    setIsLoading(true);
    setError('');
    notifyActivity();

    try {
      if (inputMode === 'text' && hasTextInput) {
        const userMessage = {
          role: 'user',
          content: inputValue.trim(),
          timestamp: new Date(),
          id: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        const queryText = inputValue.trim();
        setInputValue('');

        if (window.screenshot?.autoCaptureAndQuery) {
          await window.screenshot.autoCaptureAndQuery(queryText);
        } else {
          throw new Error('Auto-capture functionality not available');
        }
      } else if (inputMode === 'audio' && hasAudioInput) {
        const audioMessage = {
          role: 'user',
          content: '🎤 Voice message',
          timestamp: new Date(),
          id: Date.now(),
          isAudio: true
        };

        setMessages(prev => [...prev, audioMessage]);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        if (window.screenshot?.autoCaptureAndQueryWithAudio) {
          await window.screenshot.autoCaptureAndQueryWithAudio(audioBlob);
        } else {
          throw new Error('Audio capture functionality not available');
        }
        
        setHasRecording(false);
        audioChunksRef.current = [];
      }
      
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = {
        role: 'ai',
        content: `❌ Sorry, I encountered an error: ${err.message}`,
        timestamp: new Date(),
        id: Date.now() + 1,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        role: 'ai', 
        content: '👋 Welcome to SnapInsight AI! I can analyze screenshots and answer questions about what you see. Just type your query and I\'ll automatically capture a screenshot to provide context!', 
        timestamp: new Date(), 
        id: 1 
      }
    ]);
    setError('');
    setDataUrl(null);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (overlayState === 'compact') {
    return (
      <CompactOverlay 
        onExpand={handleExpand}
        onClose={handleClose}
      />
    );
  }

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    notifyActivity();
  };

  const handleKeyPress = (e) => {
    notifyActivity();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const sendButtonStyle = {
    background: isLoading ? 
      'rgba(255,255,255,0.08)' : 
      `linear-gradient(135deg, 
        #007AFF 0%, 
        #0056CC 50%,
        #003D99 100%
      )`,
    border: 'none',
    borderRadius: '24px',
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    color: 'white',
    fontSize: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: !isLoading ? 
      `0 8px 32px rgba(0,122,255,0.4),
       0 4px 16px rgba(0,122,255,0.2),
       inset 0 1px 0 rgba(255,255,255,0.2)` : 
      'none',
    transform: isLoading ? 'scale(0.95)' : 'scale(1)',
    position: 'relative',
    overflow: 'hidden',
    '::before': !isLoading ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
      borderRadius: '24px',
      opacity: 0,
      transition: 'opacity 0.3s ease'
    } : {},
    ':hover': !isLoading ? {
      transform: 'scale(1.05)',
      boxShadow: `
        0 12px 40px rgba(0,122,255,0.5),
        0 6px 20px rgba(0,122,255,0.3),
        inset 0 1px 0 rgba(255,255,255,0.3)
      `
    } : {},
    ':active': !isLoading ? {
      transform: 'scale(0.98)'
    } : {}
  };

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
        stream.getTracks().forEach(track => track.stop());
      };
      
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setInputMode('audio');
      notifyActivity();
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Error accessing microphone: " + err.message);
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
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { 
              opacity: 1; 
              transform: scale(1);
            }
            50% { 
              opacity: 0.7; 
              transform: scale(1.05);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          
          @keyframes glow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(0,122,255,0.3);
            }
            50% { 
              box-shadow: 0 0 40px rgba(0,122,255,0.6), 0 0 60px rgba(0,212,255,0.3);
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
          }
          
          .chat-container {
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.3) rgba(255,255,255,0.05);
          }
          
          .chat-container::-webkit-scrollbar {
            width: 8px;
          }
          
          .chat-container::-webkit-scrollbar-track {
            background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
            border-radius: 4px;
            margin: 8px 0;
          }
          
          .chat-container::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, rgba(0,122,255,0.4) 0%, rgba(0,86,204,0.3) 100%);
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
          }
          
          .chat-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, rgba(0,122,255,0.6) 0%, rgba(0,86,204,0.5) 100%);
            transform: scale(1.1);
          }
          
          .message-fade-in {
            animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .user-message-slide {
            animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .ai-message-slide {
            animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .typing-indicator {
            display: flex;
            gap: 6px;
            padding: 16px 0;
            align-items: center;
          }
          
          .typing-dot {
            width: 10px;
            height: 10px;
            background: linear-gradient(135deg, rgba(0,122,255,0.8) 0%, rgba(0,212,255,0.6) 100%);
            border-radius: 50%;
            animation: typing 1.6s infinite ease-in-out;
            box-shadow: 0 2px 8px rgba(0,122,255,0.3);
          }
          
          .typing-dot:nth-child(2) { animation-delay: 0.2s; }
          .typing-dot:nth-child(3) { animation-delay: 0.4s; }
          
          @keyframes typing {
            0%, 60%, 100% { 
              transform: scale(0.8) translateY(0); 
              opacity: 0.5; 
            }
            30% { 
              transform: scale(1.2) translateY(-8px); 
              opacity: 1; 
            }
          }
          
          .status-dot-glow {
            animation: glow 2s infinite ease-in-out;
          }
          
          .floating-element {
            animation: float 3s ease-in-out infinite;
          }
          
          .message-hover:hover {
            transform: translateY(-2px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .user-message-text {
            word-wrap: normal !important;
            word-break: normal !important;
            white-space: normal !important;
            overflow-wrap: normal !important;
            text-overflow: clip !important;
            hyphens: none !important;
            line-break: auto !important;
          }
          
          .button-hover:hover {
            transform: translateY(-1px) scale(1.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #ffffff 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% 200%;
            animation: gradientShift 3s ease-in-out infinite;
          }
          
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          .glass-effect {
            backdrop-filter: blur(20px) saturate(180%);
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          .shimmer {
            position: relative;
            overflow: hidden;
          }
          
          .shimmer::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 2s infinite;
          }
          
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}
      </style>

      <div style={containerStyle}>
        <div style={panelStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={titleSectionStyle}>
              <div style={statusDotStyle}></div>
              <h3 style={titleStyle}>SnapInsight AI</h3>
            </div>
            <div style={controlsStyle}>
              <button 
                style={buttonStyle} 
                onClick={clearChat}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(255,193,7,0.25) 0%, rgba(255,165,0,0.15) 100%)';
                  e.target.style.transform = 'translateY(-1px) scale(1.05)';
                  e.target.style.boxShadow = '0 8px 24px rgba(255,193,7,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
                title="Clear chat"
                className="button-hover"
              >
                🗑️
              </button>
              <button 
                style={buttonStyle} 
                onClick={handleCompact}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(0,123,255,0.25) 0%, rgba(0,86,204,0.15) 100%)';
                  e.target.style.transform = 'translateY(-1px) scale(1.05)';
                  e.target.style.boxShadow = '0 8px 24px rgba(0,123,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
                title="Minimize"
                className="button-hover"
              >
                ↙
              </button>
              <button 
                style={buttonStyle} 
                onClick={handleClose}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(220,53,69,0.25) 0%, rgba(255,0,0,0.15) 100%)';
                  e.target.style.transform = 'translateY(-1px) scale(1.05)';
                  e.target.style.boxShadow = '0 8px 24px rgba(220,53,69,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
                title="Close"
                className="button-hover"
              >
                ×
              </button>
            </div>
          </div>

          {/* Chat Container */}
          <div ref={chatRef} style={chatContainerStyle} className="chat-container">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`message-fade-in ${message.role === 'user' ? 'user-message-slide' : 'ai-message-slide'}`} 
                style={{ 
                  animationDelay: `${index * 0.15}s`,
                  opacity: 0,
                  animationFillMode: 'forwards'
                }}
              >
                {message.role === 'user' ? (
                  <div style={userMessageContainerStyle}>
                    <div style={userAvatarStyle} className="floating-element">
                      <img 
                        src="https://img.icons8.com/3d-fluency/94/account.png" 
                        alt="User"
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline';
                        }}
                      />
                      <span style={{ display: 'none' }}>{message.isAudio ? '🎤' : '👤'}</span>
                    </div>
                    <div style={messageGroupStyle}>
                      <div style={userMessageStyle} className="message-hover shimmer user-message-text">
                        {message.content}
                      </div>
                      <div style={{...timestampStyle, textAlign: 'right'}}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={messageContainerStyle}>
                    <div style={aiAvatarStyle} className="floating-element">
                      <img 
                        src="https://img.icons8.com/3d-fluency/94/chatbot.png" 
                        alt="AI Assistant"
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline';
                        }}
                      />
                      <span style={{ display: 'none' }}>🤖</span>
                    </div>
                    <div style={messageGroupStyle}>
                      <div style={message.isError ? errorMessageStyle : aiMessageStyle} className="message-hover glass-effect">
                        {message.content}
                        {message.screenshot && (
                          <div style={{ 
                            marginTop: '16px', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            borderRadius: '16px', 
                            overflow: 'hidden',
                            boxShadow: `
                              0 8px 32px rgba(0,0,0,0.3),
                              0 4px 16px rgba(0,0,0,0.2),
                              inset 0 1px 0 rgba(255,255,255,0.1)
                            `,
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            transform: 'translateZ(0)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}>
                            <img 
                              src={message.screenshot} 
                              alt="Screenshot context" 
                              style={{ 
                                width: '100%', 
                                height: 'auto', 
                                maxHeight: '240px', 
                                objectFit:'cover',
                                display: 'block',
                                borderRadius: '16px',
                                transition: 'all 0.3s ease'
                              }}
                              className="message-hover"
                            />
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '500',
                              backdropFilter: 'blur(10px)'
                            }}>
                              📸 Screenshot
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={timestampStyle}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div style={messageContainerStyle}>
                <div style={aiAvatarStyle}>
                  <img 
                    src="https://img.icons8.com/3d-fluency/94/chatbot.png" 
                    alt="AI Assistant"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'inline';
                    }}
                  />
                  <span style={{ display: 'none' }}>🤖</span>
                </div>
                <div style={aiMessageStyle}>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Container */}
          <div style={inputContainerStyle}>
            {inputMode === 'text' ? (
              <>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me about what you see on screen..."
                  style={{
                    ...textareaStyle,
                    ':focus': {
                      borderColor: 'rgba(0,122,255,0.5)',
                      boxShadow: '0 0 0 3px rgba(0,122,255,0.1)'
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleMicrophoneClick}
                  style={{
                    ...buttonStyle,
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255,255,255,0.08)',
                    ':hover': { background: 'rgba(255,255,255,0.12)' }
                  }}
                  title="Switch to voice input"
                >
                  🎤
                </button>
              </>
            ) : (
              <>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '22px',
                  padding: '14px 18px',
                  minHeight: '48px'
                }}>
                  {isRecording ? (
                    <>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        background: '#ff4444',
                        borderRadius: '50%',
                        animation: 'pulse 1s infinite'
                      }}></div>
                      <span style={{ color: '#f0f0f0', fontSize: '14px' }}>
                        Recording... Click to stop
                      </span>
                    </>
                  ) : hasRecording ? (
                    <>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        background: '#00d4ff',
                        borderRadius: '50%'
                      }}></div>
                      <span style={{ color: '#f0f0f0', fontSize: '14px' }}>
                        Voice message ready to send
                      </span>
                    </>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                      Click the microphone to start recording
                    </span>
                  )}
                </div>
                <button
                  onClick={handleMicrophoneClick}
                  style={{
                    ...buttonStyle,
                    width: '48px',
                    height: '48px',
                    background: isRecording ? 
                      'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)' : 
                      'rgba(255,255,255,0.08)'
                  }}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? '⏹️' : '🎤'}
                </button>
                <button
                  onClick={switchToTextMode}
                  style={{
                    ...buttonStyle,
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255,255,255,0.08)'
                  }}
                  title="Switch to text input"
                >
                  ⌨️
                </button>
              </>
            )}
            
            <button
              onClick={sendQuery}
              disabled={isLoading || (inputMode === 'text' && !inputValue.trim()) || (inputMode === 'audio' && !hasRecording)}
              style={sendButtonStyle}
              title="Send message"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div style={{
              padding: '12px 24px',
              background: 'rgba(255,99,99,0.1)',
              borderTop: '1px solid rgba(255,99,99,0.2)',
              color: '#ffb3b3',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}