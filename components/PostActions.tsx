// components/PostActions.tsx
import Link from "next/link";

type Profile = { name?: string; handle?: string; avatar_url?: string };
type Note = {
  id: string;
  user_id: string;
  type: string;
  content: string;
  tags?: string[];
  created_at?: string;
  profiles?: Profile;
  thread_id?: string | null;
  archived?: boolean | null;
};

export default function PostActions({ note }: { note: Note }) {
  return (
    <div className="shrink-0">
      <details className="relative">
        <summary
          className="list-none cursor-pointer select-none rounded-full px-2 py-1 text-sm leading-none hover:bg-gray-100"
          aria-label="Post settings"
          title="Post settings"
        >
          ⚙️
        </summary>
        <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg z-30">
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
          <Link
            href={`/notes/${note.id}`}
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            Open note
          </Link>
        </div>
      </details>
    </div>
  );
}
