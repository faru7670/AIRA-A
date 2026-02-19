export function MessageList({ messages }) {
  return (
    <div className="glass mb-4 h-[60vh] overflow-y-auto rounded-2xl p-4">
      {messages.length === 0 && <p className="text-slate-400">Start a conversation with AIRA-AI.</p>}
      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`rounded-xl p-3 ${msg.role === 'user' ? 'bg-indigo-500/20' : 'bg-slate-800/90'}`}>
            <p className="mb-1 text-xs uppercase text-slate-400">{msg.role}</p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
