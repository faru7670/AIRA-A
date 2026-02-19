import { useEffect, useMemo, useState } from 'react';
import { AuthPanel } from '../components/AuthPanel.jsx';
import { ChatInput } from '../components/ChatInput.jsx';
import { MessageList } from '../components/MessageList.jsx';
import { fetchSession, getGoogleAuthUrl, logout, sendChat } from '../services/api.js';

export function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(true);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    fetchSession()
      .then((session) => {
        setUser(session.user);
        setGuestMode(!session.user?.verified);
        if (session.history?.length) {
          setMessages(
            session.history
              .map((item, idx) => [
                { id: `h-u-${idx}`, role: 'user', content: item.message },
                { id: `h-a-${idx}`, role: 'assistant', content: item.response }
              ])
              .flat()
              .reverse()
          );
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  const summaryText = useMemo(
    () => messages.filter((m) => m.role === 'assistant').map((m) => m.content).join('\n\n'),
    [messages]
  );

  async function handleSend(payload) {
    setLoading(true);
    setError('');
    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: userId, role: 'user', content: payload.message }, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      await sendChat({
        ...payload,
        guestMode,
        stream: true,
        onDelta: (delta) => {
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: `${m.content}${delta}` } : m)));
        }
      });

      if (payload.outputAudio) {
        const data = await sendChat({ ...payload, guestMode, stream: false, outputAudio: true });
        if (data.audioBase64) {
          const url = `data:audio/wav;base64,${data.audioBase64}`;
          setAudioUrl(url);
        }
      }
    } catch (e) {
      setError(e.message);
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: `Error: ${e.message}` } : m)));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setGuestMode(true);
  }

  function downloadSummary() {
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `aira-summary-${Date.now()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <AuthPanel
        user={user}
        onGoogleLogin={handleGoogleLogin}
        onGuest={() => setGuestMode(true)}
        onLogout={handleLogout}
      />
      {error && <p className="mb-3 rounded-lg bg-red-500/20 p-3 text-sm text-red-200">{error}</p>}
      <MessageList messages={messages} />
      {audioUrl && <audio controls src={audioUrl} className="mb-3 w-full" />}
      <div className="mb-3 flex justify-end">
        <button onClick={downloadSummary} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm">Download summary</button>
      </div>
      <ChatInput onSend={handleSend} loading={loading} />
    </main>
  );
}
