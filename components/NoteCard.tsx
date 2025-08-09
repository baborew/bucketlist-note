// components/NoteCard.tsx
import Link from 'next/link';
import FollowButton from './FollowButton';
import CheerButton from './CheerButton';

export default function NoteCard({
  note,
  showThreadLink = true,
}: {
  note: any;
  showThreadLink?: boolean;
}) {
  return (
    <div className="p-4 bg-white rounded-xl shadow mb-4">
      {/* Header: type + Follow */}
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-gray-500">{note.type}</div>
        <FollowButton userId={note.user_id} />
      </div>

      {/* Content */}
      <p className="mt-1 whitespace-pre-wrap">{note.content}</p>

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

      {/* Footer: cheers + link (optional) */}
      <div className="mt-3 flex items-center justify-between">
        <CheerButton noteId={note.id} />
        {showThreadLink && (
          <Link href={`/profile/${note.user_id}`} className="text-sm text-blue-700">
            View threads →
          </Link>
        )}
      </div>
    </div>
  );
}
