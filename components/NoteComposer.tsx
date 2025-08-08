import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
export default function NoteComposer({ onPosted }: { onPosted?: () => void }) {
  const [type, setType] = useState<'Did'|'Doing'|'Want'>('Did');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [busy, setBusy] = useState(false);
  async function postNote() {
    if (!content.trim()) return; setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Sign in first'); setBusy(false); return; }
    const { error } = await supabase.from('notes').insert({
      user_id: user.id, type, content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean), privacy: 'public'
    });
    setBusy(false); if (error) { alert(error.message); return; }
    setContent(''); setTags(''); onPosted?.();
  }
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <div className="flex gap-2 mb-2">
        <select value={type} onChange={e => setType(e.target.value as any)} className="border rounded px-2 py-1">
          <option>Did</option><option>Doing</option><option>Want</option>
        </select>
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tags: travel, spanish, 5k" className="flex-1 border rounded px-2 py-1" />
      </div>
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share something you did, are doing, or want to do…" className="w-full p-2 border rounded min-h-[90px]" />
      <div className="mt-2 flex justify-end">
        <button onClick={postNote} disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{busy ? 'Posting…' : 'Post'}</button>
      </div>
    </div>
  );
}
