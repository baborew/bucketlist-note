// pages/n/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import Comments from '../../components/Comments';

type Note = {
  id: string;
  user_id: string;
  type: 'Did' | 'Doing' | 'Want' | 'Someday';
  content: string;
  tags: string[] | null;
  created_at: string;
};

type Profile = {
  id: string;
  name?: string | null;
  handle?: string | null;
};

export default function NotePage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [note, setNote] = useState<Note | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      // load note
      const { data: n } = await supabase.from('notes').select('*').eq('id', id).maybeSingle();
      if (!n) return;
      setNote(n as Note);
      // load author profile
      const { data: p } = await supabase.from('profiles').select('*').eq('id', n.user_id).maybeSingle();
      setAuthor(p as Profile);
    })();
  }, [id]);

  if (!id) return null;

  return (
    <div className="p-4">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-sm text-blue-600">← Back to feed</Link>

        {!note ? (
          <div className="mt-6 text-gray-500">Loading…</div>
        ) : (
          <div className="mt-4 rounded border p-4">
            <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">{note.type}</div>
            <div className="whitespace-pre-wrap text-lg">{note.content}</div>

            {note.tags && note.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {note.tags.map(t => (
                  <span key={t} className="rounded bg-gray-100 px-2 py-1 text-xs">#{t}</span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                by{' '}
                <Link href="/me" className="underline">
                  {author?.name || 'Someone'}
                </Link>
              </div>
              <div>{new Date(note.created_at).toLocaleString()}</div>
            </div>

            {/* Comments */}
            <Comments noteId={note.id} />
          </div>
        )}
      </div>
    </div>
  );
}
