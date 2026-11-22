import React, { useState, useEffect } from 'react';
import {
  Archive,
  Check,
  CheckSquare,
  Copy,
  FileDown,
  Link2,
  MessageCircle,
  Pin,
  Plus,
  Printer,
  Trash2,
  X,
} from 'lucide-react';
import { NoteItem, NoteTint, TaskPriority } from '../types/workspace';
import { NOTE_NOTEBOOKS, NOTE_TINTS, TODAY_ISO } from '../data/seedData';
import { generateId } from '../utils/dateUtils';
import { downloadNoteAsTxt, getWhatsAppShareUrl } from '../utils/noteExport';

interface NoteEditorPanelProps {
  note: NoteItem;
  allNotes: NoteItem[];
  isMobileSheet?: boolean;
  onClose?: () => void;
  onUpdate: (updated: NoteItem) => void;
  onDelete: (id: string) => void;
  onSelectLinkedNote: (id: string) => void;
  onPrintNote?: (note: NoteItem) => void;
  onPromoteToTask: (payload: {
    title: string;
    dueDate: string;
    priority: TaskPriority;
    category: string;
    notes: string;
  }) => void;
}

export function NoteEditorPanel({
  note,
  allNotes,
  isMobileSheet = false,
  onClose,
  onUpdate,
  onDelete,
  onSelectLinkedNote,
  onPrintNote,
  onPromoteToTask,
}: NoteEditorPanelProps) {
  const [newTag, setNewTag] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promotedNotice, setPromotedNotice] = useState(false);

  useEffect(() => {
    setCopied(false);
    setPromotedNotice(false);
    setShowLinkPicker(false);
  }, [note.id]);

  const tintMeta =
    NOTE_TINTS.find((t) => t.id === note.tint) || NOTE_TINTS[0];

  const patchNote = (patch: Partial<NoteItem>) => {
    onUpdate({
      ...note,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const words = note.body.trim()
    ? note.body.trim().split(/\s+/).length
    : 0;
  const readMins = Math.max(1, Math.ceil(words / 200));

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newTag.trim().replace(/^#/, '').toLowerCase();
    if (!cleaned || note.tags.includes(cleaned)) {
      setNewTag('');
      return;
    }
    patchNote({ tags: [...note.tags, cleaned] });
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    patchNote({ tags: note.tags.filter((t) => t !== tag) });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newChecklistText.trim();
    if (!trimmed) return;
    patchNote({
      checklist: [
        ...note.checklist,
        { id: generateId('nc'), text: trimmed, done: false },
      ],
    });
    setNewChecklistText('');
  };

  const toggleChecklist = (id: string) => {
    patchNote({
      checklist: note.checklist.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    });
  };

  const removeChecklist = (id: string) => {
    patchNote({
      checklist: note.checklist.filter((item) => item.id !== id),
    });
  };

  const toggleLinkNote = (targetId: string) => {
    const exists = note.linkedNoteIds.includes(targetId);
    patchNote({
      linkedNoteIds: exists
        ? note.linkedNoteIds.filter((id) => id !== targetId)
        : [...note.linkedNoteIds, targetId],
    });
  };

  const handleCopy = async () => {
    const checklistText =
      note.checklist.length > 0
        ? '\n\n' +
          note.checklist
            .map((c) => `- [${c.done ? 'x' : ' '}] ${c.text}`)
            .join('\n')
        : '';
    const fullText = `${note.title || 'Untitled Note'}\n\n${note.body}${checklistText}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const handlePromoteNoteToTask = () => {
    onPromoteToTask({
      title: note.title.trim() || 'Follow up on note',
      dueDate: TODAY_ISO,
      priority: 'medium',
      category: 'Daily Focus',
      notes: note.body.slice(0, 280),
    });
    setPromotedNotice(true);
    window.setTimeout(() => setPromotedNotice(false), 2200);
  };

  const linkedNotes = allNotes.filter(
    (n) => n.id !== note.id && note.linkedNoteIds.includes(n.id)
  );
  const linkableNotes = allNotes.filter((n) => n.id !== note.id && !n.archived);

  const formattedUpdated = new Date(note.updatedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex flex-col h-full overflow-hidden rounded-2xl border ${tintMeta.cardClass}`}
    >
      {/* Mobile Grab Handle */}
      {isMobileSheet && (
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-[#D8D7D3] dark:bg-[#3F3F3D]" />
        </div>
      )}

      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-black/6 dark:border-white/8 shrink-0">
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close note editor"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#5F5E5B] dark:text-[#A4A39E] hover:bg-black/5 dark:hover:bg-white/8"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Pin Toggle */}
          <button
            type="button"
            onClick={() => patchNote({ pinned: !note.pinned })}
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors ${
              note.pinned
                ? 'text-[#2383E2] dark:text-[#60A5FA] bg-[#2383E2]/12 dark:bg-[#60A5FA]/15'
                : 'text-[#787774] dark:text-[#9B9A97] hover:bg-black/5 dark:hover:bg-white/8'
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>

          {/* Paper Tint Swatches */}
          <div className="flex items-center gap-1 pl-1">
            {NOTE_TINTS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => patchNote({ tint: t.id as NoteTint })}
                aria-label={`Set paper color to ${t.label}`}
                title={t.label}
                className="min-w-[32px] min-h-[36px] flex items-center justify-center"
              >
                <span
                  className={`w-5 h-5 rounded-full border transition-transform ${t.swatchClass} ${
                    note.tint === t.id
                      ? 'ring-2 ring-[#2383E2] ring-offset-1 scale-110'
                      : 'hover:scale-105'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-1">
          <a
            href={getWhatsAppShareUrl(note)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share note to WhatsApp"
            title="Share to WhatsApp"
            className="inline-flex items-center gap-1.5 px-2.5 min-h-[40px] rounded-xl bg-[#16A34A]/10 dark:bg-[#22C55E]/15 border border-[#16A34A]/25 dark:border-[#22C55E]/25 text-xs font-medium text-[#15803D] dark:text-[#4ADE80] hover:bg-[#16A34A]/18 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => downloadNoteAsTxt(note, allNotes)}
            aria-label="Download note as .txt"
            title="Download as .txt"
            className="inline-flex items-center gap-1 px-2.5 min-h-[40px] rounded-xl bg-white/80 dark:bg-black/25 border border-black/10 dark:border-white/10 text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:border-[#2383E2] transition-colors whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5 text-[#5F5E5B] dark:text-[#A4A39E]" aria-hidden="true" />
            <span>.txt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onPrintNote) {
                onPrintNote(note);
              } else {
                window.print();
              }
            }}
            aria-label="Print note or save as PDF"
            title="Print PDF"
            className="inline-flex items-center gap-1 px-2.5 min-h-[40px] rounded-xl bg-white/80 dark:bg-black/25 border border-black/10 dark:border-white/10 text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:border-[#2383E2] transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-[#5F5E5B] dark:text-[#A4A39E]" aria-hidden="true" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePromoteNoteToTask}
            className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-xl bg-white/80 dark:bg-black/25 border border-black/10 dark:border-white/10 text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:border-[#2383E2] transition-colors whitespace-nowrap"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#2383E2] dark:text-[#60A5FA]" aria-hidden="true" />
            <span>{promotedNotice ? 'Added to Tasks' : 'To Task'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy note text"
            title="Copy note text"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-black/5 dark:hover:bg-white/8"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => patchNote({ archived: !note.archived })}
            aria-label={note.archived ? 'Unarchive note' : 'Archive note'}
            title={note.archived ? 'Restore from archive' : 'Archive note'}
            className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-colors ${
              note.archived
                ? 'text-[#B57B2E] bg-[#B57B2E]/12'
                : 'text-[#787774] dark:text-[#9B9A97] hover:bg-black/5 dark:hover:bg-white/8'
            }`}
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(note.id)}
            aria-label="Delete note"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#787774] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Editor Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Notebook + Stats Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#787774] dark:text-[#9B9A97]">
          <div className="flex items-center gap-2">
            <select
              aria-label="Notebook"
              value={note.notebook}
              onChange={(e) => patchNote({ notebook: e.target.value })}
              className="min-h-[36px] px-2.5 rounded-lg bg-black/5 dark:bg-[#2A2A28] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] focus:outline-none focus:ring-2 focus:ring-[#2383E2]"
            >
              {NOTE_NOTEBOOKS.map((nb) => (
                <option key={nb} value={nb} className="bg-white dark:bg-[#242424] text-[#37352F] dark:text-[#E6E5E1]">
                  {nb}
                </option>
              ))}
            </select>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{formattedUpdated}</span>
          </div>

          <div className="font-mono-tabular text-[11px] tabular-nums">
            {words} words · {readMins} min read
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => patchNote({ title: e.target.value })}
          placeholder="Note title..."
          aria-label="Note title"
          className="w-full bg-transparent text-xl sm:text-2xl font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA] placeholder:text-[#9B9A97] focus:outline-none"
        />

        {/* Body Textarea */}
        <textarea
          rows={8}
          value={note.body}
          onChange={(e) => patchNote({ body: e.target.value })}
          placeholder="Capture ideas, code snippets, meeting takeaways, or reference notes..."
          aria-label="Note content"
          className="w-full bg-transparent text-[15px] leading-[1.68] text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] resize-y min-h-[160px] focus:outline-none"
        />

        {/* Tags Editor (Zero-Pill Unboxed Tags) */}
        <div className="pt-3 border-t border-black/6 dark:border-white/8 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-semibold text-[#787774] dark:text-[#9B9A97]">
              Tags
            </span>
            {note.tags.length === 0 && (
              <span className="text-[#9B9A97]">No tags yet</span>
            )}
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[#2383E2] dark:text-[#60A5FA] font-medium"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/8 dark:hover:bg-white/10 text-[#787774]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddTag} className="flex items-center gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag (e.g. design, research)..."
              className="flex-1 min-h-[40px] px-3 rounded-xl bg-black/5 dark:bg-white/6 text-xs text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:ring-1 focus:ring-[#2383E2]"
            />
            <button
              type="submit"
              className="px-3 min-h-[40px] rounded-xl bg-black/8 dark:bg-white/10 text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-black/12 dark:hover:bg-white/15 whitespace-nowrap"
            >
              Add tag
            </button>
          </form>
        </div>

        {/* Embedded Action Checklist */}
        <div className="pt-3 border-t border-black/6 dark:border-white/8 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
              Note checklist
            </h3>
            {note.checklist.length > 0 && (
              <span className="text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
                {note.checklist.filter((c) => c.done).length}/
                {note.checklist.length}
              </span>
            )}
          </div>

          {note.checklist.length > 0 && (
            <div className="space-y-1">
              {note.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1 min-h-[44px] rounded-xl hover:bg-black/4 dark:hover:bg-white/5 pr-1"
                >
                  <button
                    type="button"
                    onClick={() => toggleChecklist(item.id)}
                    aria-label={
                      item.done
                        ? `Uncheck "${item.text}"`
                        : `Check "${item.text}"`
                    }
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                  >
                    <span
                      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                        item.done
                          ? 'bg-[#2383E2] border-[#2383E2] text-white'
                          : 'border-[#B8B7B2] dark:border-[#525250]'
                      }`}
                    >
                      {item.done && <Check className="w-2.5 h-2.5 stroke-[2.75]" />}
                    </span>
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      item.done
                        ? 'line-through text-[#9B9A97]'
                        : 'text-[#37352F] dark:text-[#E6E5E1]'
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onPromoteToTask({
                        title: item.text,
                        dueDate: TODAY_ISO,
                        priority: 'medium',
                        category: 'Daily Focus',
                        notes: `From note: ${note.title || 'Untitled'}`,
                      })
                    }
                    title="Send to Tasks"
                    aria-label={`Send "${item.text}" to Tasks`}
                    className="px-2 min-h-[36px] text-[11px] font-medium text-[#2383E2] dark:text-[#60A5FA] hover:underline whitespace-nowrap"
                  >
                    → Task
                  </button>
                  <button
                    type="button"
                    onClick={() => removeChecklist(item.id)}
                    aria-label="Remove checklist item"
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#9B9A97] hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddChecklist} className="flex items-center gap-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="Add checklist item inside this note..."
              className="flex-1 min-h-[40px] px-3 rounded-xl bg-black/5 dark:bg-white/6 text-xs text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:ring-1 focus:ring-[#2383E2]"
            />
            <button
              type="submit"
              aria-label="Add checklist item"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-black/8 dark:bg-white/10 text-[#37352F] dark:text-[#E6E5E1] hover:bg-black/12"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Connected / Linked Notes */}
        <div className="pt-3 border-t border-black/6 dark:border-white/8 space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
              Connected notes
            </h3>
            <button
              type="button"
              onClick={() => setShowLinkPicker((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:underline min-h-[36px] px-1"
            >
              <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{showLinkPicker ? 'Done' : 'Link note'}</span>
            </button>
          </div>

          {linkedNotes.length > 0 ? (
            <div className="space-y-1.5">
              {linkedNotes.map((ln) => (
                <button
                  key={ln.id}
                  type="button"
                  onClick={() => onSelectLinkedNote(ln.id)}
                  className="w-full flex items-center justify-between gap-2 px-3 min-h-[44px] rounded-xl bg-black/5 dark:bg-white/6 hover:bg-black/8 dark:hover:bg-white/10 text-left transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#37352F] dark:text-[#E6E5E1] truncate">
                      {ln.title || 'Untitled Note'}
                    </div>
                    <div className="text-[11px] text-[#787774] dark:text-[#9B9A97] truncate">
                      {ln.notebook}
                      {ln.tags.length > 0
                        ? ` · ${ln.tags.map((t) => `#${t}`).join(' ')}`
                        : ''}
                    </div>
                  </div>
                  <span className="text-xs text-[#2383E2] dark:text-[#60A5FA] shrink-0">Open →</span>
                </button>
              ))}
            </div>
          ) : (
            !showLinkPicker && (
              <p className="text-xs text-[#9B9A97]">
                Connect related notes to build a personal knowledge web.
              </p>
            )
          )}

          {showLinkPicker && (
            <div className="p-2 rounded-xl bg-white/80 dark:bg-black/30 border border-black/10 dark:border-white/10 space-y-1 max-h-44 overflow-y-auto">
              {linkableNotes.length === 0 ? (
                <div className="py-2 text-center text-xs text-[#9B9A97]">
                  No other notes available to link.
                </div>
              ) : (
                linkableNotes.map((candidate) => {
                  const isLinked = note.linkedNoteIds.includes(candidate.id);
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => toggleLinkNote(candidate.id)}
                      className="w-full flex items-center justify-between gap-2 px-2.5 min-h-[40px] rounded-lg text-left hover:bg-black/5 dark:hover:bg-white/8"
                    >
                      <span className="text-xs text-[#37352F] dark:text-[#E6E5E1] truncate">
                        {candidate.title || 'Untitled Note'}
                      </span>
                      <span
                        className={`text-[11px] font-medium shrink-0 ${
                          isLinked ? 'text-[#2383E2] dark:text-[#60A5FA]' : 'text-[#9B9A97]'
                        }`}
                      >
                        {isLinked ? 'Linked' : 'Link'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
