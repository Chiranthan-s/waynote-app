import { NoteItem } from '../types/workspace';

export function formatNoteAsPlainText(
  note: NoteItem,
  allNotes: NoteItem[] = []
): string {
  const title = note.title.trim() || 'Untitled Note';
  const updated = new Date(note.updatedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const sections: string[] = [
    title,
    `Notebook: ${note.notebook} · Updated ${updated}`,
  ];

  if (note.tags.length > 0) {
    sections.push(`Tags: ${note.tags.map((t) => `#${t}`).join(' ')}`);
  }

  if (note.body.trim()) {
    sections.push('', note.body.trim());
  }

  if (note.checklist.length > 0) {
    sections.push(
      '',
      'Checklist:',
      ...note.checklist.map((c) => `- [${c.done ? 'x' : ' '}] ${c.text}`)
    );
  }

  if (note.linkedNoteIds.length > 0 && allNotes.length > 0) {
    const linkedTitles = allNotes
      .filter((n) => n.id !== note.id && note.linkedNoteIds.includes(n.id))
      .map((n) => `- ${n.title || 'Untitled Note'}`);
    if (linkedTitles.length > 0) {
      sections.push('', 'Connected Notes:', ...linkedTitles);
    }
  }

  return sections.join('\n');
}

export function getWhatsAppShareUrl(note: NoteItem): string {
  const text = formatNoteAsPlainText(note);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function slugifyFilename(title: string): string {
  const clean = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'waynote-note';
}

export function downloadNoteAsTxt(
  note: NoteItem,
  allNotes: NoteItem[] = []
): void {
  const content = formatNoteAsPlainText(note, allNotes);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugifyFilename(note.title)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
