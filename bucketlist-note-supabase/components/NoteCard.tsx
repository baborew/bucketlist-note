import CheerButton from './CheerButton';
export default function NoteCard({ note }: { note: any }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow mb-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{note.type}</div>
      <p className="mt-1 whitespace-pre-wrap">{note.content}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(note.tags || []).map((tag: string) => (
          <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">#{tag}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <CheerButton noteId={note.id} />
        <a href={`/profile/${note.user_id}`} className="text-sm text-blue-700">View profile →</a>
      </div>
    </div>
  );
}
