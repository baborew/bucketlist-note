// components/NoteCard.tsx
import FollowButton from './FollowButton';
import CheerButton from './CheerButton';

export default function NoteCard({ note }: { note: any }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow mb-4">
      {/* Header: type on the left, Follow on the right */}
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {note.type}
        </div>
        {/* Follow author (button hides itself if it's me or I'm signed out) */}
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

      {/* Footer: cheers + profile link */}
      <div className="mt-3 flex items-center justify-between">
        <CheerButton noteId={note.id} />
        <a href={`/profile/${note.user_id}`} className="text-sm text-blue-700">
          View profile →
        </a>
      </div>
    </div>
  );
}
