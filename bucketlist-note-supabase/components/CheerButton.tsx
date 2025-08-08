import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
export default function CheerButton({ noteId }: { noteId: string }) {
  const [cheered, setCheered] = useState(false);
  const [count, setCount] = useState(0);
  useEffect(() => {
    refresh();
    const channel = supabase
      .channel('cheers-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cheers', filter: `note_id=eq.${noteId}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [noteId]);
  async function refresh() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: all } = await supabase.from('cheers').select('*').eq('note_id', noteId);
    setCount(all?.length || 0);
    if (user) {
      const { data: mine } = await supabase.from('cheers').select('*').eq('note_id', noteId).eq('user_id', user.id).maybeSingle();
      setCheered(!!mine);
    }
  }
  async function toggle() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Sign in first');
    if (cheered) { await supabase.from('cheers').delete().eq('note_id', noteId).eq('user_id', user.id); }
    else { await supabase.from('cheers').insert({ note_id: noteId, user_id: user.id }); }
    refresh();
  }
  return (<button onClick={toggle} className={`px-3 py-1 rounded border ${cheered ? 'bg-yellow-100' : ''}`}>👏 {count}</button>);
}
