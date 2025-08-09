import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

type Profile = { id: string; handle?: string; name?: string; bio?: string; location?: string } | null;

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [checking, setChecking] = useState(true); // no more blank page

  useEffect(() => {
    let unsub: any;

    async function init() {
      try {
        // get session
        const { data } = await supabase.auth.getSession();
        setSession(data.session);

        if (data.session) {
          const uid = data.session.user.id;

          // ensure a profile row exists (prevents FK errors)
          await supabase.from('profiles').upsert({ id: uid });

          // load profile (non-blocking if it fails)
          const { data: p } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .maybeSingle();
          setProfile((p as any) || null);
        }
      } catch (e) {
        console.error('Auth init error', e);
      } finally {
        setChecking(false);
      }

      // listen for auth changes
      const sub = supabase.auth.onAuthStateChange(async (_e, s) => {
        setSession(s);
        if (s) {
          try {
            const uid = s.user.id;
            await supabase.from('profiles').upsert({ id: uid });
            const { data: p } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', uid)
              .maybeSingle();
            setProfile((p as any) || null);
          } catch (e) {
            console.error('Auth change error', e);
          }
        } else {
          setProfile(null);
        }
      });
      unsub = sub.subscription;
    }

    init();
    return () => unsub?.unsubscribe?.();
  }, []);

  // Header always renders (even while checking)
  return (
    <div>
      <div className="flex items-center justify-between p-4">
        {/* Brand → Home */}
        <Link href="/" className="font-semibold text-lg">someday</Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/me"
                className="inline-flex items-center gap-2 px-3 py-1 border rounded"
                title="Edit profile"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                  {(profile?.name || session.user?.email || '?')?.trim?.()[0]?.toUpperCase?.() || 'U'}
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

      {/* Gentle nudge to complete profile if signed in but missing basics */}
      {session && !checking && (!profile?.handle || !profile?.name) && (
        <div className="max-w-xl mx-auto mb-3 px-3">
          <div className="rounded border bg-yellow-50 p-3 text-sm">
            Complete your profile to help others find you. <Link href="/me" className="underline">Go to profile →</Link>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto">
        {/* While checking auth, still render children so no blank page */}
        {children}
      </div>
    </div>
  );
}
