// pages/n/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import NoteCard from '../../components/NoteCard';

export default function NoteThread() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const [note, setNote] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      // Load the note
      const { data: n } = await supabase
        .from('notes')
        .select('id,user_id,type,content,tags,created_at, profiles(name,handle,avatar_url)')
        .eq('id', id)
        .maybeSingle();
      setNote(n || null);

      // Load comments
      const { data: c } = await supabase
        .from('comments')
        .select('*, profiles(name, handle)')
        .eq('note_id', id)
        .order('created_at', { ascending: true });
      setComments(c || []);
    })();
  }, [id]);

  async function postComment() {
    if (!newComment.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Please sign in to comment.');

    const { error } = await supabase.from('comments').insert({
      note_id: id,
      user_id: user.id,
      content: newComment.trim(),
    });
    if (error) return alert(error.message);

    setNewComment('');
    // reload comments
    const { data: c } = await supabase
      .from('comments')
      .select('*, profiles(name, handle)')
      .eq('note_id', id)
      .order('created_at', { ascending: true });
    setComments(c || []);
  }

  if (!id) return <div className="p-4">Loading…</div>;
  if (!note) return <div className="p-4">Note not found.</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <button onClick={() => router.push('/')} className="text-sm text-blue-700 mb-3">
        ← Back to feed
      </button>

      {/* The main note */}
      <NoteCard note={note} showThreadLink={false} />

      {/* Comments section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Comments</h2>
        {comments.length === 0 && <p className="text-sm text-gray-600">No comments yet.</p>}
        {comments.map((c) => (
          <div key={c.id} className="border-b py-2">
            <p className="text-sm font-semibold">
              {c.profiles?.name || 'User'} @{c.profiles?.handle || ''}
            </p>
            <p>{c.content}</p>
          </div>
        ))}

        {/* Add comment */}
        <div className="mt-3 flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={postComment}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
