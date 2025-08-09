// pages/profile/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import NoteCard from '../../components/NoteCard';
import FollowButton from '../../components/FollowButton';

export default function Profile() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const [profile, setProfile] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      setProfile(p);
      const { data: ns } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      setNotes(ns || []);
    })();
  }, [id]);

  if (!id) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="mb-4 bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">{profile?.name || 'User'}</div>
            <div className="text-sm text-gray-600">@{profile?.handle || id.slice(0, 8)}</div>
            {profile?.bio && <p className="mt-2">{profile.bio}</p>}
          </div>
          <FollowButton userId={id} />
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-sm text-gray-600">No threads yet.</div>
      ) : (
        notes.map((n) => <NoteCard key={n.id} note={n} />)
      )}
    </div>
  );
}
