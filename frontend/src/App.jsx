import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams, Routes, Route } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import AgentInspector from './components/AgentInspector';
import SupportWidget from './components/SupportWidget';
import SettingsModal from './components/SettingsModal';
import { sendChatMessage, escalateSession } from './services/api';
import { useVoice } from './hooks/useVoice';
import { getSavedSessions, saveSession, deleteSession, renameSession } from './services/chatStorage';

const generateSessionId = () => 'sess_' + Math.random().toString(36).substring(2, 9);
const USER_ID = 'user123';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sessions, setSessions] = useState(() => getSavedSessions());
  
  // Extract active session ID from URL route (/c/:id or /)
  const routeSessionId = location.pathname.startsWith('/c/') 
    ? location.pathname.replace('/c/', '') 
    : null;

  const [sessionId, setSessionId] = useState(() => routeSessionId || generateSessionId());
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  
  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const {
    lang,
    setLang,
    isListening,
    isSpeaking,
    autoSpeak,
    setAutoSpeak,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  } = useVoice();

  const [activeSpeechIdx, setActiveSpeechIdx] = useState(null);

  // Sync state whenever URL route changes (/ vs /c/:id)
  useEffect(() => {
    const currentSaved = getSavedSessions();
    setSessions(currentSaved);

    if (location.pathname === '/' || location.pathname === '') {
      // Clean root: fresh new chat
      setSessionId(generateSessionId());
      setMessages([]);
      setIsEscalated(false);
      setActiveSpeechIdx(null);
      stopSpeaking();
    } else if (location.pathname.startsWith('/c/')) {
      const targetId = location.pathname.replace('/c/', '');
      const existing = currentSaved.find((s) => s.id === targetId);
      setSessionId(targetId);
      if (existing) {
        setMessages(existing.messages || []);
        setIsEscalated(Boolean(existing.isEscalated));
      } else {
        setMessages([]);
        setIsEscalated(false);
      }
      setActiveSpeechIdx(null);
      stopSpeaking();
    }
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Sync active conversation changes into 60-day storage
  useEffect(() => {
    if (messages.length > 0 && sessionId) {
      const existingSession = sessions.find((s) => s.id === sessionId);
      const firstUserMsg = messages.find((m) => m.role === 'user');
      const title = existingSession?.title || (firstUserMsg
        ? firstUserMsg.content.slice(0, 32) + (firstUserMsg.content.length > 32 ? '...' : '')
        : `Session ${sessionId.slice(-6)}`);

      const currentSessionData = {
        id: sessionId,
        title,
        messages,
        isEscalated,
      };

      const updated = saveSession(currentSessionData);
      setSessions(updated);
    }
  }, [messages, isEscalated, sessionId]);

  const handleToggleSpeak = (text, idx) => {
    if (activeSpeechIdx === idx && isSpeaking) {
      stopSpeaking();
      setActiveSpeechIdx(null);
    } else {
      stopSpeaking();
      setActiveSpeechIdx(idx);
      speak(text, lang, () => {
        setActiveSpeechIdx(null);
      });
    }
  };

  const handleSendMessage = async (text) => {
    let activeId = sessionId;
    // If user is currently on the clean root '/', transition URL to /c/:sessionId
    if (location.pathname === '/' || !location.pathname.startsWith('/c/')) {
      activeId = generateSessionId();
      setSessionId(activeId);
      navigate(`/c/${activeId}`, { replace: true });
    }

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await sendChatMessage(activeId, USER_ID, text);
      const assistantMsg = {
        role: 'assistant',
        content: data.response,
        intent: data.intent,
        confidence: data.confidence,
        sources: data.sources || [],
        tool_used: data.tool_used,
        tool_result: data.tool_result,
        escalated: data.escalated
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (data.escalated) {
        setIsEscalated(true);
      }

      if (autoSpeak && data.response) {
        setActiveSpeechIdx(messages.length + 1);
        speak(data.response, lang, () => {
          setActiveSpeechIdx(null);
        });
      }
    } catch (err) {
      console.error('API Error:', err);
      const errMsg = 'Sorry, an error occurred while connecting to the customer support backend service.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errMsg,
          intent: 'ERROR'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEscalate = async () => {
    if (isEscalated) return;
    try {
      await escalateSession(sessionId, USER_ID, 'User requested human support');
      setIsEscalated(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I have marked this conversation for human escalation. A support representative will be with you shortly.',
          escalated: true
        }
      ]);
    } catch (err) {
      console.error('Escalation failed:', err);
    }
  };

  const handleNewSession = () => {
    stopSpeaking();
    stopListening();
    navigate('/');
  };

  const handleSelectSession = (targetSessionId) => {
    stopSpeaking();
    stopListening();
    navigate(`/c/${targetSessionId}`);
  };

  const handleDeleteSession = (targetSessionId) => {
    const updated = deleteSession(targetSessionId);
    setSessions(updated);

    if (sessionId === targetSessionId || location.pathname === `/c/${targetSessionId}`) {
      navigate('/');
    }
  };

  const handleRenameSession = (targetSessionId, newTitle) => {
    const updated = renameSession(targetSessionId, newTitle);
    setSessions(updated);
  };

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');

  return (
    <div className="app-frame">
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewSession}
        sessionId={sessionId}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="main-chat-container">
        <Header 
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(true)}
          inspectorOpen={inspectorOpen}
          onToggleInspector={() => setInspectorOpen(!inspectorOpen)}
          isEscalated={isEscalated}
          onEscalate={handleManualEscalate}
          lang={lang}
          onLangChange={setLang}
          autoSpeak={autoSpeak}
          onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
          isWidgetMode={isWidgetMode}
          onToggleWidgetMode={() => setIsWidgetMode(!isWidgetMode)}
        />

        {/* Dismissible Widget Demo Top Banner */}
        {isWidgetMode && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              borderBottom: '1px solid var(--color-border-grid)',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: 'var(--color-text-bright)',
              zIndex: 20,
              animation: 'resoToastIn 0.25s ease-out forwards',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} style={{ color: 'var(--color-accent-amber)', flexShrink: 0 }} />
              <span>
                <strong>Embeddable Support Widget Demo:</strong> Look at the bottom right corner of the page to interact with the floating support widget!
              </span>
            </div>
            <button
              type="button"
              className="btn-sidebar-toggle"
              onClick={() => setIsWidgetMode(false)}
              style={{ padding: '2px 6px' }}
              title="Close demo banner"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="chat-viewport">
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={handleSendMessage} />
          ) : (
            <div className="messages-wrapper">
              {messages.map((msg, idx) => (
                <ChatMessage 
                  key={idx}
                  message={msg}
                  onSpeakMessage={(txt) => handleToggleSpeak(txt, idx)}
                  isSpeaking={isSpeaking && activeSpeechIdx === idx}
                  onStopSpeaking={() => {
                    stopSpeaking();
                    setActiveSpeechIdx(null);
                  }}
                />
              ))}

              {loading && (
                <div className="thinking-card">
                  <div className="pulsing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Searching knowledge & analyzing request...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={loading}
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
          transcript={transcript}
        />
      </main>

      <AgentInspector 
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        lastMessage={lastAssistantMsg}
      />

      {/* Floating Support Widget (appears at bottom right) */}
      {isWidgetMode && (
        <SupportWidget 
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
          onSpeakMessage={(txt) => speak(txt, lang)}
          isSpeaking={isSpeaking}
          onStopSpeaking={stopSpeaking}
        />
      )}

      {/* Settings & Support Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
