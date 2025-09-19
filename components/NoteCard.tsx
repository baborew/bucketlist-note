// components/NoteCard.tsx
import Link from "next/link";

type Profile = {
  name?: string;
  handle?: string;
  avatar_url?: string;
};

export type Note = {
  id: string;
  user_id?: string | null;
  type?: string | null;
  content: string;
  tags?: string[] | null;
  created_at?: string | null;
  profiles?: Profile | null;
  thread_id?: string | null;
  archived?: boolean | null;
};

function isUuid(s?: string | null): boolean {
  return !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export default function NoteCard({
  note,
  showThreadLink = true,
}: {
  note: Note;
  showThreadLink?: boolean;
}) {
  const p = note.profiles || {};
  const avatar =
    p.avatar_url || "https://placehold.co/32x32/png?text=%20";

  // ✅ Safe fallback: use thread_id only if it’s a valid UUID
  const rootId = isUuid(note.thread_id) ? note.thread_id! : note.id;
  const threadHref = `/n/${rootId}`;

  console.log("NoteCard link check:", {
    noteId: note.id,
    threadId: note.thread_id,
    threadHref,
  });

  return (
    <div className="relative rounded-xl border bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt="avatar"
            className="h-8 w-8 rounded-full object-cover border"
          />
          <div className="leading-tight">
            <div className="font-medium">{p.name || "User"}</div>
            <div className="text-xs text-gray-500">
              @{p.handle || (note.user_id ? note.user_id.slice(0, 8) : "anon")}
            </div>
          </div>
        </div>
        {note.type && (
          <div className="text-xs uppercase tracking-wide text-gray-500">
            {note.type}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="mt-3 whitespace-pre-wrap">{note.content}</p>

      {/* Tags */}
      {!!note.tags?.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-200 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      {showThreadLink && (
        <div className="mt-3 text-sm">
          <Link href={threadHref} className="text-blue-600 hover:underline">
            View thread →
          </Link>
        </div>
      )}
    </div>
  );
}
