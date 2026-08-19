import React, { useState } from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  Mail, 
  Github, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink, 
  Settings, 
  User 
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('support'); // 'appearance' | 'support' | 'tnc'
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const supportEmail = 'anirudhchourey5@gmail.com';
  const githubUsername = '0xAnirudh';
  const githubLink = 'https://github.com/0xAnirudh';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          height: '490px', // Static fixed height across all tabs
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-grid)',
          borderRadius: '8px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'resoToastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Settings Icon */}
        <div
          style={{
            height: '52px',
            padding: '0 20px',
            borderBottom: '1px solid var(--color-border-grid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={15} style={{ color: 'var(--color-brand-primary)' }} />
            <span style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)', letterSpacing: '-0.01em' }}>
              Settings & Support
            </span>
          </div>
          <button
            type="button"
            className="btn-sidebar-toggle"
            onClick={onClose}
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border-grid)',
            backgroundColor: 'var(--color-bg-subtle)',
            padding: '0 16px',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          {/* Customer Support Tab with Profile/User Icon */}
          <button
            type="button"
            onClick={() => setActiveTab('support')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'support' ? 'var(--color-text-bright)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'support' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <User size={13} />
            <span>Customer Support</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'appearance' ? 'var(--color-text-bright)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'appearance' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Sun size={13} />
            <span>Appearance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tnc')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'tnc' ? 'var(--color-text-bright)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'tnc' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={13} />
            <span>Terms & Conditions</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable with fixed parent boundaries) */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}>
          {/* TAB 1: CUSTOMER SUPPORT */}
          {activeTab === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)', marginBottom: '4px' }}>
                  Get in Touch
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Need assistance with your customer support queries, integrations, or custom enterprise workflows? Contact us directly:
                </p>
              </div>

              {/* Email Contact Card */}
              <div
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-grid)',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--color-accent-blue)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Direct Support Email
                    </div>
                    <a
                      href={`mailto:${supportEmail}`}
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--color-text-bright)',
                        textDecoration: 'none',
                      }}
                    >
                      {supportEmail}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="btn-header"
                    style={{ height: '30px', fontSize: '11px' }}
                    title="Copy Email Address"
                  >
                    {copiedEmail ? <Check size={12} style={{ color: 'var(--accent-green)' }} /> : <Copy size={12} />}
                    <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                  </button>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="btn-header"
                    style={{ height: '30px', fontSize: '11px', textDecoration: 'none' }}
                  >
                    <span>Send Mail</span>
                  </a>
                </div>
              </div>

              {/* GitHub Link Card */}
              <div
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-grid)',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      background: 'rgba(161, 161, 170, 0.1)',
                      color: 'var(--color-text-bright)',
                      border: '1px solid var(--color-border-grid)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Github size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Developer GitHub
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-bright)' }}>
                      {githubUsername}
                    </div>
                  </div>
                </div>

                <a
                  href={githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-header"
                  style={{ height: '30px', fontSize: '11px', textDecoration: 'none' }}
                >
                  <span>Visit Profile</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)', marginBottom: '4px' }}>
                  Interface Theme
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Choose your preferred color theme for Reso AI.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Dark Theme Option */}
                <div
                  onClick={() => setTheme('dark')}
                  style={{
                    border: theme === 'dark' ? '2px solid var(--color-brand-primary)' : '1px solid var(--color-border-grid)',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#09090b',
                    color: '#fafafa',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Moon size={16} style={{ color: '#a1a1aa' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Dark Minimal Slate</span>
                    </div>
                    {theme === 'dark' && <Check size={14} style={{ color: '#10b981' }} />}
                  </div>

                  {/* Visual mini mockup */}
                  <div
                    style={{
                      height: '50px',
                      background: '#121215',
                      border: '1px solid #27272a',
                      borderRadius: '5px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ width: '40%', height: '6px', background: '#27272a', borderRadius: '3px' }} />
                    <div style={{ width: '70%', height: '6px', background: '#1a1a1e', borderRadius: '3px' }} />
                  </div>
                </div>

                {/* Light Theme Option */}
                <div
                  onClick={() => setTheme('light')}
                  style={{
                    border: theme === 'light' ? '2px solid var(--color-brand-primary)' : '1px solid var(--color-border-grid)',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sun size={16} style={{ color: '#f59e0b' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Light Minimal Slate</span>
                    </div>
                    {theme === 'light' && <Check size={14} style={{ color: '#10b981' }} />}
                  </div>

                  {/* Visual mini mockup */}
                  <div
                    style={{
                      height: '50px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ width: '40%', height: '6px', background: '#e2e8f0', borderRadius: '3px' }} />
                    <div style={{ width: '70%', height: '6px', background: '#cbd5e1', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS & CONDITIONS */}
          {activeTab === 'tnc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)', marginBottom: '4px' }}>
                  Terms of Service & Usage Policy
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
                  Effective Date: August 2026 · Version 2.0
                </p>
              </div>

              <div style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-grid)', borderRadius: '6px', padding: '12px 14px' }}>
                <h5 style={{ color: 'var(--color-text-bright)', fontWeight: 600, marginBottom: '4px' }}>
                  1. Autonomous AI Agent Operations
                </h5>
                <p>
                  Reso AI operates as an autonomous customer service pipeline utilizing Retrieval-Augmented Generation (RAG) and direct API tool execution (Live Web Search, Email Dispatch, Phone Dispatch, Python Evaluation). Responses are strictly grounded against knowledge base vectors.
                </p>
              </div>

              <div style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-grid)', borderRadius: '6px', padding: '12px 14px' }}>
                <h5 style={{ color: 'var(--color-text-bright)', fontWeight: 600, marginBottom: '4px' }}>
                  2. 60-Day Data Retention Policy
                </h5>
                <p>
                  Conversation history, intent classifications, and metadata are persisted securely in your local client workspace for a duration of exactly <strong>60 days</strong>. Expired sessions are purged automatically. Users retain the right to manually delete any session anytime.
                </p>
              </div>

              <div style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-grid)', borderRadius: '6px', padding: '12px 14px' }}>
                <h5 style={{ color: 'var(--color-text-bright)', fontWeight: 600, marginBottom: '4px' }}>
                  3. Human Escalation Protocol
                </h5>
                <p>
                  When user requests or complex inquiries exceed confidence thresholds or upon manual user request, conversations are transferred directly to human support representatives with preserved context.
                </p>
              </div>

              <div style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-grid)', borderRadius: '6px', padding: '12px 14px' }}>
                <h5 style={{ color: 'var(--color-text-bright)', fontWeight: 600, marginBottom: '4px' }}>
                  4. Privacy & Ownership
                </h5>
                <p>
                  No confidential payloads or user conversation transcripts are shared with unauthorized third-party models or used for foundation model training without explicit consent.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            height: '50px',
            padding: '0 20px',
            borderTop: '1px solid var(--color-border-grid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--color-bg-subtle)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="btn-primary"
            style={{ height: '32px', padding: '0 16px', fontSize: '12px' }}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
