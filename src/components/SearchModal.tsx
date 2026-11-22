import { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckSquare, Clock, Search, StickyNote, X } from 'lucide-react';
import {
  CalendarEvent,
  JournalDay,
  NoteItem,
  TaskItem,
  WorkspacePage,
} from '../types/workspace';
import { formatEventTimeRange, formatReadableDate } from '../utils/dateUtils';
import { PageIcon } from './PageIcon';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  tasks: TaskItem[];
  notes: NoteItem[];
  pages: WorkspacePage[];
  journalDays: Record<string, JournalDay>;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTask: (task: TaskItem) => void;
  onSelectNote: (noteId: string) => void;
  onSelectPage: (pageId: string) => void;
  onSelectJournalDate: (dateIso: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  events,
  tasks,
  notes,
  pages,
  journalDays,
  onSelectEvent,
  onSelectTask,
  onSelectNote,
  onSelectPage,
  onSelectJournalDate,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      setQuery('');
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();

  const matchingPages = useMemo(() => {
    if (!q) return pages.slice(0, 4);
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.blocks.some((b) => b.content.toLowerCase().includes(q))
    );
  }, [pages, q]);

  const matchingTasks = useMemo(() => {
    if (!q) return tasks.slice(0, 4);
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
    );
  }, [tasks, q]);

  const matchingJournal = useMemo(() => {
    const days = Object.values(journalDays).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    if (!q) return days.slice(0, 3);
    return days.filter(
      (d) =>
        d.focusLine.toLowerCase().includes(q) ||
        d.date.includes(q) ||
        d.blocks.some((b) => b.content.toLowerCase().includes(q))
    );
  }, [journalDays, q]);

  const matchingNotes = useMemo(() => {
    const active = notes.filter((n) => !n.archived);
    if (!q) return active.slice(0, 4);
    return active.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.notebook.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, q]);

  const matchingEvents = useMemo(() => {
    if (!q) return events.slice(0, 4);
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [events, q]);

  if (!isOpen) return null;

  const hasResults =
    matchingEvents.length > 0 ||
    matchingNotes.length > 0 ||
    matchingPages.length > 0 ||
    matchingTasks.length > 0 ||
    matchingJournal.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 backdrop-blur-[2px] p-3 sm:pt-20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search workspace"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E6E5E1] dark:border-[#2F2F2F] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
          <Search className="w-4 h-4 text-[#787774] shrink-0" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, journal notes, or pages..."
            className="flex-1 min-h-[44px] bg-transparent text-[15px] text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {!hasResults && (
            <div className="py-10 text-center text-sm text-[#787774] dark:text-[#9B9A97]">
              No matching events, notes, tasks, journal entries, or pages found.
            </div>
          )}

          {matchingEvents.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97]">
                Events
              </div>
              <div className="space-y-0.5">
                {matchingEvents.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => {
                      onSelectEvent(e);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-2.5 min-h-[48px] rounded-xl text-left hover:bg-[#F7F6F3] dark:hover:bg-[#262626] transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#F4F3EF] dark:bg-[#2A2A2A] flex items-center justify-center text-[#2383E2] dark:text-[#60A5FA] shrink-0">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1] truncate">
                        {e.title}
                      </div>
                      <div className="text-xs text-[#787774] dark:text-[#9B9A97] truncate tabular-nums">
                        {formatReadableDate(e.date)} · {formatEventTimeRange(e)} ·{' '}
                        {e.category}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingNotes.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97]">
                Notes
              </div>
              <div className="space-y-0.5">
                {matchingNotes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      onSelectNote(n.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-2.5 min-h-[48px] rounded-xl text-left hover:bg-[#F7F6F3] dark:hover:bg-[#262626] transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#F4F3EF] dark:bg-[#2A2A2A] flex items-center justify-center text-[#37352F] dark:text-[#E6E5E1] shrink-0">
                      <StickyNote className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1] truncate">
                        {n.title || 'Untitled Note'}
                      </div>
                      <div className="text-xs text-[#787774] dark:text-[#9B9A97] truncate">
                        {n.notebook}
                        {n.tags.length > 0
                          ? ` · ${n.tags.map((t) => `#${t}`).join(' ')}`
                          : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingPages.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97]">
                Pages
              </div>
              <div className="space-y-0.5">
                {matchingPages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPage(p.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-2.5 min-h-[48px] rounded-xl text-left hover:bg-[#F7F6F3] dark:hover:bg-[#262626] transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#F4F3EF] dark:bg-[#2A2A2A] flex items-center justify-center text-[#37352F] dark:text-[#E6E5E1] shrink-0">
                      <PageIcon name={p.icon} className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1] truncate">
                        {p.title}
                      </div>
                      <div className="text-xs text-[#787774] dark:text-[#9B9A97] truncate">
                        {p.summary}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingTasks.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97]">
                Tasks
              </div>
              <div className="space-y-0.5">
                {matchingTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelectTask(t);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-2.5 min-h-[48px] rounded-xl text-left hover:bg-[#F7F6F3] dark:hover:bg-[#262626] transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#F4F3EF] dark:bg-[#2A2A2A] flex items-center justify-center text-[#787774] shrink-0">
                      <CheckSquare className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm font-medium truncate ${
                          t.completed
                            ? 'line-through text-[#9B9A97]'
                            : 'text-[#37352F] dark:text-[#E6E5E1]'
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="text-xs text-[#787774] dark:text-[#9B9A97] truncate">
                        {t.category} · {formatReadableDate(t.dueDate)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingJournal.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97]">
                Daily Journal
              </div>
              <div className="space-y-0.5">
                {matchingJournal.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => {
                      onSelectJournalDate(d.date);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-2.5 min-h-[48px] rounded-xl text-left hover:bg-[#F7F6F3] dark:hover:bg-[#262626] transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#F4F3EF] dark:bg-[#2A2A2A] flex items-center justify-center text-[#787774] shrink-0">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1] truncate">
                        {formatReadableDate(d.date)}
                      </div>
                      <div className="text-xs text-[#787774] dark:text-[#9B9A97] truncate">
                        {d.focusLine || 'Daily journal page'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
