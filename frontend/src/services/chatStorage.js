// 60 days in milliseconds = 60 * 24 * 60 * 60 * 1000
const RETENTION_MS = 60 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'reso_ai_chat_sessions_v1';

/**
 * Load all valid sessions within the 60-day retention window
 */
export function getSavedSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    if (!Array.isArray(sessions)) return [];

    const now = Date.now();
    // Filter out sessions older than 60 days
    const validSessions = sessions.filter(
      (s) => s.updatedAt && now - s.updatedAt <= RETENTION_MS
    );

    // If some expired sessions were removed, update localStorage
    if (validSessions.length !== sessions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions));
    }

    return validSessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error('Failed to read saved chat sessions:', err);
    return [];
  }
}

/**
 * Save or update a single session
 */
export function saveSession(session) {
  try {
    const sessions = getSavedSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    const now = Date.now();
    const updatedSession = {
      ...session,
      updatedAt: now,
      createdAt: session.createdAt || now,
    };

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...sessions];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...updatedSession };
    } else {
      updatedList = [updatedSession, ...sessions];
    }

    // Keep only within 60 days
    const valid = updatedList.filter((s) => now - s.updatedAt <= RETENTION_MS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return valid;
  } catch (err) {
    console.error('Failed to save chat session:', err);
    return [];
  }
}

/**
 * Rename a session
 */
export function renameSession(sessionId, newTitle) {
  try {
    const sessions = getSavedSessions();
    const existingIndex = sessions.findIndex((s) => s.id === sessionId);
    if (existingIndex >= 0) {
      sessions[existingIndex].title = newTitle.trim();
      sessions[existingIndex].updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
    return sessions;
  } catch (err) {
    console.error('Failed to rename chat session:', err);
    return [];
  }
}

/**
 * Delete a session by ID
 */
export function deleteSession(sessionId) {
  try {
    const sessions = getSavedSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete chat session:', err);
    return [];
  }
}
