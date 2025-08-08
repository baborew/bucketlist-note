import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import NoteComposer from '../components/NoteComposer';
import NoteCard from '../components/NoteCard';
export default function Home() {
  const [notes, setNotes] = useState<any[]>([]);
  async function load() {
    const { data, error } = await supabase
      .from('notes').select('*').eq('privacy', 'public')
      .order('created_at', { ascending: false }).limit(50);
    if (!error) setNotes(data || []);
  }
  useEffect(() => {
    load();
    const channel = supabase
      .channel('notes-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, (payload) => {
        const n = payload.new as any;
        if (n.privacy === 'public') setNotes(prev => [n, ...prev]);
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);
  return (
    <div className="p-4">
      <NoteComposer onPosted={load} />
      <div className="mt-6">{notes.map(n => <NoteCard key={n.id} note={n} />)}</div>
    </div>
  );
}
