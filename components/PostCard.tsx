// =============================
// File: components/PostActions.tsx
// A 3-dots (kebab) settings button with Edit, Archive, Delete
// Works with Next.js (app router), TailwindCSS, and Supabase
// =============================
"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// If you already have a central supabase client (e.g., lib/supabaseClient.ts),
// replace this with: `import { supabase } from "../lib/supabaseClient";`
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Post = {
  id: string;
  title?: string | null;
  content?: string | null;
  archived?: boolean | null;
  // add any other fields you use (e.g. created_at, user_id)
};

interface PostActionsProps {
  post: Post;
  tableName?: string; // default: "notes"
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

  // close on outside click
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
    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }
    onDeleted?.(post.id);
    router.refresh();
  }

  async function handleArchive(flag: boolean) {
    const { data, error } = await supabase
      .from(tableName)
      .update({ archived: flag })
      .eq("id", post.id)
      .select()
      .single();
    if (error) {
      alert(`Update failed: ${error.message}`);
      return;
    }
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

// =============================
// File: components/EditModal.tsx
// Simple edit modal for title/content (customize to your fields)
// =============================
"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase2 = createClient(supabaseUrl2, supabaseAnonKey2);

export function EditModal({
  post,
  tableName = "notes",
  onClose,
  onSaved,
}: {
  post: { id: string; title?: string | null; content?: string | null };
  tableName?: string;
  onClose: () => void;
  onSaved: (p: any) => void;
}) {
  const [title, setTitle] = useState(post.title ?? "");
  const [content, setContent] = useState(post.content ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { data, error } = await supabase2
      .from(tableName)
      .update({ title, content })
      .eq("id", post.id)
      .select()
      .single();
    setSaving(false);
    if (error) return alert(`Save failed: ${error.message}`);
    onSaved(data);
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Post</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">✖️</button>
        </div>
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block">Title</span>
            <input
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Content</span>
            <textarea
              className="h-32 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something..."
            />
          </label>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================
// File: components/PostCard.tsx (example usage)
// Put the settings button at the top-right of each post card
// =============================
"use client";

import PostActions, { Post } from "./PostActions";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="relative rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-gray-800">
      <div className="absolute right-2 top-2">
        <PostActions post={post} tableName="notes" />
      </div>

      {/* Your post display */}
      <h2 className="pr-10 text-base font-semibold">{post.title}</h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>

      {post.archived && (
        <span className="mt-3 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Archived
        </span>
      )}
    </article>
  );
}

// =============================
// QUICK INSTALL STEPS (read me)
// 1) Create these files:
//    - components/PostActions.tsx
//    - components/EditModal.tsx
//    - components/PostCard.tsx (or add <PostActions/> to your existing card)
// 2) Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set in .env.local
// 3) Your Supabase table should be `notes` with columns: id (uuid), title (text), content (text), archived (bool, default false)
// 4) Use <PostCard post={post}/> wherever you list posts. The menu gives Edit / Archive / Delete.
// 5) If you already have a supabase client at lib/supabaseClient.ts, import it and remove the createClient lines in both files.
