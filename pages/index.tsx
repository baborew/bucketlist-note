// pages/index.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import NoteComposer from '../components/NoteComposer';
import NoteCard from '../components/NoteCard';

type Profile = { name?: string; handle?: string; avatar_url?: string };
type Note = {
  id: string;
  user_id: string;
  type: string;
  content: string;
  tags?: string[];
  created_at: string;
  profiles?: Profile;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select(
        'id,user_id,type,content,tags,created_at, profiles(name,handle,avatar_url)'
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      setNotes([]);
    } else {
      setNotes((data as Note[]) || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();

    // realtime: prepend newly inserted public/allowed notes
    const channel = supabase
      .channel('notes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notes' },
        async (payload) => {
          // fetch the new row again with its joined profile
          const { data: n } = await supabase
            .from('notes')
            .select(
              'id,user_id,type,content,tags,created_at, profiles(name,handle,avatar_url)'
            )
            .eq('id', (payload.new as any).id)
            .maybeSingle();

          if (!n) return; // not visible due to RLS
          setNotes((prev) => {
            // avoid duplicates if load() also ran
            if (prev.find((x) => x.id === n.id)) return prev;
            return [n as Note, ...prev];
          });
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
