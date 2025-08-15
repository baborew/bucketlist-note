// pages/n/[id].tsx
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";

type Note = {
  id: string;
  user_id: string | null;
  content: string;
  created_at: string;
  thread_id: string | null;
  parent_id: string | null;
};

export default function ThreadPage({
  root,
  replies,
}: {
  root: Note | null;
  replies: Note[];
}) {
  if (!root) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-lg border p-4 text-gray-700">Note not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Root note */}
      <article className="rounded-lg border p-4">
        <h1 className="text-lg font-semibold mb-2">Thread</h1>
        <p className="whitespace-pre-wrap">{root.content}</p>
      </article>

      {/* Replies */}
      <section className="space-y-3">
        {replies.map((r) => (
          <div key={r.id} className="rounded-lg border p-4">
            <p className="whitespace-pre-wrap">{r.content}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export const GetServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const id = context.params?.id as string;

  const { data: root } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (!root) {
    return { props: { root: null, replies: [] } };
  }

  const { data: replies } = await supabase
    .from("notes")
    .select("*")
    .eq("thread_id", id)
    .neq("id", id)
    .order("created_at", { ascending: true });

  return {
    props: {
      root,
      replies: replies || [],
    },
  };
};
