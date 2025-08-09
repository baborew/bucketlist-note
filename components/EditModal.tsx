"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // ✅ use central client

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
    const { data, error } = await supabase
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
