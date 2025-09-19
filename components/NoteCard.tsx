// components/NoteCard.tsx
import Link from "next/link";

/* ===== Types ===== */
type Profile = { name?: string; handle?: string; avatar_url?: string };
export type Note = {
  id: string;
  user_id: string;
  type: "DID" | "DOING" | "WANT" | string;
  content: string;
  tags?: string[];
  created_at?: string;
  profiles?: Profile;
  thread_id?: string | null;
  archived?: boolean | null;
};

export default function NoteCard({
  note,
  showThreadLink = true,
}: {
  note: Note;
  showThreadLink?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {note.profiles?.name ?? "User"}
            </span>
            {note.profiles?.handle && (
              <span className="truncate">@{note.profiles.handle}</span>
            )}
            {note.created_at && <span aria-hidden>•</span>}
            {note.created_at && (
              <time dateTime={note.created_at}>
                {new Date(note.created_at).toLocaleDateString()}
              </time>
            )}
            <span className="ml-2 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide">
              {note.type || "NOTE"}
            </span>
          </div>
        </div>

        {/* SETTINGS (native details/summary so it always renders) */}
        <details className="relative">
          <summary
            className="list-none cursor-pointer select-none rounded-full px-2 py-1 text-sm leading-none hover:bg-gray-100"
            aria-label="Post settings"
          >
            ⚙️
          </summary>
          <div className="absolute right-0 mt-2 w-36 rounded-md border bg-white shadow-lg z-20">
            {/* TODO: wire these to real actions (modal, server action, etc.) */}
            <Link
              href={`/notes/${note.id}/edit`}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Edit
            </Link>
            <Link
              href={`/notes/${note.id}/delete`}
              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </Link>
          </div>
        </details>
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        <p className="whitespace-pre-wrap text-[15px] leading-6 text-gray-900">
          {note.content}
        </p>

        {!!note.tags?.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {note.tags!.map((t) => (
              <span
                key={t}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {showThreadLink && note.thread_id && (
          <div className="mt-3">
            <Link
              href={`/threads/${note.thread_id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View threads →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
