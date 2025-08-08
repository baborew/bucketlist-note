import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
export default function Me() {
  const [form, setForm] = useState({ handle: '', name: '', bio: '', location: '' });
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user; if (!u) return;
      setUid(u.id);
      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
      if (p) setForm({ handle: p.handle || '', name: p.name || '', bio: p.bio || '', location: p.location || '' });
    });
  }, []);
  async function save() {
    if (!uid) return alert('Sign in first');
    const payload = { id: uid, ...form };
    const { error } = await supabase.from('profiles').upsert(payload);
    if (error) return alert(error.message);
    alert('Saved!');
  }
  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow">
      <h1 className="text-lg font-semibold mb-3">Your profile</h1>
      {['handle','name','bio','location'].map((k) => (
        <input key={k} className="w-full border rounded px-2 py-1 mb-2" placeholder={k}
          value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
      ))}
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={save}>Save</button>
    </div>
  );
}
