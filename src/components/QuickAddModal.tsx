import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NoteTint, PageIconName, TaskPriority } from '../types/workspace';
import {
  COVER_PRESETS,
  NOTE_NOTEBOOKS,
  NOTE_TINTS,
  TASK_CATEGORIES,
  TODAY_ISO,
} from '../data/seedData';
import { PAGE_ICON_OPTIONS, PageIcon } from './PageIcon';

interface QuickAddModalProps {
  isOpen: boolean;
  initialMode?: 'task' | 'note' | 'page';
  defaultDate?: string;
  onClose: () => void;
  onCreateTask: (payload: {
    title: string;
    dueDate: string;
    priority: TaskPriority;
    category: string;
    notes: string;
  }) => void;
  onCreateNote: (payload: {
    title: string;
    body: string;
    notebook: string;
    tags: string[];
    tint: NoteTint;
  }) => void;
  onCreatePage: (payload: {
    title: string;
    icon: PageIconName;
    coverUrl?: string;
    summary: string;
  }) => void;
}

export function QuickAddModal({
  isOpen,
  initialMode = 'task',
  defaultDate = TODAY_ISO,
  onClose,
  onCreateTask,
  onCreateNote,
  onCreatePage,
}: QuickAddModalProps) {
  const [mode, setMode] = useState<'task' | 'note' | 'page'>(initialMode);
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState(TASK_CATEGORIES[0]);
  const [notes, setNotes] = useState('');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteNotebook, setNoteNotebook] = useState(NOTE_NOTEBOOKS[0]);
  const [noteTint, setNoteTint] = useState<NoteTint>('default');

  const [pageTitle, setPageTitle] = useState('');
  const [pageIcon, setPageIcon] = useState<PageIconName>('Feather');
  const [pageCover, setPageCover] = useState<string | undefined>(COVER_PRESETS[0].url);
  const [pageSummary, setPageSummary] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setDueDate(defaultDate);
    }
  }, [isOpen, initialMode, defaultDate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'task') {
      const trimmed = taskTitle.trim();
      if (!trimmed) return;
      onCreateTask({
        title: trimmed,
        dueDate,
        priority,
        category,
        notes: notes.trim(),
      });
      setTaskTitle('');
      setNotes('');
      onClose();
    } else if (mode === 'note') {
      if (!noteTitle.trim() && !noteBody.trim()) return;
      const inlineTags = Array.from(
        new Set(
          (noteBody.match(/#([a-zA-Z0-9_-]+)/g) || []).map((t) =>
            t.slice(1).toLowerCase()
          )
        )
      );
      onCreateNote({
        title: noteTitle.trim() || 'Quick Note',
        body: noteBody.trim(),
        notebook: noteNotebook,
        tags: inlineTags,
        tint: noteTint,
      });
      setNoteTitle('');
      setNoteBody('');
      onClose();
    } else {
      const trimmed = pageTitle.trim() || 'Untitled page';
      onCreatePage({
        title: trimmed,
        icon: pageIcon,
        coverUrl: pageCover,
        summary: pageSummary.trim() || 'New workspace page',
      });
      setPageTitle('');
      setPageSummary('');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create new item"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white dark:bg-[#1E1E1E] rounded-t-3xl sm:rounded-2xl border border-[#E6E5E1] dark:border-[#2F2F2F] shadow-2xl overflow-hidden"
      >
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#D8D7D3] dark:bg-[#3F3F3D]" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#262626]">
            <button
              type="button"
              onClick={() => setMode('task')}
              className={`px-3 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'task'
                  ? 'bg-white dark:bg-[#343434] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774] dark:text-[#9B9A97]'
              }`}
            >
              Task
            </button>
            <button
              type="button"
              onClick={() => setMode('note')}
              className={`px-3 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'note'
                  ? 'bg-white dark:bg-[#343434] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774] dark:text-[#9B9A97]'
              }`}
            >
              Note
            </button>
            <button
              type="button"
              onClick={() => setMode('page')}
              className={`px-3 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'page'
                  ? 'bg-white dark:bg-[#343434] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774] dark:text-[#9B9A97]'
              }`}
            >
              Page
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 pb-safe space-y-4">
          {mode === 'task' ? (
            <>
              <div>
                <label
                  htmlFor="quick-task-title"
                  className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                >
                  Task name
                </label>
                <input
                  id="quick-task-title"
                  type="text"
                  autoFocus
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="What needs your attention?"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-[15px] text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="quick-task-date"
                    className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                  >
                    Due date
                  </label>
                  <input
                    id="quick-task-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] tabular-nums focus:outline-none focus:border-[#2383E2]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="quick-task-cat"
                    className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                  >
                    List
                  </label>
                  <select
                    id="quick-task-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] focus:outline-none focus:border-[#2383E2]"
                  >
                    {TASK_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5">
                  Priority
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#262626]">
                  {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`min-h-[38px] rounded-lg text-xs font-medium capitalize transition-colors ${
                        priority === p
                          ? 'bg-white dark:bg-[#343434] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                          : 'text-[#787774] dark:text-[#9B9A97]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="quick-task-notes"
                  className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                >
                  Notes (optional)
                </label>
                <textarea
                  id="quick-task-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Context or helpful details..."
                  className="w-full p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] resize-none focus:outline-none focus:border-[#2383E2]"
                />
              </div>
            </>
          ) : mode === 'note' ? (
            <>
              <div>
                <label
                  htmlFor="quick-note-title"
                  className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                >
                  Note title
                </label>
                <input
                  id="quick-note-title"
                  type="text"
                  autoFocus
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Idea, snippet, or topic..."
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-[15px] text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <label
                  htmlFor="quick-note-body"
                  className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                >
                  Content (use #tags inline)
                </label>
                <textarea
                  id="quick-note-body"
                  rows={4}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Capture thoughts freely... #ideas #reference"
                  className="w-full p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] resize-none focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <label
                    htmlFor="quick-note-notebook"
                    className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1"
                  >
                    Notebook
                  </label>
                  <select
                    id="quick-note-notebook"
                    value={noteNotebook}
                    onChange={(e) => setNoteNotebook(e.target.value)}
                    className="min-h-[40px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1]"
                  >
                    {NOTE_NOTEBOOKS.map((nb) => (
                      <option key={nb} value={nb}>
                        {nb}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1">
                    Paper tint
                  </span>
                  <div className="flex items-center gap-1.5 min-h-[40px]">
                    {NOTE_TINTS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNoteTint(t.id)}
                        aria-label={`Select ${t.label} paper`}
                        className="min-w-[32px] min-h-[36px] flex items-center justify-center"
                      >
                        <span
                          className={`w-5 h-5 rounded-full border ${t.swatchClass} ${
                            noteTint === t.id ? 'ring-2 ring-[#2383E2]' : ''
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="quick-page-title"
                  className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                >
                  Page title
                </label>
                <input
                  id="quick-page-title"
                  type="text"
                  autoFocus
                  required
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="e.g. December Reflections"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-[15px] text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5">
                  Page icon
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {PAGE_ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setPageIcon(opt.name)}
                      className={`flex items-center justify-center gap-1.5 min-h-[44px] px-2 rounded-xl border text-xs font-medium transition-colors ${
                        pageIcon === opt.name
                          ? 'border-[#2383E2] bg-[#2383E2]/10 dark:bg-[#60A5FA]/15 text-[#2383E2] dark:text-[#60A5FA]'
                          : 'border-[#E9E9E7] dark:border-[#323232] text-[#787774] dark:text-[#9B9A97]'
                      }`}
                    >
                      <PageIcon name={opt.name} className="w-4 h-4 shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5">
                  Cover banner
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {COVER_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPageCover(preset.url)}
                      className={`min-h-[44px] rounded-xl overflow-hidden border-2 transition-all ${
                        pageCover === preset.url
                          ? 'border-[#2383E2]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      aria-label={`Select ${preset.label} cover`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-11 object-cover"
                      />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPageCover(undefined)}
                    className={`min-h-[44px] rounded-xl border text-xs font-medium ${
                      !pageCover
                        ? 'border-[#2383E2] bg-[#2383E2]/10 dark:bg-[#60A5FA]/15 text-[#2383E2] dark:text-[#60A5FA]'
                        : 'border-[#E9E9E7] dark:border-[#323232] text-[#787774] dark:text-[#9B9A97]'
                    }`}
                  >
                    None
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="quick-page-summary"
                  className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                >
                  Short description
                </label>
                <input
                  id="quick-page-summary"
                  type="text"
                  value={pageSummary}
                  onChange={(e) => setPageSummary(e.target.value)}
                  placeholder="What belongs in this page?"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#2383E2] text-white text-sm font-medium hover:bg-[#1B70C4] active:scale-[0.99] transition-all"
          >
            {mode === 'task'
              ? 'Add Task'
              : mode === 'note'
                ? 'Save Note'
                : 'Create Page'}
          </button>
        </form>
      </div>
    </div>
  );
}
