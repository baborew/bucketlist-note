// components/NoteCard.tsx
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Note = {
  id: string;
  user_id: string;
  type: 'Did' | 'Doing' | 'Want' | 'Someday';
  content: string;
  tags: string[] | null;
  created_at: string;
};

export default function NoteCard({
  note,
  onChanged,
}: {
  note: Note;
  onChanged?: () => void; // call to refresh parent list after cheer/uncheer
}) {
  const [busy, setBusy] = useState(false);
  const [cheers, setCheers] = useState<number | null>(null);

  // (Optional) you might already be passing a cheers count; if not, you can keep this simple
  async function toggleCheer() {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to cheer.');
      setBusy(false);
      return;
    }
    // ensure profile exists so FK never fails
    await supabase.from('profiles').upsert({ id: user.id });

    // try insert; if exists, delete
    const { error: insErr } = await supabase
      .from('cheers')
      .insert({ user_id: user.id, note_id: note.id });

    if (insErr) {
      // likely already cheered -> uncheer
      await supabase.from('cheers').delete().match({ user_id: user.id, note_id: note.id });
    }

    setBusy(false);
    setCheers((c) => (c == null ? c : c + (insErr ? -1 : 1)));
    onChanged?.();
  }

  return (
    <div className="rounded border p-4">
      <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
        {note.type}
      </div>

      {/* 🔗 Main link to the note page */}
      <Link href={`/n/${note.id}`} className="block hover:underline">
        <div className="whitespace-pre-wrap text-base">
          {note.content}
        </div>
      </Link>

      {note.tags && note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.map((t) => (
            <span key={t} className="rounded bg-gray-100 px-2 py-1 text-xs">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={toggleCheer}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded border px-3 py-1 text-sm disabled:opacity-50"
          title="Cheer"
        >
          <span>👏</span>
          <span>{cheers ?? 0}</span>
        </button>

        {/* Optional extra link to the same thread */}
        <Link href={`/n/${note.id}`} className="text-sm text-blue-600 hover:underline">
          View thread →
        </Link>
      </div>
    </div>
  );
}
