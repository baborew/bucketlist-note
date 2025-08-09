import { useEffect, useState } from 'react';
import Link from 'next/link';
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
        const uid = data.session.user.id;

        // Ensure a profile row exists
        await supabase.from('profiles').upsert({ id: uid });

        // Load profile
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .maybeSingle();

        setProfile(p || null);

        // Onboarding: if missing basic info, nudge to /me
        if (!p?.handle || !p?.name) {
          if (router.pathname !== '/me') router.push('/me');
        }
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      if (s) {
        const uid = s.user.id;
        await supabase.from('profiles').upsert({ id: uid });
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .maybeSingle();
        setProfile(p || null);
        if (!p?.handle || !p?.name) {
          if (router.pathname !== '/me') router.push('/me');
        }
      } else {
        setProfile(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (loading) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {/* Brand → Home */}
        <Link href="/" className="font-semibold text-lg">
          someday
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Profile button → /me */}
              <Link
                href="/me"
                className="inline-flex items-center gap-2 px-3 py-1 border rounded"
                title="Edit profile"
              >
                {/* Simple avatar/initial */}
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                  {(profile?.name || session.user.email || '?')
                    .trim()[0]
                    ?.toUpperCase()}
                </span>
                <span className="text-sm">@{profile?.handle || 'profile'}</span>
              </Link>

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

      {/* Page content */}
      <div className="max-w-xl mx-auto">{children}</div>
    </div>
  );
}
