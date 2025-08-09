// components/Comments.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Comment = {
  id: string;
  user_id: string;
  note_id: string;
  content: string;
  created_at: string;
};

export default function Comments({ noteId }: { noteId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: true });
    setComments(data || []);
  }

  useEffect(() => {
    load();
    const chan = supabase
      .channel(`comments:${noteId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `note_id=eq.${noteId}` },
        payload => setComments(prev => [...prev, payload.new as Comment])
      )
      .subscribe();
    return () => { supabase.removeChannel(chan); };
  }, [noteId]);

  async function addComment() {
    if (!text.trim()) return;
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in first.');
      setBusy(false);
      return;
    }
    // ensure profile exists (safety)
    await supabase.from('profiles').upsert({ id: user.id });

    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      note_id: noteId,
      content: text.trim(),
    });
    setBusy(false);
    if (error) { alert(error.message); return; }
    setText('');
  }

  return (
    <div className="mt-6">
      <h3 className="mb-2 font-medium">Comments</h3>

      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="rounded border p-2">
            <div className="text-xs text-gray-500">
              {new Date(c.created_at).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">{c.content}</div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-sm text-gray-500">Be the first to comment.</div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <textarea
          className="flex-1 rounded border p-2"
          rows={2}
          placeholder="Say congrats, ask a question, share a tip…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button
          onClick={addComment}
          disabled={busy}
          className="h-fit rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </div>
  );
}
