// pages/n/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import NoteCard from '../../components/NoteCard';

type Note = {
  id: string;
  user_id: string;
  type: string;
  content: string;
  tags?: string[];
  created_at: string;
};

export default function NoteThread() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('thread load error:', error);
        setErr(error.message || 'Failed to load');
        setNote(null);
      } else {
        setNote((data as Note) || null);
      }
      setLoading(false);
    })();
  }, [id]);

  if (!id) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <button onClick={() => router.push('/')} className="text-sm text-blue-700 mb-3">
        ← Back to feed
      </button>

      {err && <div className="text-sm text-red-600 mb-3">Error: {err}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : !note ? (
        <div>Note not found.</div>
      ) : (
        // hide the “View threads →” link on this page
        <NoteCard note={note} showThreadLink={false} />
      )}
    </div>
  );
}
