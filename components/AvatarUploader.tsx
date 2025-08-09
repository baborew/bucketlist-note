// components/AvatarUploader.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AvatarUploader() {
  const [me, setMe] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMe(user.id);
      const { data: p } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle();
      setUrl(p?.avatar_url ?? null);
    })();
  }, []);

  if (!me) return null; // not signed in

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      // unique path: userId/timestamp.ext
      const ext = file.name.split('.').pop();
      const path = `${me}/${Date.now()}.${ext || 'jpg'}`;

      // upload
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (upErr) throw upErr;

      // get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      // save to profile
      const { error: profErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', me);
      if (profErr) throw profErr;

      setUrl(publicUrl);
      alert('Profile photo updated!');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
      e.target.value = ''; // reset
    }
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={url || 'https://placehold.co/96x96?text=🙂'}
        alt="avatar"
        className="h-16 w-16 rounded-full object-cover border"
      />
      <label className="px-3 py-1 border rounded cursor-pointer text-sm">
        {busy ? 'Uploading…' : 'Change photo'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
          disabled={busy}
        />
      </label>
    </div>
  );
}
