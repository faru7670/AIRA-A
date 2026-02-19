import { Mic, Paperclip, Send, Volume2 } from 'lucide-react';
import { useRef } from 'react';

export function ChatInput({ onSend, loading }) {
  const fileRef = useRef(null);

  return (
    <form
      className="glass rounded-2xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        onSend({
          message: form.get('message')?.toString() ?? '',
          model: form.get('model')?.toString() ?? '',
          outputAudio: form.get('outputAudio') === 'on',
          files: Array.from(fileRef.current?.files ?? [])
        });
        e.currentTarget.reset();
        if (fileRef.current) fileRef.current.value = '';
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <select name="model" defaultValue="meta-llama/llama-3.1-8b-instruct:free" className="rounded-lg bg-slate-800 p-2 text-sm">
          <option value="meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B (free)</option>
          <option value="google/gemma-2-9b-it:free">Gemma 2 9B (free)</option>
          <option value="qwen/qwen-2.5-72b-instruct:free">Qwen 2.5 72B (free)</option>
        </select>
        <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-sm">
          <Paperclip size={16} />
          Attach
          <input ref={fileRef} type="file" multiple accept="image/*,audio/*,application/pdf" className="hidden" />
        </label>
        <label className="flex items-center gap-1 text-sm">
          <Volume2 size={16} />
          <input type="checkbox" name="outputAudio" /> Audio reply
        </label>
      </div>
      <div className="flex items-end gap-2">
        <textarea
          name="message"
          placeholder="Ask AIRA-AI anything..."
          className="h-24 flex-1 resize-none rounded-xl bg-slate-800 p-3"
          required
        />
        <button type="submit" disabled={loading} className="rounded-xl bg-indigo-500 p-3 hover:bg-indigo-400 disabled:opacity-50">
          {loading ? <Mic className="animate-pulse" /> : <Send />}
        </button>
      </div>
    </form>
  );
}
