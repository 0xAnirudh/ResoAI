import axios from 'axios';

const getApiBase = () => {
  let url = (import.meta.env.VITE_API_URL || '/api').trim();
  url = url.replace(/\/+$/, ''); // Remove trailing slash
  return url;
};

const API_BASE = getApiBase();
const getEndpoint = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE.endsWith('/api')) {
    return `${API_BASE}${cleanPath}`;
  }
  if (API_BASE === '' || API_BASE === '/') {
    return `/api${cleanPath}`;
  }
  return `${API_BASE}/api${cleanPath}`;
};

export const sendChatMessage = async (sessionId, userId, message) => {
  const response = await axios.post(getEndpoint('/chat'), {
    session_id: sessionId,
    user_id: userId,
    message: message
  });
  return response.data;
};

export const fetchChatHistory = async (sessionId) => {
  const response = await axios.get(getEndpoint(`/chat/history/${sessionId}`));
  return response.data;
};

export const escalateSession = async (sessionId, userId, reason) => {
  const response = await axios.post(getEndpoint('/escalate'), {
    session_id: sessionId,
    user_id: userId,
    reason: reason
  });
  return response.data;
};

export const checkHealth = async () => {
  const response = await axios.get(getEndpoint('/health'));
  return response.data;
};

