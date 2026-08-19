import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  PanelLeftClose, 
  Settings, 
  Trash2, 
  MoreVertical, 
  Edit2, 
  Check, 
  X 
} from 'lucide-react';

function groupSessionsByDate(sessions) {
  const groups = {
    today: [],
    yesterday: [],
    previous7Days: [],
    older: [],
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

  sessions.forEach((s) => {
    const time = s.updatedAt || s.createdAt || Date.now();
    if (time >= startOfToday) {
      groups.today.push(s);
    } else if (time >= startOfYesterday) {
      groups.yesterday.push(s);
    } else if (time >= startOf7Days) {
      groups.previous7Days.push(s);
    } else {
      groups.older.push(s);
    }
  });

  return groups;
}

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  sessionId,
  sessions = [],
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onOpenSettings
}) {
  const groups = groupSessionsByDate(sessions);
  const [activeMenuSessionId, setActiveMenuSessionId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Close 3-dot menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.session-menu-wrapper')) {
        setActiveMenuSessionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartRename = (session, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuSessionId(null);
    setEditingSessionId(session.id);
    setEditTitle(session.title || `Session ${session.id.slice(-6)}`);
  };

  const handleSaveRename = (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setEditingSessionId(null);
  };

  const handleDelete = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuSessionId(null);
    if (onDeleteSession) {
      onDeleteSession(id);
    }
  };

  const renderSessionItem = (session) => {
    const isActive = session.id === sessionId;
    const isMenuOpen = activeMenuSessionId === session.id;
    const isEditing = editingSessionId === session.id;

    if (isEditing) {
      return (
        <div
          key={session.id}
          className="history-item active"
          style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(session.id, e);
              if (e.key === 'Escape') handleCancelRename(e);
            }}
            autoFocus
            style={{
              flex: 1,
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border-hover)',
              borderRadius: '4px',
              padding: '4px 6px',
              fontSize: '12px',
              color: 'var(--color-text-bright)',
              outline: 'none',
              minWidth: 0,
            }}
          />
          <button
            type="button"
            onClick={(e) => handleSaveRename(session.id, e)}
            className="btn-sidebar-toggle"
            style={{ padding: '2px 4px' }}
            title="Save"
          >
            <Check size={13} style={{ color: 'var(--accent-green)' }} />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            className="btn-sidebar-toggle"
            style={{ padding: '2px 4px' }}
            title="Cancel"
          >
            <X size={13} />
          </button>
        </div>
      );
    }

    return (
      <div 
        key={session.id} 
        className={`history-item ${isActive ? 'active' : ''}`}
        onClick={() => onSelectSession && onSelectSession(session.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: isMenuOpen ? 50 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, paddingRight: '4px' }}>
          <MessageSquare size={13} style={{ flexShrink: 0 }} />
          <span 
            style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              flex: 1,
              fontSize: '12.5px',
            }}
          >
            {session.title || `Session ${session.id.slice(-6)}`}
          </span>
        </div>

        {/* 3-Dot Vertical Menu Trigger */}
        <div className="session-menu-wrapper" style={{ position: 'relative', flexShrink: 0 }}>
          <button
            type="button"
            className="btn-session-options"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveMenuSessionId(isMenuOpen ? null : session.id);
            }}
            title="Conversation options"
            style={{
              background: isMenuOpen ? 'var(--color-bg-elevated)' : 'transparent',
              border: 'none',
              color: isMenuOpen || isActive ? 'var(--color-text-bright)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '3px 4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isMenuOpen || isActive ? 1 : 0.6,
              transition: 'all 0.15s ease',
            }}
          >
            <MoreVertical size={13} />
          </button>

          {/* 3-Dot Dropdown Menu */}
          {isMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 4px)',
                width: '135px',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-grid)',
                borderRadius: '6px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                padding: '4px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                animation: 'resoToastIn 0.15s ease-out forwards',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => handleStartRename(session, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Edit2 size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span>Rename</span>
              </button>

              <div style={{ height: '1px', background: 'var(--color-border-grid)', margin: '2px 0' }} />

              <button
                type="button"
                onClick={(e) => handleDelete(session.id, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent-red)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const displaySessions = sessions.length > 0 ? sessions : [{ id: sessionId, title: `Current Session (${sessionId.slice(-6)})`, createdAt: Date.now() }];
  const displayGroups = groupSessionsByDate(displaySessions);

  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <div className="brand-icon-box">
            <span>R</span>
          </div>
          <span>Reso AI</span>
        </div>
        <button 
          className="btn-sidebar-toggle"
          onClick={onToggle}
          title="Close Sidebar"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      <div className="new-chat-section">
        <button className="btn-new-chat" onClick={onNewChat}>
          <Plus size={14} />
          <span>New Conversation</span>
        </button>
      </div>

      <div className="conversations-history">
        {displayGroups.today.length > 0 && (
          <div>
            <div className="history-group-title">Today</div>
            {displayGroups.today.map(renderSessionItem)}
          </div>
        )}

        {displayGroups.yesterday.length > 0 && (
          <div>
            <div className="history-group-title">Yesterday</div>
            {displayGroups.yesterday.map(renderSessionItem)}
          </div>
        )}

        {displayGroups.previous7Days.length > 0 && (
          <div>
            <div className="history-group-title">Previous 7 Days</div>
            {displayGroups.previous7Days.map(renderSessionItem)}
          </div>
        )}

        {displayGroups.older.length > 0 && (
          <div>
            <div className="history-group-title">Previous 60 Days</div>
            {displayGroups.older.map(renderSessionItem)}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          onClick={onOpenSettings}
          className="user-profile"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-bright)';
            e.currentTarget.style.background = 'var(--color-bg-elevated)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div className="user-avatar-small">
            <Settings size={12} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500 }}>Settings & Support</span>
        </button>

        <span 
          style={{ 
            fontSize: '10.5px', 
            fontFamily: 'var(--font-sans)', 
            color: 'var(--color-text-muted)' 
          }}
          title="Chat sessions are stored locally for up to 60 days"
        >
          60d saved
        </span>
      </div>
    </aside>
  );
}
