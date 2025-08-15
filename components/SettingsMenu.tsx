// components/SettingsMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsMenu({
  noteId,
  table = "notes",
  onEdit,
}: {
  noteId: string;
  table?: string;
  onEdit?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, []);

  const handleArchive = async () => {
    await supabase.from(table).update({ archived: true }).eq("id", noteId);
    setOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await supabase.from(table).delete().eq("id", noteId);
    setOpen(false);
    router.refresh();
  };

  const handleEdit = () => {
    setOpen(false);
    if (onEdit) return onEdit(noteId);
    router.push(`/edit/${noteId}`); // change if you have a different edit route
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-1 rounded hover:bg-gray-100"
        aria-label="Open settings"
      >
        ⋯
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md z-20">
          <button
            onClick={handleEdit}
            className="w-full text-left px-3 py-2 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={handleArchive}
            className="w-full text-left px-3 py-2 hover:bg-gray-50"
          >
            Archive
          </button>
          <button
            onClick={handleDelete}
            className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
