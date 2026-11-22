import { useEffect, useState } from 'react';
import {
  BookMarked,
  Calendar,
  CalendarDays,
  CheckSquare,
  Menu,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  StickyNote,
  Sun,
} from 'lucide-react';
import {
  ActiveTab,
  CalendarEvent,
  JournalDay,
  NoteItem,
  NoteTint,
  PageIconName,
  TaskItem,
  TaskPriority,
  WorkspacePage,
} from './types/workspace';
import {
  INITIAL_EVENTS,
  INITIAL_JOURNAL_DAYS,
  INITIAL_NOTES,
  INITIAL_PAGES,
  INITIAL_TASKS,
  TODAY_ISO,
} from './data/seedData';
import { formatShortDate, generateId } from './utils/dateUtils';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { CalendarView } from './components/CalendarView';
import { TasksView } from './components/TasksView';
import { NotesView } from './components/NotesView';
import { JournalView } from './components/JournalView';
import { PagesView } from './components/PagesView';
import { PageDetailView } from './components/PageDetailView';
import { TaskInspectorSheet } from './components/TaskInspectorSheet';
import { EventModalSheet } from './components/EventModalSheet';
import { QuickAddModal } from './components/QuickAddModal';
import { SearchModal } from './components/SearchModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { PrintableNoteSheet } from './components/PrintableNoteSheet';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';

interface WorkspaceSettings {
  activeTab: ActiveTab;
  selectedDate: string;
  selectedPageId: string | null;
  selectedNoteId: string | null;
  notesLayoutMode: 'grid' | 'list';
  calendarViewMode: 'month' | 'week';
  weekStartsOnMonday: boolean;
  tasksSortBy: 'priority' | 'dueDate';
}

const STORAGE_KEYS = {
  events: 'waynote_events_v1',
  tasks: 'waynote_tasks_v1',
  notes: 'waynote_notes_v1',
  journal: 'waynote_journal_v1',
  pages: 'waynote_pages_v1',
  theme: 'waynote_theme_v1',
  settings: 'waynote_settings_v1',
};

const DEFAULT_SETTINGS: WorkspaceSettings = {
  activeTab: 'today',
  selectedDate: TODAY_ISO,
  selectedPageId: null,
  selectedNoteId: INITIAL_NOTES[0]?.id || null,
  notesLayoutMode: 'grid',
  calendarViewMode: 'month',
  weekStartsOnMonday: false,
  tasksSortBy: 'dueDate',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    loadStored(STORAGE_KEYS.events, INITIAL_EVENTS)
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    loadStored(STORAGE_KEYS.tasks, INITIAL_TASKS)
  );
  const [notes, setNotes] = useState<NoteItem[]>(() =>
    loadStored(STORAGE_KEYS.notes, INITIAL_NOTES)
  );
  const [journalDays, setJournalDays] = useState<Record<string, JournalDay>>(() =>
    loadStored(STORAGE_KEYS.journal, INITIAL_JOURNAL_DAYS)
  );
  const [pages, setPages] = useState<WorkspacePage[]>(() =>
    loadStored(STORAGE_KEYS.pages, INITIAL_PAGES)
  );
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.theme);
      if (raw !== null) return JSON.parse(raw) === true;
      return (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches === true
      );
    } catch {
      return false;
    }
  });

  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    const saved = loadStored<Partial<WorkspaceSettings>>(
      STORAGE_KEYS.settings,
      {}
    );
    return { ...DEFAULT_SETTINGS, ...saved };
  });

  const activeTab = settings.activeTab;
  const selectedDate = settings.selectedDate;
  const selectedPageId =
    settings.selectedPageId &&
    pages.some((p) => p.id === settings.selectedPageId)
      ? settings.selectedPageId
      : null;
  const selectedNoteId =
    settings.selectedNoteId &&
    notes.some((n) => n.id === settings.selectedNoteId)
      ? settings.selectedNoteId
      : notes[0]?.id || null;

  const setActiveTab = (tab: ActiveTab) =>
    setSettings((s) => ({ ...s, activeTab: tab }));
  const setSelectedDate = (date: string) =>
    setSettings((s) => ({ ...s, selectedDate: date }));
  const setSelectedPageId = (pageId: string | null) =>
    setSettings((s) => ({ ...s, selectedPageId: pageId }));
  const setSelectedNoteId = (noteId: string | null) =>
    setSettings((s) => ({ ...s, selectedNoteId: noteId }));

  const [inspectedTaskId, setInspectedTaskId] = useState<string | null>(null);
  const [eventSheetState, setEventSheetState] = useState<{
    open: boolean;
    editingEvent: CalendarEvent | null;
    defaultDate: string;
  }>({ open: false, editingEvent: null, defaultDate: TODAY_ISO });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState<boolean>(
    () => typeof window !== 'undefined' && window.location.pathname === '/privacy'
  );
  const [printableNote, setPrintableNote] = useState<NoteItem | null>(null);
  const [quickAddState, setQuickAddState] = useState<{
    open: boolean;
    mode: 'task' | 'note' | 'page';
  }>({ open: false, mode: 'task' });

  const [undoToast, setUndoToast] = useState<{
    label: string;
    restore: () => void;
  } | null>(null);

  // Sync theme to documentElement & theme-color meta tag
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', darkMode ? '#191919' : '#FFFFFF');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(darkMode));
    } catch {
      // ignore storage quota errors
    }
  }, [darkMode]);

  // Persist workspace settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Sync /privacy route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setPrivacyOpen(window.location.pathname === '/privacy');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openPrivacyModal = () => {
    setPrivacyOpen(true);
    if (window.location.pathname !== '/privacy') {
      window.history.pushState({ modal: 'privacy' }, '', '/privacy');
    }
  };

  const closePrivacyModal = () => {
    setPrivacyOpen(false);
    if (window.location.pathname === '/privacy') {
      window.history.pushState({}, '', '/');
    }
  };

  const handlePrintNote = (note: NoteItem) => {
    setPrintableNote(note);
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        window.print();
      }, 40);
    });
  };

  // Persist workspace state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.journal, JSON.stringify(journalDays));
    } catch {
      // ignore
    }
  }, [journalDays]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.pages, JSON.stringify(pages));
    } catch {
      // ignore
    }
  }, [pages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
    } catch {
      // ignore
    }
  }, [events]);

  // Cmd/Ctrl+K search shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Auto-dismiss undo toast
  useEffect(() => {
    if (!undoToast) return;
    const timer = window.setTimeout(() => setUndoToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [undoToast]);

  const activeJournalDay: JournalDay = journalDays[selectedDate] || {
    date: selectedDate,
    tone: 'Grounded',
    focusLine: '',
    blocks: [],
  };

  const selectedPage = pages.find((p) => p.id === selectedPageId) || null;
  const inspectedTask = tasks.find((t) => t.id === inspectedTaskId) || null;
  const activeTaskCount = tasks.filter((t) => !t.completed).length;
  const activeNoteCount = notes.filter((n) => !n.archived).length;

  const handleUpdateJournalDay = (date: string, patch: Partial<JournalDay>) => {
    setJournalDays((prev) => {
      const existing: JournalDay = prev[date] || {
        date,
        tone: 'Grounded',
        focusLine: '',
        blocks: [],
      };
      return {
        ...prev,
        [date]: { ...existing, ...patch },
      };
    });
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleUpdateTask = (updated: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTask = (id: string) => {
    const removed = tasks.find((t) => t.id === id);
    if (!removed) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setUndoToast({
      label: `Deleted "${removed.title}"`,
      restore: () => {
        setTasks((prev) => [removed, ...prev]);
        setUndoToast(null);
      },
    });
  };

  const handleCreateTask = (payload: {
    title: string;
    dueDate: string;
    priority: TaskPriority;
    category: string;
    notes: string;
  }) => {
    const created: TaskItem = {
      id: generateId('task'),
      title: payload.title,
      completed: false,
      dueDate: payload.dueDate,
      priority: payload.priority,
      category: payload.category,
      notes: payload.notes,
      subtasks: [],
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [created, ...prev]);
  };

  const handleClearCompleted = () => {
    const snapshot = tasks;
    const completedTotal = tasks.filter((t) => t.completed).length;
    if (completedTotal === 0) return;
    setTasks((prev) => prev.filter((t) => !t.completed));
    setUndoToast({
      label: `Cleared ${completedTotal} completed task${completedTotal > 1 ? 's' : ''}`,
      restore: () => {
        setTasks(snapshot);
        setUndoToast(null);
      },
    });
  };

  const handleCreatePage = (payload: {
    title: string;
    icon: PageIconName;
    coverUrl?: string;
    summary: string;
  }) => {
    const created: WorkspacePage = {
      id: generateId('page'),
      title: payload.title,
      icon: payload.icon,
      coverUrl: payload.coverUrl,
      fontStyle: 'sans',
      updatedAt: TODAY_ISO,
      summary: payload.summary,
      blocks: [
        {
          id: generateId('blk'),
          type: 'text',
          content: '',
        },
      ],
    };
    setPages((prev) => [created, ...prev]);
    setSelectedPageId(created.id);
    setActiveTab('pages');
  };

  const handleUpdatePage = (updated: WorkspacePage) => {
    setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePage = (pageId: string) => {
    const removed = pages.find((p) => p.id === pageId);
    if (!removed) return;
    setPages((prev) => prev.filter((p) => p.id !== pageId));
    setSelectedPageId(null);
    setUndoToast({
      label: `Deleted "${removed.title}"`,
      restore: () => {
        setPages((prev) => [removed, ...prev]);
        setUndoToast(null);
      },
    });
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setSelectedPageId(null);
    setActiveTab(tab);
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    setActiveTab('pages');
  };

  const handleCreateNote = (payload: {
    title: string;
    body: string;
    notebook: string;
    tags: string[];
    tint: NoteTint;
  }): NoteItem => {
    const now = new Date().toISOString();
    const created: NoteItem = {
      id: generateId('note'),
      title: payload.title,
      body: payload.body,
      notebook: payload.notebook,
      tags: payload.tags,
      tint: payload.tint,
      pinned: false,
      archived: false,
      checklist: [],
      linkedNoteIds: [],
      updatedAt: now,
      createdAt: now,
    };
    setNotes((prev) => [created, ...prev]);
    setSelectedNoteId(created.id);
    return created;
  };

  const handleUpdateNote = (updated: NoteItem) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNote = (id: string) => {
    const removed = notes.find((n) => n.id === id);
    if (!removed) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setUndoToast({
      label: `Deleted "${removed.title || 'Untitled Note'}"`,
      restore: () => {
        setNotes((prev) => [removed, ...prev]);
        setSelectedNoteId(removed.id);
        setUndoToast(null);
      },
    });
  };

  const handleSelectNoteFromSearch = (noteId: string) => {
    setSelectedPageId(null);
    setSelectedNoteId(noteId);
    setActiveTab('notes');
  };

  const handleSaveEvent = (saved: CalendarEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === saved.id);
      if (exists) {
        return prev.map((e) => (e.id === saved.id ? saved : e));
      }
      return [saved, ...prev];
    });
    setSelectedDate(saved.date);
  };

  const handleDeleteEvent = (id: string) => {
    const removed = events.find((e) => e.id === id);
    if (!removed) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setUndoToast({
      label: `Deleted event "${removed.title}"`,
      restore: () => {
        setEvents((prev) => [removed, ...prev]);
        setUndoToast(null);
      },
    });
  };

  const handleOpenJournalDate = (dateIso: string) => {
    setSelectedPageId(null);
    setSelectedDate(dateIso);
    setActiveTab('today');
  };

  // Current view title for mobile header & desktop breadcrumb
  const currentTitle = selectedPage
    ? selectedPage.title || 'Untitled'
    : activeTab === 'today'
      ? formatShortDate(selectedDate)
      : activeTab === 'calendar'
        ? 'Calendar'
        : activeTab === 'tasks'
          ? 'Tasks'
          : activeTab === 'notes'
            ? 'Notes'
            : activeTab === 'journal'
              ? 'Journey Log'
              : 'Pages';

  const mobileTabs: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: <StickyNote className="w-5 h-5" />,
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: <BookMarked className="w-5 h-5" />,
    },
  ];

  return (
    <>
      <div className="no-print min-h-screen flex bg-[#FFFFFF] dark:bg-[#191919] text-[#37352F] dark:text-[#E6E5E1]">
        {/* Left Sidebar (Desktop) & Drawer (Mobile) */}
        <Sidebar
          activeTab={activeTab}
          selectedPageId={selectedPageId}
          pages={pages}
          activeTaskCount={activeTaskCount}
          activeNoteCount={activeNoteCount}
          darkMode={darkMode}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onSelectTab={handleSelectTab}
          onSelectPage={handleSelectPage}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenQuickAddPage={() => setQuickAddState({ open: true, mode: 'page' })}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onOpenPrivacy={openPrivacyModal}
        />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Top App Bar (48px height, sticky) */}
        <header className="lg:hidden sticky top-0 z-30 h-12 px-2 flex items-center justify-between bg-white/90 dark:bg-[#191919]/90 backdrop-blur-md border-b border-[#EFEFED] dark:border-[#282828]">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open workspace menu"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#262626]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-sm font-semibold tracking-tight truncate max-w-[55%]">
            {currentTitle}
          </span>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={darkMode}
              title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] dark:text-[#A4A39E] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#262626] transition-colors"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-[#EAB308]" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search workspace"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] dark:text-[#A4A39E] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'calendar' && !selectedPage) {
                  setEventSheetState({
                    open: true,
                    editingEvent: null,
                    defaultDate: selectedDate,
                  });
                } else {
                  setQuickAddState({
                    open: true,
                    mode:
                      activeTab === 'pages' && !selectedPage
                        ? 'page'
                        : activeTab === 'notes'
                          ? 'note'
                          : 'task',
                  });
                }
              }}
              aria-label="Quick add"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#2383E2] dark:text-[#60A5FA] hover:bg-[#2383E2]/10"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Desktop Top Breadcrumb Bar */}
        <header className="hidden lg:flex sticky top-0 z-30 h-14 px-8 items-center justify-between gap-8 bg-white/85 dark:bg-[#191919]/85 backdrop-blur-md border-b border-[#EFEFED] dark:border-[#282828]">
          <div className="flex items-center gap-2 text-xs text-[#787774] dark:text-[#9B9A97] min-w-0">
            <button
              type="button"
              onClick={() => handleSelectTab('today')}
              className="hover:text-[#37352F] dark:hover:text-[#E6E5E1] transition-colors whitespace-nowrap shrink-0"
            >
              Waynote
            </button>
            <span aria-hidden="true">/</span>
            {selectedPage ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectTab('pages')}
                  className="hover:text-[#37352F] dark:hover:text-[#E6E5E1] transition-colors whitespace-nowrap shrink-0"
                >
                  Pages
                </button>
                <span aria-hidden="true">/</span>
                <span className="font-medium text-[#37352F] dark:text-[#E6E5E1] truncate">
                  {selectedPage.title || 'Untitled'}
                </span>
              </>
            ) : (
              <span className="font-medium text-[#37352F] dark:text-[#E6E5E1] whitespace-nowrap shrink-0">
                {currentTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton variant="topbar" />
            <button
              type="button"
              onClick={openPrivacyModal}
              aria-label="Privacy Policy"
              title="Privacy Policy"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 min-h-[38px] rounded-xl text-xs font-medium text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#F7F6F3] dark:hover:bg-[#242424] transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Privacy</span>
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={darkMode}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E6E5E1] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#EFEFED] dark:hover:bg-[#2E2E2E] transition-colors whitespace-nowrap shrink-0"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#EAB308]" aria-hidden="true" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#5F5E5B]" aria-hidden="true" />
                  <span>Dark</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'calendar' && !selectedPage) {
                  setEventSheetState({
                    open: true,
                    editingEvent: null,
                    defaultDate: selectedDate,
                  });
                } else {
                  setQuickAddState({
                    open: true,
                    mode:
                      activeTab === 'pages' && !selectedPage
                        ? 'page'
                        : activeTab === 'notes'
                          ? 'note'
                          : 'task',
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-xl bg-[#2383E2] text-white text-xs font-medium hover:bg-[#1B70C4] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick add</span>
            </button>
          </div>
        </header>

        {/* Active View Content */}
        <main className="flex-1 min-w-0">
          {selectedPage ? (
            <PageDetailView
              page={selectedPage}
              onBack={() => setSelectedPageId(null)}
              onUpdatePage={handleUpdatePage}
              onDeletePage={handleDeletePage}
            />
          ) : activeTab === 'today' ? (
            <TodayView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={events}
              tasks={tasks}
              journalDay={activeJournalDay}
              onUpdateJournalDay={handleUpdateJournalDay}
              onSelectEvent={(evt) =>
                setEventSheetState({
                  open: true,
                  editingEvent: evt,
                  defaultDate: evt.date,
                })
              }
              onOpenNewEvent={(iso) =>
                setEventSheetState({
                  open: true,
                  editingEvent: null,
                  defaultDate: iso,
                })
              }
              onToggleTask={handleToggleTask}
              onSelectTask={(t) => setInspectedTaskId(t.id)}
              onQuickAddTask={handleCreateTask}
              onOpenCalendar={() => handleSelectTab('calendar')}
            />
          ) : activeTab === 'calendar' ? (
            <CalendarView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              viewMode={settings.calendarViewMode}
              onChangeViewMode={(mode) =>
                setSettings((s) => ({ ...s, calendarViewMode: mode }))
              }
              weekStartsOnMonday={settings.weekStartsOnMonday}
              onToggleWeekStart={() =>
                setSettings((s) => ({
                  ...s,
                  weekStartsOnMonday: !s.weekStartsOnMonday,
                }))
              }
              events={events}
              tasks={tasks}
              journalDays={journalDays}
              onSelectEvent={(evt) =>
                setEventSheetState({
                  open: true,
                  editingEvent: evt,
                  defaultDate: evt.date,
                })
              }
              onOpenNewEvent={(iso) =>
                setEventSheetState({
                  open: true,
                  editingEvent: null,
                  defaultDate: iso,
                })
              }
              onToggleTask={handleToggleTask}
              onSelectTask={(t) => setInspectedTaskId(t.id)}
              onQuickAddTask={handleCreateTask}
              onOpenDayInToday={handleOpenJournalDate}
            />
          ) : activeTab === 'tasks' ? (
            <TasksView
              tasks={tasks}
              sortBy={settings.tasksSortBy}
              onChangeSortBy={(sort) =>
                setSettings((s) => ({ ...s, tasksSortBy: sort }))
              }
              onToggleTask={handleToggleTask}
              onSelectTask={(t) => setInspectedTaskId(t.id)}
              onQuickAddTask={handleCreateTask}
              onClearCompleted={handleClearCompleted}
            />
          ) : activeTab === 'notes' ? (
            <NotesView
              notes={notes}
              selectedNoteId={selectedNoteId}
              layoutMode={settings.notesLayoutMode}
              onChangeLayoutMode={(mode) =>
                setSettings((s) => ({ ...s, notesLayoutMode: mode }))
              }
              onSelectNoteId={setSelectedNoteId}
              onCreateNote={handleCreateNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onPrintNote={handlePrintNote}
              onPromoteToTask={(payload) => {
                handleCreateTask(payload);
                setUndoToast({
                  label: `Added task "${payload.title}"`,
                  restore: () => {
                    setActiveTab('tasks');
                    setUndoToast(null);
                  },
                });
              }}
            />
          ) : activeTab === 'journal' ? (
            <JournalView
              journalDays={journalDays}
              tasks={tasks}
              onOpenDate={handleOpenJournalDate}
            />
          ) : (
            <PagesView
              pages={pages}
              onSelectPage={handleSelectPage}
              onOpenNewPage={() => setQuickAddState({ open: true, mode: 'page' })}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Tab Bar (56px height, total sticky mobile bars = 104px <= 15% viewport) */}
      <nav
        aria-label="Primary mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#191919]/95 backdrop-blur-md border-t border-[#E9E9E7] dark:border-[#2C2C2C] pb-safe"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {mobileTabs.map((tab) => {
            const isActive = activeTab === tab.id && !selectedPageId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  isActive
                    ? 'text-[#2383E2] dark:text-[#60A5FA]'
                    : 'text-[#787774] dark:text-[#8E8D89] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
                }`}
              >
                {tab.icon}
                <span className="mt-0.5 text-[10px] font-medium tracking-tight leading-none whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Task Inspector Sheet / Drawer */}
      <TaskInspectorSheet
        task={inspectedTask}
        onClose={() => setInspectedTaskId(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      {/* Event Create & Customize Sheet */}
      <EventModalSheet
        isOpen={eventSheetState.open}
        editingEvent={eventSheetState.editingEvent}
        defaultDate={eventSheetState.defaultDate}
        onClose={() =>
          setEventSheetState((s) => ({ ...s, open: false, editingEvent: null }))
        }
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddState.open}
        initialMode={quickAddState.mode}
        defaultDate={selectedDate}
        onClose={() => setQuickAddState((s) => ({ ...s, open: false }))}
        onCreateTask={handleCreateTask}
        onCreateNote={handleCreateNote}
        onCreatePage={handleCreatePage}
      />

      {/* Workspace Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        events={events}
        tasks={tasks}
        notes={notes}
        pages={pages}
        journalDays={journalDays}
        onSelectEvent={(evt) =>
          setEventSheetState({
            open: true,
            editingEvent: evt,
            defaultDate: evt.date,
          })
        }
        onSelectTask={(t) => setInspectedTaskId(t.id)}
        onSelectNote={handleSelectNoteFromSearch}
        onSelectPage={handleSelectPage}
        onSelectJournalDate={handleOpenJournalDate}
      />

      {/* Privacy Policy Modal (/privacy) */}
      <PrivacyPolicyModal
        isOpen={privacyOpen}
        onClose={closePrivacyModal}
        stats={{
          notesCount: notes.length,
          tasksCount: tasks.length,
          eventsCount: events.length,
          pagesCount: pages.length,
          journalCount: Object.keys(journalDays).length,
        }}
      />

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Undo Toast */}
      {undoToast && (
        <div className="fixed bottom-18 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] shadow-xl">
          <span className="text-xs font-medium truncate">{undoToast.label}</span>
          <button
            type="button"
            onClick={undoToast.restore}
            className="text-xs font-semibold text-[#60A5FA] dark:text-[#2383E2] px-2 min-h-[36px] whitespace-nowrap shrink-0"
          >
            Undo
          </button>
        </div>
      )}
      </div>

      {/* Print-only PDF Export Surface */}
      <PrintableNoteSheet
        note={printableNote || notes.find((n) => n.id === selectedNoteId) || null}
        allNotes={notes}
      />
    </>
  );
}
