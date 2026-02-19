import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true
});

export async function fetchSession() {
  const { data } = await api.get('/auth/session');
  return data;
}

export async function verifyEmail(token) {
  const { data } = await api.post('/auth/verify-email', { token });
  return data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getGoogleAuthUrl() {
  const { data } = await api.get('/auth/google/url');
  return data.url;
}

export async function sendChat({ message, files, model, guestMode, outputAudio, stream, onDelta }) {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('model', model);
  formData.append('guestMode', guestMode);
  formData.append('outputAudio', outputAudio);
  for (const file of files) formData.append('files', file);

  if (stream) {
    const response = await fetch('http://localhost:8080/api/chat?stream=1', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!response.ok || !response.body) {
      const text = await response.text();
      throw new Error(text || 'Streaming failed.');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const chunk = await reader.read();
      done = chunk.done;
      if (chunk.value) {
        const text = decoder.decode(chunk.value, { stream: true });
        for (const line of text.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const payload = line.replace(/^data:\s*/, '');
          if (payload === '[DONE]') return;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.delta) onDelta(parsed.delta);
          } catch {
            // ignore malformed chunk
          }
        }
      }
    }
    return;
  }

  const { data } = await api.post('/chat', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}
