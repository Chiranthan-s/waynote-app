import React, { useMemo, useState } from 'react';
import {
  Archive,
  Check,
  FileDown,
  LayoutGrid,
  List as ListIcon,
  MessageCircle,
  Pin,
  Plus,
  Printer,
  Search,
} from 'lucide-react';
import { NoteItem, NoteTint, TaskPriority } from '../types/workspace';
import { NOTE_NOTEBOOKS, NOTE_TINTS } from '../data/seedData';
import { downloadNoteAsTxt, getWhatsAppShareUrl } from '../utils/noteExport';
import { NoteEditorPanel } from './NoteEditorPanel';

interface NotesViewProps {
  notes: NoteItem[];
  selectedNoteId: string | null;
  layoutMode: 'grid' | 'list';
  onChangeLayoutMode: (mode: 'grid' | 'list') => void;
  onSelectNoteId: (id: string | null) => void;
  onCreateNote: (payload: {
    title: string;
    body: string;
    notebook: string;
    tags: string[];
    tint: NoteTint;
  }) => NoteItem;
  onUpdateNote: (updated: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onPrintNote: (note: NoteItem) => void;
  onPromoteToTask: (payload: {
    title: string;
    dueDate: string;
    priority: TaskPriority;
    category: string;
    notes: string;
  }) => void;
}

export function NotesView({
  notes,
  selectedNoteId,
  layoutMode,
  onChangeLayoutMode,
  onSelectNoteId,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onPrintNote,
  onPromoteToTask,
}: NotesViewProps) {
  const [notebookFilter, setNotebookFilter] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Instant Scratchpad Capture State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickBody, setQuickBody] = useState('');
  const [quickNotebook, setQuickNotebook] = useState(NOTE_NOTEBOOKS[0]);
  const [quickTint, setQuickTint] = useState<NoteTint>('default');
  const [captureExpanded, setCaptureExpanded] = useState(false);

  // Mobile sheet state (only opens modal sheet on < lg screens when a note is selected)
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);

  const activeNotes = useMemo(
    () => notes.filter((n) => (showArchived ? n.archived : !n.archived)),
    [notes, showArchived]
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    activeNotes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [activeNotes]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeNotes
      .filter((n) => {
        if (notebookFilter !== 'All' && n.notebook !== notebookFilter) {
          return false;
        }
        if (tagFilter !== 'All' && !n.tags.includes(tagFilter)) {
          return false;
        }
        if (q) {
          const hit =
            n.title.toLowerCase().includes(q) ||
            n.body.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q));
          if (!hit) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [activeNotes, notebookFilter, tagFilter, searchQuery]);

  const selectedNote =
    notes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || null;

  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() && !quickBody.trim()) return;

    // Extract inline #hashtags automatically from quickBody
    const inlineTags = Array.from(
      new Set(
        (quickBody.match(/#([a-zA-Z0-9_-]+)/g) || []).map((t) =>
          t.slice(1).toLowerCase()
        )
      )
    );

    const created = onCreateNote({
      title: quickTitle.trim() || 'Quick Note',
      body: quickBody.trim(),
      notebook: quickNotebook,
      tags: inlineTags,
      tint: quickTint,
    });
    setQuickTitle('');
    setQuickBody('');
    setCaptureExpanded(false);
    onSelectNoteId(created.id);
  };

  const handleCardSelect = (id: string) => {
    onSelectNoteId(id);
    setMobileEditorOpen(true);
  };

  const archivedCount = notes.filter((n) => n.archived).length;
  const pinnedCount = notes.filter((n) => !n.archived && n.pinned).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-28 lg:pb-10 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#EFEFED] dark:border-[#2A2A2A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA]">
            Notes Studio
          </h1>
          <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
            {notes.filter((n) => !n.archived).length} evergreen notes ·{' '}
            {pinnedCount} pinned · {allTags.length} tags
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Archive Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowArchived((v) => !v);
              setTagFilter('All');
            }}
            className={`inline-flex items-center gap-1.5 px-3 min-h-[42px] rounded-xl border text-xs font-medium transition-colors whitespace-nowrap ${
              showArchived
                ? 'bg-[#37352F] text-white border-[#37352F] dark:bg-[#F0EFEA] dark:text-[#191919]'
                : 'bg-[#F7F6F3] dark:bg-[#242424] border-[#E9E9E7] dark:border-[#323232] text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
            }`}
          >
            <Archive className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="tabular-nums">
              Archive ({archivedCount})
            </span>
          </button>

          {/* Grid / List Layout Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#242424]">
            <button
              type="button"
              onClick={() => onChangeLayoutMode('grid')}
              aria-label="Card grid view"
              className={`min-w-[38px] min-h-[36px] flex items-center justify-center rounded-lg transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-[#333333] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChangeLayoutMode('list')}
              aria-label="Compact list view"
              className={`min-w-[38px] min-h-[36px] flex items-center justify-center rounded-lg transition-colors ${
                layoutMode === 'list'
                  ? 'bg-white dark:bg-[#333333] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774]'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Instant Zero-Friction Scratchpad Capture */}
      {!showArchived && (
        <form
          onSubmit={handleQuickCapture}
          className="rounded-2xl border border-[#E6E5E1] dark:border-[#2E2E2E] bg-[#FBFBFA] dark:bg-[#202020] p-3 sm:p-4 space-y-2.5"
        >
          {captureExpanded && (
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Note title (optional)..."
              className="w-full min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#191919] border border-[#EAE9E5] dark:border-[#2F2F2F] text-sm font-semibold text-[#37352F] dark:text-[#F0EFEA] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
            />
          )}

          <div className="flex items-start gap-2">
            <textarea
              rows={captureExpanded ? 3 : 1}
              value={quickBody}
              onFocus={() => setCaptureExpanded(true)}
              onChange={(e) => setQuickBody(e.target.value)}
              placeholder="Instant capture: jot a thought, #tag, or snippet..."
              className="flex-1 min-h-[44px] py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#191919] border border-[#EAE9E5] dark:border-[#2F2F2F] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] resize-none focus:outline-none focus:border-[#2383E2]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[#2383E2] text-white text-xs font-medium hover:bg-[#1B70C4] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Save note</span>
            </button>
          </div>

          {captureExpanded && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Notebook for quick note"
                  value={quickNotebook}
                  onChange={(e) => setQuickNotebook(e.target.value)}
                  className="min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#191919] border border-[#EAE9E5] dark:border-[#2F2F2F] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1]"
                >
                  {NOTE_NOTEBOOKS.map((nb) => (
                    <option key={nb} value={nb}>
                      {nb}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  {NOTE_TINTS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setQuickTint(t.id)}
                      aria-label={`Color ${t.label}`}
                      className="min-w-[30px] min-h-[36px] flex items-center justify-center"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border ${t.swatchClass} ${
                          quickTint === t.id ? 'ring-2 ring-[#2383E2]' : ''
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCaptureExpanded(false)}
                className="text-xs font-medium text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1] px-2 min-h-[36px]"
              >
                Collapse
              </button>
            </div>
          )}
        </form>
      )}

      {/* Search + Notebook + Tag Filters */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="w-4 h-4 text-[#9B9A97] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notes or #tags..."
              className="w-full min-h-[42px] pl-9 pr-3 rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E9E9E7] dark:border-[#323232] text-xs text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['All', ...NOTE_NOTEBOOKS].map((nb) => {
              const active = notebookFilter === nb;
              return (
                <button
                  key={nb}
                  type="button"
                  onClick={() => setNotebookFilter(nb)}
                  className={`px-3 min-h-[38px] rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#37352F] text-white dark:bg-[#F0EFEA] dark:text-[#191919]'
                      : 'bg-[#F4F3EF] dark:bg-[#242424] text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
                  }`}
                >
                  {nb}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag Strip */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[#787774] dark:text-[#9B9A97] shrink-0">
              Tags:
            </span>
            <button
              type="button"
              onClick={() => setTagFilter('All')}
              className={`px-2 min-h-[32px] rounded-lg whitespace-nowrap shrink-0 ${
                tagFilter === 'All'
                  ? 'font-semibold text-[#2383E2] dark:text-[#60A5FA]'
                  : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag === tagFilter ? 'All' : tag)}
                className={`px-2 min-h-[32px] rounded-lg whitespace-nowrap shrink-0 ${
                  tagFilter === tag
                    ? 'font-semibold text-[#2383E2] dark:text-[#60A5FA] bg-[#2383E2]/10 dark:bg-[#60A5FA]/15'
                    : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Responsive Split Studio: Note Cards (left/full) + Live Note Editor (right on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Note Cards Collection */}
        <div className="lg:col-span-6 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-[#E6E5E1] dark:border-[#2E2E2E]">
              <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1]">
                {showArchived ? 'Archive is empty' : 'No matching notes'}
              </p>
              <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97]">
                {showArchived
                  ? 'Archived notes will appear here.'
                  : 'Use the instant capture bar above or clear active filters.'}
              </p>
            </div>
          ) : (
            <div
              className={
                layoutMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                  : 'space-y-2'
              }
            >
              {filteredNotes.map((note) => {
                const tint =
                  NOTE_TINTS.find((t) => t.id === note.tint) || NOTE_TINTS[0];
                const isSelected = selectedNote?.id === note.id;
                const doneChecks = note.checklist.filter((c) => c.done).length;
                const totalChecks = note.checklist.length;
                const wordCount = note.body.trim()
                  ? note.body.trim().split(/\s+/).length
                  : 0;

                return (
                  <article
                    key={note.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardSelect(note.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardSelect(note.id);
                      }
                    }}
                    className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2383E2] ${tint.cardClass} ${
                      isSelected
                        ? 'ring-2 ring-[#2383E2] border-transparent'
                        : 'hover:border-[#C9C7C0] dark:hover:border-[#444442]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[15px] font-semibold text-[#37352F] dark:text-[#F0EFEA] line-clamp-1">
                        {note.title || 'Untitled Note'}
                      </h2>
                      {note.pinned && (
                        <Pin
                          className="w-3.5 h-3.5 text-[#2383E2] dark:text-[#60A5FA] shrink-0 mt-0.5"
                          aria-label="Pinned"
                        />
                      )}
                    </div>

                    {/* Unboxed Metadata */}
                    <div className="mt-1 text-[11px] text-[#787774] dark:text-[#9B9A97] tabular-nums truncate">
                      {note.notebook} · {wordCount}w
                      {totalChecks > 0 && ` · ${doneChecks}/${totalChecks} checks`}
                      {note.linkedNoteIds.length > 0 &&
                        ` · ${note.linkedNoteIds.length} linked`}
                    </div>

                    {layoutMode === 'grid' && (
                      <>
                        <p className="mt-2.5 text-xs text-[#5F5E5B] dark:text-[#B4B3AF] line-clamp-3 leading-relaxed whitespace-pre-line">
                          {note.body || 'Empty note — tap to write...'}
                        </p>

                        {/* Preview up to 2 checklist lines inside card */}
                        {note.checklist.length > 0 && (
                          <div className="mt-2.5 space-y-1">
                            {note.checklist.slice(0, 2).map((c) => (
                              <div
                                key={c.id}
                                className="flex items-center gap-1.5 text-[11px] text-[#5F5E5B] dark:text-[#A4A39E]"
                              >
                                <span
                                  className={`w-3 h-3 rounded-[3px] border flex items-center justify-center shrink-0 ${
                                    c.done
                                      ? 'bg-[#2383E2] border-[#2383E2] text-white'
                                      : 'border-[#B8B7B2] dark:border-[#525250]'
                                  }`}
                                >
                                  {c.done && <Check className="w-2 h-2 stroke-[3]" />}
                                </span>
                                <span
                                  className={`truncate ${
                                    c.done ? 'line-through opacity-60' : ''
                                  }`}
                                >
                                  {c.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {note.tags.length > 0 && (
                          <div className="mt-3 text-[11px] text-[#2383E2] dark:text-[#60A5FA] truncate">
                            {note.tags.map((t) => `#${t}`).join(' · ')}
                          </div>
                        )}
                      </>
                    )}

                    {/* 1-Click Share & Export Actions for Every Note */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 pt-2.5 border-t border-black/6 dark:border-white/8 flex items-center justify-between gap-1.5"
                    >
                      <a
                        href={getWhatsAppShareUrl(note)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Share "${note.title || 'Untitled Note'}" to WhatsApp`}
                        className="inline-flex items-center gap-1 px-2 min-h-[34px] rounded-lg text-[11px] font-medium text-[#15803D] dark:text-[#4ADE80] hover:bg-[#16A34A]/10 transition-colors whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>Share to WhatsApp</span>
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => downloadNoteAsTxt(note, notes)}
                          aria-label={`Download "${note.title || 'Untitled Note'}" as .txt`}
                          className="inline-flex items-center gap-1 px-2 min-h-[34px] rounded-lg text-[11px] font-medium text-[#5F5E5B] dark:text-[#A4A39E] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-black/5 dark:hover:bg-white/8 transition-colors whitespace-nowrap"
                        >
                          <FileDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>.txt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintNote(note)}
                          aria-label={`Print "${note.title || 'Untitled Note'}" as PDF`}
                          className="inline-flex items-center gap-1 px-2 min-h-[34px] rounded-lg text-[11px] font-medium text-[#5F5E5B] dark:text-[#A4A39E] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-black/5 dark:hover:bg-white/8 transition-colors whitespace-nowrap"
                        >
                          <Printer className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>Print PDF</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Embedded Live Note Studio Pane */}
        <div className="hidden lg:block lg:col-span-6 lg:sticky lg:top-20 lg:h-[calc(100vh-7.5rem)]">
          {selectedNote ? (
            <NoteEditorPanel
              note={selectedNote}
              allNotes={notes}
              onUpdate={onUpdateNote}
              onDelete={(id) => {
                onDeleteNote(id);
                onSelectNoteId(null);
              }}
              onSelectLinkedNote={(id) => onSelectNoteId(id)}
              onPrintNote={onPrintNote}
              onPromoteToTask={onPromoteToTask}
            />
          ) : (
            <div className="h-full rounded-2xl border border-dashed border-[#E6E5E1] dark:border-[#2E2E2E] flex items-center justify-center p-8 text-center">
              <div>
                <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1]">
                  Select a note to edit
                </p>
                <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97]">
                  Or capture a new note in the bar above.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Full-Height Bottom Sheet Editor */}
      {mobileEditorOpen && selectedNote && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex items-end bg-black/45 backdrop-blur-[2px]"
          onClick={() => setMobileEditorOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Edit note"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full h-[92vh] rounded-t-3xl overflow-hidden shadow-2xl"
          >
            <NoteEditorPanel
              note={selectedNote}
              allNotes={notes}
              isMobileSheet
              onClose={() => setMobileEditorOpen(false)}
              onUpdate={onUpdateNote}
              onDelete={(id) => {
                onDeleteNote(id);
                setMobileEditorOpen(false);
                onSelectNoteId(null);
              }}
              onSelectLinkedNote={(id) => onSelectNoteId(id)}
              onPrintNote={onPrintNote}
              onPromoteToTask={onPromoteToTask}
            />
          </div>
        </div>
      )}
    </div>
  );
}
