// pages/n/[id].tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

type Note = {
  id: string;
  user_id: string | null;
  content: string;
  created_at: string | null;
  thread_id: string | null;
  archived?: boolean | null;
};

type Props = {
  root: Note;
  replies: Note[];
};

export default function ThreadPage({ root, replies }: Props) {
  return (
    <>
      <Head>
        <title>Thread • {root.id.slice(0, 8)}</title>
      </Head>
      <main className="max-w-2xl mx-auto p-4">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back
        </Link>

        {/* Root note */}
        <article className="mt-3 rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">
            {root.created_at && new Date(root.created_at).toLocaleString()}
          </div>
          <p className="mt-2 whitespace-pre-wrap">{root.content}</p>
        </article>

        {/* Replies */}
        <section className="mt-6 space-y-3">
          {replies.length === 0 ? (
            <div className="text-sm text-gray-500">No replies yet.</div>
          ) : (
            replies.map((n) => (
              <article
                key={n.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="text-xs text-gray-500">
                  {n.created_at && new Date(n.created_at).toLocaleString()}
                </div>
                <p className="mt-2 whitespace-pre-wrap">{n.content}</p>
              </article>
            ))
          )}
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const idParam = String(ctx.query.id);

  // Attach user session for RLS-aware reads
  const supabase = createServerSupabaseClient(ctx);

  // 1) Try to load the note by the URL id
  const { data: candidate, error: candidateErr } = await supabase
    .from("notes")
    .select("*")
    .eq("id", idParam)
    .single();

  if (candidateErr && candidateErr.code !== "PGRST116") {
    // Any error other than "row not found" → surface a 500 for debugging
    throw new Error(candidateErr.message);
  }

  // 2) Resolve the "root id":
  // - If the candidate exists and has thread_id, the root is thread_id.
  // - If the candidate exists and has NO thread_id, the root is its own id.
  // - If the candidate does not exist, treat the URL id as a potential root id.
  const rootId = candidate ? candidate.thread_id ?? candidate.id : idParam;

  // 3) Load the root note
  const { data: root, error: rootErr } = await supabase
    .from("notes")
    .select("*")
    .eq("id", rootId)
    .single();

  // If we can't see the root, it's either not found or blocked by RLS
  if (rootErr || !root) {
    return { notFound: true };
  }

  // 4) Load replies that belong to this thread (exclude the root)
  const { data: replies, error: repliesErr } = await supabase
    .from("notes")
    .select("*")
    .eq("thread_id", root.id)
    .order("created_at", { ascending: true });

  if (repliesErr) {
    throw new Error(repliesErr.message);
  }

  return {
    props: {
      root,
      replies: replies ?? [],
    },
  };
};
