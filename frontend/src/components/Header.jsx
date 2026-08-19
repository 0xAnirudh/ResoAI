import React, { useState, useRef, useEffect } from 'react';
import { 
  PanelLeft, 
  Globe, 
  ChevronDown, 
  Check, 
  Volume2, 
  VolumeX, 
  Activity, 
  Layers, 
  AlertTriangle, 
  UserCheck 
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../hooks/useVoice';

export default function Header({ 
  sidebarOpen,
  onToggleSidebar,
  inspectorOpen,
  onToggleInspector,
  isEscalated,
  onEscalate,
  lang,
  onLangChange,
  autoSpeak,
  onToggleAutoSpeak,
  isWidgetMode,
  onToggleWidgetMode
}) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        {!sidebarOpen && (
          <button 
            className="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            title="Open Sidebar"
          >
            <PanelLeft size={15} />
          </button>
        )}
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Compact Language Selector: Globe Icon + Short Code (En, Hi, Fr...) */}
        <div className="relative" ref={langMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn-header"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            title={`Select Language (${currentLangObj.name})`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 10px',
              height: '32px'
            }}
          >
            <Globe size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
              {currentLangObj.short || currentLangObj.code.slice(0, 2).toUpperCase()}
            </span>
            <ChevronDown size={11} style={{ color: 'var(--color-text-muted)', marginLeft: '-2px' }} />
          </button>

          {isLangMenuOpen && (
            <div 
              className="lang-dropdown-menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 4px)',
                width: '175px',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-grid)',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                padding: '4px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                animation: 'resoToastIn 0.15s ease-out forwards',
              }}
            >
              <div 
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '10.5px', 
                  fontFamily: 'var(--font-sans)', 
                  textTransform: 'uppercase', 
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.04em'
                }}
              >
                Select Language
              </div>
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onLangChange(item.code);
                      setIsLangMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      background: isSelected ? 'var(--color-bg-elevated)' : 'transparent',
                      border: 'none',
                      color: isSelected ? 'var(--color-text-bright)' : 'var(--color-text-secondary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isSelected ? (
                        <Check size={12} style={{ color: 'var(--accent-green)' }} />
                      ) : (
                        <span style={{ width: '12px' }} />
                      )}
                      <span>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', lineHeight: 1 }}>{item.flag}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Written Only / Voice ON Toggle */}
        <button
          className={`btn-header ${autoSpeak ? 'active' : ''}`}
          onClick={onToggleAutoSpeak}
          title={autoSpeak ? "Agent Voice Output: ON (Speaking)" : "Agent Voice Output: OFF (Written Mode Only)"}
        >
          {autoSpeak ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span>{autoSpeak ? 'Voice ON' : 'Written Only'}</span>
        </button>

        {/* Widget Mode Toggle (Always named "Widget Demo") */}
        <button
          className={`btn-header ${isWidgetMode ? 'active' : ''}`}
          onClick={onToggleWidgetMode}
          title="Toggle Embeddable Widget Demo"
        >
          <Layers size={13} />
          <span>Widget Demo</span>
        </button>

        {/* Request Human Button */}
        <button 
          className={`btn-header ${isEscalated ? 'escalate' : ''}`}
          onClick={onEscalate}
          disabled={isEscalated}
          title={isEscalated ? "Conversation marked for human agent" : "Request Human Support Agent"}
        >
          {isEscalated ? (
            <>
              <UserCheck size={13} style={{ color: 'var(--color-accent-red)' }} />
              <span>Escalated</span>
            </>
          ) : (
            <>
              <AlertTriangle size={13} style={{ color: 'var(--color-accent-amber)' }} />
              <span>Request Human</span>
            </>
          )}
        </button>

        {/* Inspector Panel Toggle (Icon-only, shifted to full right) */}
        <button
          className={`btn-header ${inspectorOpen ? 'active' : ''}`}
          onClick={onToggleInspector}
          title="Agent Activity Inspector"
          style={{ padding: '6px 9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Activity size={14} />
        </button>
      </div>
    </header>
  );
}
