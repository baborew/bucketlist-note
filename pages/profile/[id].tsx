import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import NoteCard from '../../components/NoteCard';
export default function Profile() {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const [profile, setProfile] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(() => { if (id) { load(); } }, [id]);
  async function load() {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', id!).maybeSingle();
    setProfile(p);
    const { data: ns } = await supabase.from('notes').select('*').eq('user_id', id!).order('created_at', { ascending: false });
    setNotes(ns || []);
  }
  if (!id) return null;
  return (
    <div className="p-4">
      <div className="mb-4 bg-white rounded-xl shadow p-4">
        <div className="text-xl font-semibold">{profile?.name || 'Anon user'}</div>
        <div className="text-sm text-gray-600">@{profile?.handle || id?.slice(0,8)}</div>
        {profile?.bio && <p className="mt-2">{profile.bio}</p>}
      </div>
      {notes.map(n => <NoteCard key={n.id} note={n} />)}
    </div>
  );
}
