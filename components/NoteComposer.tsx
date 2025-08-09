// components/NoteComposer.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function NoteComposer({ onPosted }: { onPosted?: () => void }) {
  const [type, setType] = useState<'Did'|'Doing'|'Want'>('Did');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function post() {
    setErr(null);
    if (!content.trim()) return;

    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setErr('Please sign in first.'); setBusy(false); return; }

      // parse tags like: travel, spanish, 5k
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          type,
          content: content.trim(),
          tags,
          privacy: 'public',   // make it visible
        });

      if (error) throw error;

      setContent('');
      setTagsInput('');
      setType('Did');
      onPosted?.();
    } catch (e: any) {
      console.error(e);
      setErr(e.message || 'Failed to post');
      alert(e.message || 'Failed to post'); // so you see it immediately
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <div className="flex gap-2 mb-2">
        <select
          value={type}
          onChange={e => setType(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option>Did</option>
          <option>Doing</option>
          <option>Want</option>
        </select>

        <input
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="tags: travel, spanish, 5k"
          className="flex-1 border rounded px-2 py-1"
        />
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Share something you did, are doing, or want to do..."
        className="w-full border rounded px-3 py-2"
        rows={3}
      />

      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={post}
          disabled={busy}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          {busy ? 'Posting…' : 'Post'}
        </button>
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </div>
  );
}
