// components/NoteCard.tsx
import Link from 'next/link';
import FollowButton from './FollowButton';
import CheerButton from './CheerButton';

type Profile = { name?: string; handle?: string; avatar_url?: string };
type Note = {
  id: string;
  user_id: string;
  type: string;
  content: string;
  tags?: string[];
  profiles?: Profile; // comes from the join
};

export default function NoteCard({
  note,
  showThreadLink = true,
}: {
  note: Note;
  showThreadLink?: boolean;
}) {
  const p = note.profiles || {};
  const avatar =
    p.avatar_url ||
    'https://placehold.co/32x32?text=%20'; // tiny placeholder if none

  return (
    <div className="p-4 bg-white rounded-xl shadow mb-4">
      {/* Header: avatar + name/handle + type + Follow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${note.user_id}`} className="shrink-0">
            <img
              src={avatar}
              alt="avatar"
              className="h-8 w-8 rounded-full object-cover border"
            />
          </Link>
          <div className="leading-tight">
            <Link href={`/profile/${note.user_id}`} className="font-medium hover:underline">
              {p.name || 'User'}
            </Link>
            <div className="text-xs text-gray-500">
              @{p.handle || note.user_id.slice(0, 8)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">{note.type}</div>
          <FollowButton userId={note.user_id} />
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 whitespace-pre-wrap">{note.content}</p>

      {/* Tags */}
      {!!(note.tags && note.tags.length) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {note.tags.map((tag: string) => (
            <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: cheers + View threads (optional) */}
      <div className="mt-3 flex items-center justify-between">
        <CheerButton noteId={note.id} />
        {showThreadLink && (
          <Link href={`/n/${note.id}`} className="text-sm text-blue-700">
            View threads →
          </Link>
        )}
      </div>
    </div>
  );
}
