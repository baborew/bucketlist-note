// components/NoteCard.tsx
import Link from "next/link";
import SettingsMenu from "./SettingsMenu";

type Note = {
  id: string;
  user_id?: string | null;
  content: string;
  created_at?: string;
  thread_id?: string | null;
  archived?: boolean | null;
};

export default function NoteCard({ note }: { note: Note }) {
  // If this note is part of a thread, link to the root; otherwise link to itself
  const threadHref = `/n/${note.thread_id ?? note.id}`;

  return (
    <div className="relative rounded-lg border p-4">
      {/* ⋯ Settings button */}
      <div className="absolute right-2 top-2">
        <SettingsMenu noteId={note.id} />
      </div>

      {/* Content */}
      <div className="pr-10">
        <p className="whitespace-pre-wrap">{note.content}</p>
      </div>

      {/* Footer */}
      <div className="mt-3 text-sm">
        <Link href={threadHref} className="text-blue-600 hover:underline">
          View thread
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';
import CheerButton from './CheerButton';
import FollowButton from './FollowButton'; // if you don't have this file, remove this line and the component below

type Profile = { name?: string; handle?: string; avatar_url?: string };
type Note = {
  id: string;
  user_id: string;
  type: string;
  content: string;
  tags?: string[];
  created_at?: string;
  profiles?: Profile; // may be missing; code below handles that
};

export default function NoteCard({
  note,
  showThreadLink = true, // hide on the thread page
}: {
  note: Note;
  showThreadLink?: boolean;
}) {
  const p = note.profiles || {};
  const avatar = p.avatar_url || 'https://placehold.co/32x32?text=%20';

  return (
    <div className="p-4 bg-white rounded-xl shadow mb-4">
      {/* Header: avatar + name/handle on left, type + follow on right */}
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
          {/* Remove this <FollowButton> if you didn't add that component yet */}
          <FollowButton userId={note.user_id} />
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 whitespace-pre-wrap">{note.content}</p>

      {/* Tags */}
      {!!(note.tags && note.tags.length) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: cheers + View threads (only if showThreadLink=true) */}
      <div className="mt-3 flex items-center justify-between">
        <CheerButton noteId={note.id} />
        {showThreadLink && (
         // components/NoteCard.tsx (inside the card header or wherever you link)
import Link from "next/link";

const threadHref = `/threads/${note.thread_id ?? note.id}`;

<Link href={threadHref} className="text-sm text-blue-600 hover:underline">
  View thread
</Link>
        )}
      </div>
    </div>
  );
}
