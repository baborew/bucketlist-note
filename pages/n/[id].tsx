// pages/n/[id].tsx
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
// If you're using @supabase/auth-helpers-nextjs:
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
// If you're NOT using the helper, replace the line above with your own server client factory.

type Note = {
  id: string;
  user_id: string | null;
  type?: string | null;
  content: string | null;
  created_at?: string | null;
  thread_id?: string | null;
  archived?: boolean | null;
  // add any other columns you have
};

type Props =
  | { note: Note; error?: undefined }
  | { note?: undefined; error: string };

const ThreadPage: NextPage<Props> = ({ note, error }) => {
  return (
    <>
      <Head>
        <title>{error ? "Error • Thread" : `Thread • ${note.id.slice(0, 8)}`}</title>
      </Head>

      <main className="mx-auto max-w-2xl p-4">
        <a href="/" className="text-sm text-blue-600 hover:underline">← Back</a>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="font-semibold mb-1">Error loading note</div>
            <div className="text-sm">{error}</div>
            <p className="mt-2 text-xs text-red-700">
              (This message is temporary for debugging. Once it works, remove this error UI.)
            </p>
          </div>
        ) : !note ? (
          <div className="mt-4 rounded-lg border p-4">Not found</div>
        ) : (
          <article className="mt-4 rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">
              {note.created_at &&
                new Date(note.created_at).toLocaleString()}
            </div>
            <h1 className="mt-1 text-sm uppercase tracking-wide text-gray-500">
              {note.type || "Note"}
            </h1>
            <p className="mt-2 whitespace-pre-wrap">{note.content}</p>

            <pre className="mt-4 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
{JSON.stringify(note, null, 2)}
            </pre>
          </article>
        )}
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const id = String(ctx.query.id || "");

  // --- Create a server-side Supabase client that includes cookies/session ---
  // If you aren't using the auth-helpers package, replace this with your own
  // createServerClient(ctx) that forwards request cookies.
  const supabase = createServerSupabaseClient(ctx);

  // Try to fetch the note by the URL id
  const { data, error } = await supabase
    .from<Note>("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    // Log to your server console for diagnosis
    console.error("Supabase error loading thread root:", {
      code: (error as any).code,
      message: error.message,
      hint: (error as any).hint,
      details: (error as any).details,
      id,
    });

    // Show the error text on the page so you can distinguish 403/401 vs 404
    return {
      props: {
        error: `${(error as any).code ?? "ERR"}: ${error.message}`,
      },
    };
  }

  if (!data) {
    // True "not found"
    return { notFound: true };
  }

  return { props: { note: data } };
};

export default ThreadPage;
