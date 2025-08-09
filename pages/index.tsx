import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import NoteComposer from '../components/NoteComposer';
import NoteCard from '../components/NoteCard';
export default function Home() {
  const [notes, setNotes] = useState<any[]>([]);
  async function load() {
    const { data: notes } = await supabase
      .from('notes')
      .select('id,user_id,type,content,tags,created_at, profiles(name,handle,avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);
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
