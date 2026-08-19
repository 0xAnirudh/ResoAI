import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  FileText, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Globe, 
  Mail, 
  Terminal, 
  Code2, 
  Phone, 
  Search, 
  Copy, 
  Check, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

function parseLinksAndEmails(str) {
  if (!str) return null;

  // Regex matching Markdown Links [text](url), Raw URLs (http://, https://, www.), and Email addresses (name@domain.com)
  const combinedRegex = /(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s<]+|www\.[^\s<]+)|([\w\.-]+@[\w\.-]+\.\w+)/g;
  
  let match;
  let lastIdx = 0;
  const elements = [];

  while ((match = combinedRegex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      elements.push(str.slice(lastIdx, match.index));
    }

    if (match[1]) {
      // 1. Markdown link [text](url)
      const label = match[2];
      let targetUrl = match[3];
      if (targetUrl.includes('@') && !targetUrl.startsWith('mailto:') && !targetUrl.startsWith('http')) {
        targetUrl = 'mailto:' + targetUrl;
      }
      elements.push(
        <a
          key={match.index}
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-interactive-link"
        >
          {label} <ExternalLink size={10} />
        </a>
      );
    } else if (match[4]) {
      // 2. Raw URL (http://, https://, www.)
      let rawUrl = match[4];
      const hrefUrl = rawUrl.startsWith('www.') ? 'https://' + rawUrl : rawUrl;
      elements.push(
        <a
          key={match.index}
          href={hrefUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-interactive-link"
        >
          {rawUrl} <ExternalLink size={10} />
        </a>
      );
    } else if (match[5]) {
      // 3. Raw Email Address (name@domain.com)
      const email = match[5];
      elements.push(
        <a
          key={match.index}
          href={`mailto:${email}`}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-interactive-link email"
        >
          <Mail size={11} /> {email}
        </a>
      );
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < str.length) {
    elements.push(str.slice(lastIdx));
  }

  return elements;
}

function renderTextWithLinksAndBold(text) {
  if (!text) return null;
  
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--color-text-bright)', fontWeight: 600 }}>
          {parseLinksAndEmails(part.slice(2, -2))}
        </strong>
      );
    }
    return <React.Fragment key={i}>{parseLinksAndEmails(part)}</React.Fragment>;
  });
}

function FormattedContent({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  return (
    <div className="formatted-text-block">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: 6 }} />;

        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[-•*]\s*/, '');
          return (
            <div key={idx} className="formatted-list-item">
              <span className="list-bullet">•</span>
              <span>{renderTextWithLinksAndBold(itemText)}</span>
            </div>
          );
        }

        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="formatted-heading">
              {headingText}
            </h4>
          );
        }

        return (
          <p key={idx} className="formatted-paragraph">
            {renderTextWithLinksAndBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatMessage({ 
  message, 
  onSpeakMessage,
  isSpeaking,
  onStopSpeaking
}) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);
  const [showTool, setShowTool] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const sources = message.sources || [];
  const toolUsed = message.tool_used;
  const toolResult = message.tool_result;
  const isEscalated = message.escalated;

  const getDomain = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const handleSpeakerClick = () => {
    if (isSpeaking) {
      if (onStopSpeaking) onStopSpeaking();
    } else {
      if (onSpeakMessage) onSpeakMessage(message.content);
    }
  };

  const getToolMeta = (name) => {
    switch (name) {
      case 'execute_python_calc':
        return {
          title: 'Python Math Engine',
          badge: 'python_eval()',
          icon: <Terminal size={12} style={{ color: 'var(--color-accent-blue)' }} />,
        };
      case 'web_search':
        return {
          title: 'Live Web Search',
          badge: 'web_search()',
          icon: <Search size={12} style={{ color: 'var(--color-accent-green)' }} />,
        };
      case 'send_email':
        return {
          title: 'Email Dispatch',
          badge: 'send_email()',
          icon: <Mail size={12} style={{ color: 'var(--color-accent-amber)' }} />,
        };
      case 'make_phone_call':
        return {
          title: 'Voice Telephony',
          badge: 'telephony()',
          icon: <Phone size={12} style={{ color: 'var(--color-accent-green)' }} />,
        };
      default:
        return {
          title: 'Tool Execution',
          badge: `${name}()`,
          icon: <Zap size={12} style={{ color: 'var(--color-brand-primary)' }} />,
        };
    }
  };

  const toolMeta = getToolMeta(toolUsed);
  const isToolSuccess = toolResult && toolResult.success !== false;

  const handleCopyToolResult = () => {
    const raw = typeof toolResult === 'object' ? JSON.stringify(toolResult, null, 2) : String(toolResult);
    navigator.clipboard.writeText(raw);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="msg-avatar-icon">
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      <div className="msg-body-card">
        <div className="msg-bubble">
          <div className="msg-text-header">
            <div className="msg-text-content">
              <FormattedContent content={message.content} />
            </div>

            {!isUser && (onSpeakMessage || onStopSpeaking) && (
              <button 
                className={`btn-speak ${isSpeaking ? 'speaking-active' : ''}`}
                onClick={handleSpeakerClick}
                title={isSpeaking ? "Click to stop speaking" : "Speak response out loud"}
              >
                {isSpeaking ? (
                  <VolumeX size={14} style={{ color: 'var(--color-accent-red)' }} />
                ) : (
                  <Volume2 size={14} />
                )}
              </button>
            )}
          </div>
        </div>

        {!isUser && (
          <>
            {/* RAG Expandable Sources */}
            {sources.length > 0 && (
              <div className="rag-sources-expander" style={{ marginTop: '2px' }}>
                <button 
                  className="btn-source-toggle"
                  onClick={() => setShowSources(!showSources)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border-grid)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={11} style={{ color: 'var(--color-text-muted)' }} />
                  <span>Sources ({sources.length})</span>
                  {showSources ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>

                {showSources && (
                  <div className="sources-dropdown">
                    {sources.map((src, idx) => (
                      <div key={idx} className="source-item-card">
                        {src.startsWith('http') ? (
                          <a href={src} target="_blank" rel="noopener noreferrer" className="source-link-chip">
                            <Globe size={11} />
                            <span>{getDomain(src)}</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="source-file-badge">{src}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Tool Call Result Card — Arcus Inspector Slate Themed */}
            {toolUsed && (
              <div className="tool-call-expander" style={{ marginTop: '4px' }}>
                {/* Trigger Pill */}
                <button 
                  className="btn-tool-toggle"
                  onClick={() => setShowTool(!showTool)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '5px',
                    background: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border-grid)',
                    fontSize: '11.5px',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-text-bright)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {toolMeta.icon}
                  <span style={{ fontWeight: 600 }}>{toolMeta.title}</span>
                  <span 
                    style={{ 
                      fontSize: '9.5px', 
                      padding: '1px 5px', 
                      borderRadius: '3px',
                      background: isToolSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: isToolSuccess ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                      border: isToolSuccess ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    {isToolSuccess ? 'SUCCESS' : 'ERR'}
                  </span>
                  {showTool ? <ChevronUp size={11} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={11} style={{ color: 'var(--color-text-muted)' }} />}
                </button>

                {/* Expanded Card */}
                {showTool && toolResult && (
                  <div 
                    className="tool-card-box"
                    style={{
                      marginTop: '6px',
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-grid)',
                      borderRadius: '6px',
                      padding: '12px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                      animation: 'resoToastIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    }}
                  >
                    {/* Header Ribbon */}
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        marginBottom: '8px',
                        borderBottom: '1px solid var(--color-border-grid)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {toolMeta.icon}
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-bright)' }}>
                          {toolMeta.title}
                        </span>
                        <code 
                          style={{ 
                            fontSize: '10px', 
                            color: 'var(--color-text-muted)', 
                            background: 'var(--color-bg-elevated)', 
                            padding: '1px 5px', 
                            borderRadius: '3px',
                            border: '1px solid var(--color-border-grid)',
                          }}
                        >
                          {toolMeta.badge}
                        </code>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyToolResult}
                        className="btn-sidebar-toggle"
                        style={{ padding: '2px 6px', fontSize: '10px', gap: '4px', height: '22px' }}
                        title="Copy tool output"
                      >
                        {copiedPayload ? <Check size={10} style={{ color: 'var(--accent-green)' }} /> : <Copy size={10} />}
                        <span style={{ fontFamily: 'var(--font-sans)' }}>{copiedPayload ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Content */}
                    {toolUsed === 'web_search' && toolResult.results ? (
                      <div className="web-search-cards-list">
                        {toolResult.results.map((res, idx) => (
                          <div key={idx} className="web-result-card">
                            <div className="web-result-header">
                              <span className="web-domain-badge">{getDomain(res.url)}</span>
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className="web-result-link">
                                <ExternalLink size={11} />
                              </a>
                            </div>
                            <h5 className="web-result-title">{res.title}</h5>
                            <p className="web-result-snippet">{res.snippet}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div 
                        style={{
                          background: 'var(--color-bg-subtle)',
                          border: '1px solid var(--color-border-grid)',
                          borderRadius: '5px',
                          padding: '8px 10px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          lineHeight: 1.5,
                          overflowX: 'auto',
                        }}
                      >
                        {typeof toolResult === 'object' ? (
                          Object.entries(toolResult).map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', gap: '8px', margin: '2px 0' }}>
                              <span style={{ color: 'var(--color-text-muted)', userSelect: 'none', flexShrink: 0 }}>
                                {k}:
                              </span>
                              <span 
                                style={{ 
                                  color: k === 'error' ? 'var(--color-accent-red)' : k === 'success' ? (v ? 'var(--color-accent-green)' : 'var(--color-accent-red)') : 'var(--color-text-bright)',
                                  wordBreak: 'break-all',
                                }}
                              >
                                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: 'var(--color-text-primary)' }}>
                            {String(toolResult)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Human Escalation Alert */}
            {isEscalated && (
              <div className="escalation-alert-card">
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Human Support Requested</strong> — This conversation has been marked for manual support handoff.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
