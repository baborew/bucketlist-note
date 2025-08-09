"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { EditModal } from "./EditModal"; // ✅ add this

// If you already have a central client: `import { supabase } from "@/lib/supabaseClient"`
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Post = {
  id: string;
  title?: string | null;
  content?: string | null;
  archived?: boolean | null;
};

interface PostActionsProps {
  post: Post;
  tableName?: string;
  onEdited?: (post: Post) => void;
  onDeleted?: (id: string) => void;
  onArchived?: (id: string, archived: boolean) => void;
}

export default function PostActions({
  post,
  tableName = "notes",
  onEdited,
  onDeleted,
  onArchived,
}: PostActionsProps) {
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const { error } = await supabase.from(tableName).delete().eq("id", post.id);
    if (error) return alert(`Delete failed: ${error.message}`);
    onDeleted?.(post.id);
    router.refresh();
  }

  async function handleArchive(flag: boolean) {
    const { error } = await supabase
      .from(tableName)
      .update({ archived: flag })
      .eq("id", post.id);
    if (error) return alert(`Update failed: ${error.message}`);
    onArchived?.(post.id, flag);
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-label="Post settings"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white text-sm shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={() => {
              setShowEdit(true);
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            ✏️ Edit
          </button>
          {post.archived ? (
            <button
              onClick={() => handleArchive(false)}
              className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              📂 Unarchive
            </button>
          ) : (
            <button
              onClick={() => handleArchive(true)}
              className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              🗄️ Archive
            </button>
          )}
          <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" />
          <button
            onClick={handleDelete}
            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {showEdit && (
        <EditModal
          post={post}
          tableName={tableName}
          onClose={() => setShowEdit(false)}
          onSaved={(p) => {
            onEdited?.(p);
            setShowEdit(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}
