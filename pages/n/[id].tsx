// components/ReplyForm.tsx
"use client";

import { useState } from "react";
// If you already have a central client, keep this import:
import { supabase } from "../lib/supabaseClient"; 
// If not, replace the above with:
// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type ReplyFormProps = {
  // The note the user clicked "Reply" on (could be root or a reply)
  replyingToId: string;
  // Optional: refresh UI after posting
  onPosted?: (newNoteId: string) => void;
  // Optional: placeholder text
  placeholder?: string;
};

export default function ReplyForm({
  replyingToId,
  onPosted,
  placeholder = "Write a reply…",
}: ReplyFormProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function getRootId(noteId: string): Promise<string> {
    // Fetch the target note. If it’s a reply, it has thread_id = root.id
    // If it’s a root post, thread_id should equal its own id.
    const { data, error } = await supabase
      .from("notes")
      .select("id, thread_id")
      .eq("id", noteId)
      .single();

    if (error || !data) throw error ?? new Error("Note not found");
    return data.thread_id ?? data.id;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1) Who’s posting?
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        throw new Error("You must be signed in to reply.");
      }

      // 2) Resolve the root id (works for replying to root OR to a reply)
      const rootId = await getRootId(replyingToId);

      // 3) Insert the reply with thread_id = ROOT ID (the key to make threads work)
      const { data: inserted, error: insertErr } = await supabase
        .from("notes")
        .insert([
          {
            content: text.trim(),
            type: "reply",
            thread_id: rootId,  // <-- IMPORTANT
            user_id: user.id,   // keep if your RLS requires explicit user_id
          },
        ])
        .select("id")
        .single();

      if (insertErr) throw insertErr;

      // 4) Reset & let parent refresh
      setText("");
      if (onPosted && inserted?.id) onPosted(inserted.id);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to post reply.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <textarea
        className="w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring"
        rows={3}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between">
        {errorMsg ? <div className="text-red-600 text-sm">{errorMsg}</div> : <span />}
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Reply"}
        </button>
      </div>
    </form>
  );
}
