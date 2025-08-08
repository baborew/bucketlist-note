// components/AuthGate.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);

      if (data.session) {
        // ensure profile exists
        const uid = data.session.user.id;
        await supabase.from('profiles').upsert({ id: uid });
        const { data: p } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
        setProfile(p);

        // 🚦 first‑time onboarding: if no handle or name, send to /me
        if (!p?.handle || !p?.name) router.push('/me');
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      if (s) {
        const uid = s.user.id;
        await supabase.from('profiles').upsert({ id: uid });
        const { data: p } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
        setProfile(p);
        if (!p?.handle || !p?.name) router.push('/me');
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        {/* Brand → clickable to home */}
        <a href="/" className="font-semibold text-lg">someday</a>

        {/* Right side: profile link / sign-in */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <a
                href="/me"
                className="inline-flex items-center gap-2 px-3 py-1 border rounded"
                title="Edit profile"
              >
                {/* simple avatar with initials */}
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                  {(profile?.name || session.user.email || '?')
                    .trim()[0]
                    ?.toUpperCase()}
                </span>
                <span className="text-sm">@{profile?.handle || 'profile'}</span>
              </a>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-3 py-1 border rounded"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              className="px-3 py-1 border rounded"
              onClick={async () => {
                const email = prompt('Enter email for magic link');
                if (!email) return;
                await supabase.auth.signInWithOtp({ email });
                alert('Check your email for a magic link!');
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto">{children}</div>
    </div>
  );
}
