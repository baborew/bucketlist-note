// components/NoteCard.tsx
"use client";

import { useState } from "react";
// (Optional) If you have lucide-react installed, uncomment the next line and replace the "⋯" button content.
// import { MoreHorizontal } from "lucide-react";
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

/* ===== Small dropdown menu used by each card ===== */
function SettingsDropdown({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Post settings"
        className="p-2 rounded-full hover:bg-gray-100 transition"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Replace "⋯" with <MoreHorizontal className="h-5 w-5" /> if using lucide */}
        <span className="inline-block align-middle text-xl leading-none">⋯</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-36 rounded-md border bg-white shadow-lg z-10"
          onMouseLeave={() => setOpen(false)}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== Main card ===== */
export default function NoteCard({
  note,
  showThreadLink = true,
  onDeleted, // optional callback to refresh parent after delete
  onUpdated, // optional callback to refresh parent after update
}: {
  note: Note;
  showThreadLink?: boolean;
  onDeleted?: (id: string) => void;
  onUpdated?: (updated: Note) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    try {
      setPending(true);

      // TODO: replace with your real update call, e.g. Supabase/Action.
      // Example (Supabase):
      // const { data, error } = await supabase
      //   .from("notes")
      //   .update({ content: draft })
      //   .eq("id", note.id)
      //   .select()
      //   .single();
      // if (error) throw error;
      // const updated = { ...note, ...data };

      const updated = { ...note, content: draft }; // temp local update
      setEditing(false);
      onUpdated?.(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    const ok = confirm("Delete this note? This cannot be undone.");
    if (!ok) return;

    try {
      setPending(true);

      // TODO: replace with your real delete call
      // Example (Supabase):
      // const { error } = await supabase.from("notes").delete().eq("id", note.id);
      // if (error) throw error;

      onDeleted?.(note.id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete note.");
    } finally {
      setPending(false);
    }
  }

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
            {note.created_at && (
              <span aria-hidden>•</span>
            )}
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

        <SettingsDropdown
          onEdit={() => setEditing(true)}
          onDelete={handleDelete}
        />
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        {!editing ? (
          <>
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
                  View thread →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <textarea
              className="w-full rounded border p-3 text-sm outline-none focus:ring"
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={pending}
            />
            <div className="flex items-center gap-2">
              <button
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                onClick={handleSave}
                disabled={pending || draft.trim().length === 0}
              >
                {pending ? "Saving..." : "Save"}
              </button>
              <button
                className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setDraft(note.content);
                  setEditing(false);
                }}
                disabled={pending}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
