import { NoteItem } from '../types/workspace';

interface PrintableNoteSheetProps {
  note: NoteItem | null;
  allNotes: NoteItem[];
}

export function PrintableNoteSheet({ note, allNotes }: PrintableNoteSheetProps) {
  if (!note) return null;

  const formattedUpdated = new Date(note.updatedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const linkedNotes = allNotes.filter(
    (n) => n.id !== note.id && note.linkedNoteIds.includes(n.id)
  );

  return (
    <article
      id="print-note-sheet"
      className="hidden print:block bg-white text-[#1F1E1B] p-6 max-w-2xl mx-auto"
    >
      <header className="pb-4 border-b border-[#D8D7D3]">
        <div className="text-xs text-[#5F5E5B]">
          Waynote · {note.notebook} · Updated {formattedUpdated}
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#1F1E1B]">
          {note.title.trim() || 'Untitled Note'}
        </h1>
        {note.tags.length > 0 && (
          <div className="mt-2 text-xs font-medium text-[#2383E2]">
            {note.tags.map((t) => `#${t}`).join('  ')}
          </div>
        )}
      </header>

      {note.body.trim() && (
        <section className="mt-5 text-sm leading-relaxed whitespace-pre-wrap text-[#1F1E1B]">
          {note.body}
        </section>
      )}

      {note.checklist.length > 0 && (
        <section className="mt-6 pt-4 border-t border-[#E6E5E1]">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#5F5E5B] mb-2">
            Checklist
          </h2>
          <ul className="space-y-1.5 text-sm">
            {note.checklist.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <span className="font-mono-tabular">
                  {item.done ? '[x]' : '[ ]'}
                </span>
                <span className={item.done ? 'line-through text-[#787774]' : ''}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {linkedNotes.length > 0 && (
        <section className="mt-6 pt-4 border-t border-[#E6E5E1]">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#5F5E5B] mb-2">
            Connected Notes
          </h2>
          <ul className="space-y-1 text-xs text-[#37352F]">
            {linkedNotes.map((ln) => (
              <li key={ln.id}>
                • {ln.title || 'Untitled Note'} ({ln.notebook})
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
