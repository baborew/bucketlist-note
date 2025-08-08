import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  if (loading) return null;
  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div className="font-semibold">Bucketlist Note</div>
        <div className="flex items-center gap-3">
          {session ? (<>
            <span className="text-sm">{session.user.email}</span>
            <button onClick={() => supabase.auth.signOut()} className="px-3 py-1 border rounded">Sign out</button>
          </>) : (
            <button className="px-3 py-1 border rounded" onClick={async () => {
              const email = prompt('Enter email for magic link'); if (!email) return;
              await supabase.auth.signInWithOtp({ email }); alert('Check your email for a magic link!');
            }}>Sign in</button>
          )}
        </div>
      </div>
      <div className="max-w-xl mx-auto">{children}</div>
    </div>
  );
}
