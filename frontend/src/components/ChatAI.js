'use client';
import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Send, Mic, MicOff, Type } from 'lucide-react';
import TypingMessage from './TypingMessage';

export default function ChatAI() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '👋 Hello! How can I assist you today? I can help with general questions and analyze screenshots you provide.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'audio'
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const chatRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const user = { a: 'username' };
  const breadcrumbItems = [
    { title: 'Home' },
    { title: 'Chat' },
  ];

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
        stream.getTracks().forEach(track => track.stop());
      };
      
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setInputMode('audio');
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
  };

  // Screenshot handling
  const handleScreenshotUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshot(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    const hasTextInput = input.trim();
    const hasAudioInput = hasRecording && audioChunksRef.current.length > 0;
    
    if (!hasTextInput && !hasAudioInput) return;

    let userMessage;
    if (inputMode === 'text' && hasTextInput) {
      userMessage = {
        role: 'user',
        content: input.trim(),
        timestamp: new Date(),
        screenshot: screenshot
      };
    } else if (inputMode === 'audio' && hasAudioInput) {
      userMessage = {
        role: 'user',
        content: '🎤 Voice message',
        timestamp: new Date(),
        isAudio: true,
        screenshot: screenshot
      };
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setHasRecording(false);
    const tempScreenshot = screenshot;
    setScreenshot(null);
    setTyping(true);

    try {
      const formData = new FormData();
      
      if (inputMode === 'text') {
        formData.append('text', userMessage.content);
      } else {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        formData.append('audio', audioBlob, 'recording.wav');
      }
      
      // Clear audio chunks after creating the blob
      audioChunksRef.current = [];
      
      if (tempScreenshot) {
        const response = await fetch(tempScreenshot);
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
      
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: result.result || 'No response received',
          timestamp: new Date(),
          screenshot: tempScreenshot
        }
      ]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: `❌ Sorry, I encountered an error: ${error.message}`,
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-4xl mx-auto card shadow-lg">
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, index) => (
          msg.role === 'assistant' && msg.isTyping ? (
            <TypingMessage key={index} content={msg.content} />
          ) : (
            <MessageBubble
              key={index}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              screenshot={msg.screenshot}
              isAudio={msg.isAudio}
              isError={msg.isError}
            />
          )
        ))}

        {typing && <TypingIndicator />}
      </div>

      {/* Screenshot preview */}
      {screenshot && (
        <div className="px-4 py-2 bg-[var(--color-glass)] border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <img src={screenshot} alt="Screenshot preview" className="w-16 h-16 object-cover rounded border" />
            <span className="text-sm text-[var(--color-subtext)]">Screenshot attached</span>
            <button 
              onClick={() => setScreenshot(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-glass)]">
        {/* Input mode display for audio */}
        {inputMode === 'audio' && (
          <div className="mb-3 px-3 py-2 bg-[var(--color-bg-start)] rounded-lg border border-[var(--color-border)]">
            <div className={`text-sm ${isRecording ? 'text-red-500' : hasRecording ? 'text-green-500' : 'text-[var(--color-subtext)]'}`}>
              {isRecording ? (
                <span className="animate-pulse">🎤 Recording... Speak now</span>
              ) : hasRecording ? (
                '✅ Recording ready to send'
              ) : (
                '🎤 Press microphone to record'
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 items-end">
          {inputMode === 'text' ? (
            <input
              className="flex-1 px-4 py-2 bg-transparent border border-[var(--color-border)] rounded-full text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={typing}
            />
          ) : (
            <div className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-full flex items-center text-[var(--color-subtext)] min-h-[40px]">
              {isRecording ? 'Recording...' : hasRecording ? 'Audio ready' : 'Audio mode'}
            </div>
          )}

          {/* Screenshot upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center p-2 text-[var(--color-text)] hover:bg-[var(--color-bg-start)] rounded-full transition"
            title="Upload screenshot"
          >
            📷
          </button>

          {/* Microphone button */}
          <button
            onClick={handleMicrophoneClick}
            className={`flex items-center justify-center p-2 rounded-full transition ${
              inputMode === 'audio' 
                ? isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : hasRecording 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text)] hover:bg-[var(--color-bg-start)]'
            }`}
            disabled={typing}
            title={isRecording ? "Stop recording" : "Record voice message"}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Mode toggle button */}
          {!isRecording && (
            <button
              onClick={inputMode === 'text' ? () => setInputMode('audio') : switchToTextMode}
              className={`flex items-center justify-center p-2 rounded-full transition ${
                inputMode === 'text' 
                  ? 'text-[var(--color-text)] hover:bg-[var(--color-bg-start)]'
                  : 'bg-[var(--color-primary)] text-white'
              }`}
              disabled={typing}
              title={inputMode === 'text' ? "Switch to voice input" : "Switch to text input"}
            >
              <Type size={20} />
            </button>
          )}

          <button 
            onClick={sendMessage} 
            disabled={typing || (!input.trim() && !hasRecording)}
            aria-label="Send message" 
            className={`flex items-center justify-center p-3 rounded-full transition ${
              (input.trim() || hasRecording) && !typing
                ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            {typing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Hidden file input for screenshot upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleScreenshotUpload}
        className="hidden"
      />
    </div>
  );
}
