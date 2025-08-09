// components/FollowButton.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function FollowButton({ userId }: { userId: string }) {
  const [me, setMe] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  // Check if I'm following this user
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

  // Don't show button if I'm not signed in or it's my own profile
  if (!me || me === userId) return null;

  async function toggleFollow() {
    if (busy) return;
    setBusy(true);
    try {
      if (following) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', me)
          .eq('followed_id', userId);
        setFollowing(false);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: me, followed_id: userId });
        setFollowing(true);
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={busy}
      className={`px-3 py-1 border rounded text-sm ${following ? 'bg-gray-100' : ''}`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
