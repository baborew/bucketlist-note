// components/FollowButton.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function FollowButton({ userId }: { userId: string }) {
  const [me, setMe] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user?.id ?? null);
      if (!user) return;
      const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('followed_id', userId)
        .maybeSingle();
      setFollowing(!!data);
    })();
  }, [userId]);

  if (!me || me === userId) return null; // hide if not signed in or it’s me

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (following) {
        await supabase.from('follows').delete()
          .eq('follower_id', me).eq('followed_id', userId);
        setFollowing(false);
      } else {
        await supabase.from('follows').insert({ follower_id: me, followed_id: userId });
        setFollowing(true);
      }
    } catch (e: any) {
      alert(e.message || 'Follow failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`px-3 py-1 border rounded text-sm ${following ? 'bg-gray-100' : ''}`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
