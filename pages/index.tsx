// pages/index.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import NoteComposer from '../components/NoteComposer';
import NoteCard from '../components/NoteCard';

type Note = {
  id: string;
  user_id: string;
  type: string;
  content: string;
  tags?: string[];
  created_at: string;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('notes load error:', error);
      setErr(error.message || 'Failed to load notes');
      setNotes([]);
    } else {
      setNotes((data as Note[]) || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();

    const channel = supabase
      .channel('notes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notes' },
        async (payload) => {
          const id = (payload.new as any).id;
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          if (!error && data) {
            setNotes((prev) => (prev.find((x) => x.id === id) ? prev : [data as Note, ...prev]));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <NoteComposer onPosted={load} />

      {err && <div className="mt-4 text-sm text-red-600">Error: {err}</div>}
      {loading ? (
        <div className="mt-6 text-sm text-gray-600">Loading…</div>
      ) : notes.length === 0 ? (
        <div className="mt-6 text-sm text-gray-600">No notes yet.</div>
      ) : (
        <div className="mt-6">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      )}
    </div>
  );
}
