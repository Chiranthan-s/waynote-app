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
  EventColor,
  FocusDayLog,
  HabitCadence,
  HabitItem,
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
  INITIAL_FOCUS_LOGS,
  INITIAL_HABITS,
  INITIAL_JOURNAL_DAYS,
  INITIAL_NOTES,
  INITIAL_PAGES,
  INITIAL_TASKS,
} from './data/seedData';
import { formatShortDate, generateId, getTodayIso } from './utils/dateUtils';
import { isHabitScheduledOnDate } from './utils/habitUtils';
import {
  downloadWaynoteBackup,
  parseAndValidateWaynoteBackup,
} from './utils/backup';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { CalendarView } from './components/CalendarView';
import { TasksView } from './components/TasksView';
import { NotesView } from './components/NotesView';
import { JournalView } from './components/JournalView';
import {
  FOCUS_PRESETS,
  FocusHabitsView,
  FocusPresetId,
} from './components/FocusHabitsView';
import { PagesView } from './components/PagesView';
import { PageDetailView } from './components/PageDetailView';
import { TaskInspectorSheet } from './components/TaskInspectorSheet';
import { EventModalSheet } from './components/EventModalSheet';
import { QuickAddModal } from './components/QuickAddModal';
import { SearchModal } from './components/SearchModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { AboutSupportModal } from './components/AboutSupportModal';
import { ResetWorkspaceModal } from './components/ResetWorkspaceModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { PrintableNoteSheet } from './components/PrintableNoteSheet';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';

function playFocusChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.14, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };
    playTone(587.33, now, 0.35);
    playTone(880, now + 0.16, 0.55);
  } catch {
    // ignore Web Audio restrictions
  }
}

interface WorkspaceSettings {
  activeTab: ActiveTab;
  selectedDate: string;
  lastTodayIso?: string;
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
  habits: 'waynote_habits_v1',
  focusLogs: 'waynote_focus_v1',
  theme: 'waynote_theme_v1',
  settings: 'waynote_settings_v1',
  sampleCleared: 'waynote_sample_cleared_v1',
};

const DEFAULT_SETTINGS: WorkspaceSettings = {
  activeTab: 'today',
  selectedDate: getTodayIso(),
  lastTodayIso: getTodayIso(),
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

function isSampleDataCleared(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.sampleCleared) === 'true';
  } catch {
    return false;
  }
}

export default function App() {
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    loadStored(
      STORAGE_KEYS.events,
      isSampleDataCleared() ? [] : INITIAL_EVENTS
    )
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    loadStored(STORAGE_KEYS.tasks, isSampleDataCleared() ? [] : INITIAL_TASKS)
  );
  const [notes, setNotes] = useState<NoteItem[]>(() =>
    loadStored(STORAGE_KEYS.notes, isSampleDataCleared() ? [] : INITIAL_NOTES)
  );
  const [journalDays, setJournalDays] = useState<Record<string, JournalDay>>(() =>
    loadStored(
      STORAGE_KEYS.journal,
      isSampleDataCleared() ? {} : INITIAL_JOURNAL_DAYS
    )
  );
  const [pages, setPages] = useState<WorkspacePage[]>(() =>
    loadStored(STORAGE_KEYS.pages, isSampleDataCleared() ? [] : INITIAL_PAGES)
  );
  const [habits, setHabits] = useState<HabitItem[]>(() =>
    loadStored(STORAGE_KEYS.habits, isSampleDataCleared() ? [] : INITIAL_HABITS)
  );
  const [focusLogs, setFocusLogs] = useState<Record<string, FocusDayLog>>(() =>
    loadStored(
      STORAGE_KEYS.focusLogs,
      isSampleDataCleared() ? {} : INITIAL_FOCUS_LOGS
    )
  );
  const [timerState, setTimerState] = useState<{
    presetId: FocusPresetId;
    secondsLeft: number;
    totalSeconds: number;
    isRunning: boolean;
    linkedTaskId: string;
    soundEnabled: boolean;
  }>({
    presetId: 'focus25',
    secondsLeft: 25 * 60,
    totalSeconds: 25 * 60,
    isRunning: false,
    linkedTaskId: '',
    soundEnabled: true,
  });
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

  const [todayIso, setTodayIso] = useState<string>(() => getTodayIso());

  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    const liveToday = getTodayIso();
    const saved = loadStored<Partial<WorkspaceSettings>>(
      STORAGE_KEYS.settings,
      {}
    );
    const isNewDay = !saved.lastTodayIso || saved.lastTodayIso !== liveToday;
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      selectedDate: isNewDay ? liveToday : saved.selectedDate || liveToday,
      lastTodayIso: liveToday,
    };
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
    setSettings((s) => ({ ...s, selectedDate: date, lastTodayIso: todayIso }));
  const setSelectedPageId = (pageId: string | null) =>
    setSettings((s) => ({ ...s, selectedPageId: pageId }));
  const setSelectedNoteId = (noteId: string | null) =>
    setSettings((s) => ({ ...s, selectedNoteId: noteId }));

  const [inspectedTaskId, setInspectedTaskId] = useState<string | null>(null);
  const [eventSheetState, setEventSheetState] = useState<{
    open: boolean;
    editingEvent: CalendarEvent | null;
    defaultDate: string;
  }>(() => ({ open: false, editingEvent: null, defaultDate: getTodayIso() }));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState<boolean>(
    () => typeof window !== 'undefined' && window.location.pathname === '/privacy'
  );
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [printableNote, setPrintableNote] = useState<NoteItem | null>(null);
  const [quickAddState, setQuickAddState] = useState<{
    open: boolean;
    mode: 'task' | 'note' | 'page';
  }>({ open: false, mode: 'task' });

  const [undoToast, setUndoToast] = useState<{
    label: string;
    restore?: () => void;
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

  // Automatically advance live date across local midnight and when returning to the app
  useEffect(() => {
    let midnightTimer: number | undefined;

    const syncToday = () => {
      const liveToday = getTodayIso();
      setTodayIso((prevToday) => {
        if (prevToday === liveToday) return prevToday;
        setSettings((s) => ({
          ...s,
          lastTodayIso: liveToday,
          selectedDate:
            s.selectedDate === prevToday ? liveToday : s.selectedDate,
        }));
        return liveToday;
      });
    };

    const scheduleMidnightCheck = () => {
      if (midnightTimer !== undefined) {
        window.clearTimeout(midnightTimer);
      }
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        150
      );
      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());
      midnightTimer = window.setTimeout(() => {
        syncToday();
        scheduleMidnightCheck();
      }, msUntilMidnight);
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'hidden') return;
      syncToday();
      scheduleMidnightCheck();
    };

    syncToday();
    scheduleMidnightCheck();
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      if (midnightTimer !== undefined) {
        window.clearTimeout(midnightTimer);
      }
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

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

  const handleStartFresh = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.sampleCleared, 'true');
      localStorage.setItem(STORAGE_KEYS.events, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.journal, JSON.stringify({}));
      localStorage.setItem(STORAGE_KEYS.pages, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.focusLogs, JSON.stringify({}));
    } catch {
      // ignore storage quota errors
    }

    setEvents([]);
    setTasks([]);
    setNotes([]);
    setJournalDays({});
    setPages([]);
    setHabits([]);
    setFocusLogs({});
    setInspectedTaskId(null);
    setPrintableNote(null);
    setUndoToast(null);
    setSettings((s) => ({
      ...s,
      selectedPageId: null,
      selectedNoteId: null,
    }));
    setResetModalOpen(false);
    if (privacyOpen) closePrivacyModal();
  };

  const handleExportBackup = () => {
    downloadWaynoteBackup({
      tasks: loadStored(STORAGE_KEYS.tasks, tasks),
      events: loadStored(STORAGE_KEYS.events, events),
      notes: loadStored(STORAGE_KEYS.notes, notes),
      pages: loadStored(STORAGE_KEYS.pages, pages),
      journalDays: loadStored(STORAGE_KEYS.journal, journalDays),
      habits: loadStored(STORAGE_KEYS.habits, habits),
      focusLogs: loadStored(STORAGE_KEYS.focusLogs, focusLogs),
    });
  };

  const handleImportBackupFile = async (
    file: File
  ): Promise<string | null> => {
    let rawText = '';
    try {
      rawText = await file.text();
    } catch {
      return 'Unable to read the selected file.';
    }

    const result = parseAndValidateWaynoteBackup(rawText);
    if (!result.ok) {
      return result.error;
    }

    const restored = result.data;
    const restoredHabits = restored.habits ?? [];
    const restoredFocusLogs = restored.focusLogs ?? {};
    try {
      localStorage.setItem(STORAGE_KEYS.sampleCleared, 'true');
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(restored.tasks));
      localStorage.setItem(
        STORAGE_KEYS.events,
        JSON.stringify(restored.events)
      );
      localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(restored.notes));
      localStorage.setItem(STORAGE_KEYS.pages, JSON.stringify(restored.pages));
      localStorage.setItem(
        STORAGE_KEYS.journal,
        JSON.stringify(restored.journalDays)
      );
      localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(restoredHabits));
      localStorage.setItem(
        STORAGE_KEYS.focusLogs,
        JSON.stringify(restoredFocusLogs)
      );
    } catch {
      return 'Failed to save restored backup to localStorage.';
    }

    setTasks(restored.tasks);
    setEvents(restored.events);
    setNotes(restored.notes);
    setPages(restored.pages);
    setJournalDays(restored.journalDays);
    setHabits(restoredHabits);
    setFocusLogs(restoredFocusLogs);
    setInspectedTaskId(null);
    setPrintableNote(null);
    setSettings((s) => ({
      ...s,
      selectedPageId: null,
      selectedNoteId: restored.notes[0]?.id || null,
    }));
    setBackupModalOpen(false);
    setUndoToast({
      label: `Backup restored (${restored.tasks.length} tasks, ${restored.events.length} events, ${restored.notes.length} notes)`,
    });
    return null;
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
    } catch {
      // ignore
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.focusLogs, JSON.stringify(focusLogs));
    } catch {
      // ignore
    }
  }, [focusLogs]);

  // Live background Focus Timer ticker + document title sync
  useEffect(() => {
    if (!timerState.isRunning) {
      document.title = 'Waynote — Daily Journal & Task Workspace';
      return;
    }

    const mins = String(Math.floor(timerState.secondsLeft / 60)).padStart(2, '0');
    const secs = String(timerState.secondsLeft % 60).padStart(2, '0');
    document.title = `${mins}:${secs} · Waynote`;
  }, [timerState.isRunning, timerState.secondsLeft]);

  useEffect(() => {
    if (!timerState.isRunning) return;

    const id = window.setInterval(() => {
      setTimerState((prev) => {
        if (!prev.isRunning) return prev;
        if (prev.secondsLeft <= 1) {
          return { ...prev, isRunning: false, secondsLeft: 0 };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [timerState.isRunning]);

  // Handle focus timer completion cleanly outside state updaters
  useEffect(() => {
    if (timerState.isRunning || timerState.secondsLeft !== 0) return;

    const preset =
      FOCUS_PRESETS.find((p) => p.id === timerState.presetId) ||
      FOCUS_PRESETS[0];

    if (timerState.soundEnabled) {
      playFocusChime();
    }

    if (preset.isFocus) {
      const liveToday = getTodayIso();
      setFocusLogs((logs) => {
        const cur = logs[liveToday] || { sessions: 0, minutes: 0 };
        return {
          ...logs,
          [liveToday]: {
            sessions: cur.sessions + 1,
            minutes: cur.minutes + preset.minutes,
          },
        };
      });
      setUndoToast({
        label: `Focus session complete! Logged ${preset.minutes}m for today.`,
      });
    } else {
      setUndoToast({ label: 'Break finished — ready when you are.' });
    }

    setTimerState((prev) =>
      prev.secondsLeft === 0 ? { ...prev, secondsLeft: prev.totalSeconds } : prev
    );
  }, [
    timerState.isRunning,
    timerState.secondsLeft,
    timerState.presetId,
    timerState.soundEnabled,
  ]);

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
  const overdueTasksCount = tasks.filter(
    (t) => !t.completed && t.dueDate < todayIso
  ).length;
  const scheduledHabitsToday = habits.filter((h) =>
    isHabitScheduledOnDate(h, todayIso)
  );
  const habitsDoneToday = scheduledHabitsToday.filter((h) =>
    h.completedDates.includes(todayIso)
  ).length;
  const focusMinutesToday = focusLogs[todayIso]?.minutes || 0;

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

  const handleMoveOverdueToToday = () => {
    const snapshot = tasks;
    const liveToday = getTodayIso();
    const count = tasks.filter(
      (t) => !t.completed && t.dueDate < liveToday
    ).length;
    if (count === 0) return;
    setTasks((prev) =>
      prev.map((t) =>
        !t.completed && t.dueDate < liveToday ? { ...t, dueDate: liveToday } : t
      )
    );
    setUndoToast({
      label: `Moved ${count} unfinished task${count > 1 ? 's' : ''} to Today`,
      restore: () => {
        setTasks(snapshot);
        setUndoToast(null);
      },
    });
  };

  const handleToggleHabitDate = (habitId: string, dateIso: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(dateIso);
        return {
          ...h,
          completedDates: exists
            ? h.completedDates.filter((d) => d !== dateIso)
            : [...h.completedDates, dateIso],
        };
      })
    );
  };

  const handleCreateHabit = (payload: {
    title: string;
    cadence: HabitCadence;
    color: EventColor;
  }) => {
    const created: HabitItem = {
      id: generateId('hab'),
      title: payload.title,
      cadence: payload.cadence,
      color: payload.color,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [created, ...prev]);
  };

  const handleDeleteHabit = (habitId: string) => {
    const removed = habits.find((h) => h.id === habitId);
    if (!removed) return;
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setUndoToast({
      label: `Deleted habit "${removed.title}"`,
      restore: () => {
        setHabits((prev) => [removed, ...prev]);
        setUndoToast(null);
      },
    });
  };

  const handleSelectFocusPreset = (presetId: FocusPresetId) => {
    const preset =
      FOCUS_PRESETS.find((p) => p.id === presetId) || FOCUS_PRESETS[0];
    setTimerState((prev) => ({
      ...prev,
      presetId,
      isRunning: false,
      totalSeconds: preset.minutes * 60,
      secondsLeft: preset.minutes * 60,
    }));
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
      updatedAt: getTodayIso(),
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
    const liveToday = getTodayIso();
    setTodayIso(liveToday);
    if (tab === 'today' && activeTab === 'today') {
      setSettings((s) => ({
        ...s,
        activeTab: 'today',
        selectedPageId: null,
        selectedDate: liveToday,
        lastTodayIso: liveToday,
      }));
      return;
    }
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
      ? formatShortDate(selectedDate, todayIso)
      : activeTab === 'calendar'
        ? 'Calendar'
        : activeTab === 'tasks'
          ? 'Tasks'
          : activeTab === 'notes'
            ? 'Notes'
            : activeTab === 'journal'
              ? 'Journey Log'
              : activeTab === 'focus'
                ? 'Focus & Habits'
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
          habitsDoneToday={habitsDoneToday}
          habitsScheduledToday={scheduledHabitsToday.length}
          focusTimerRunning={timerState.isRunning}
          darkMode={darkMode}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onSelectTab={handleSelectTab}
          onSelectPage={handleSelectPage}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenQuickAddPage={() => setQuickAddState({ open: true, mode: 'page' })}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onOpenBackupModal={() => setBackupModalOpen(true)}
          onOpenResetModal={() => setResetModalOpen(true)}
          onOpenPrivacy={openPrivacyModal}
          onOpenAboutModal={() => setAboutModalOpen(true)}
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
              onClick={() => handleOpenJournalDate(todayIso)}
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
              todayIso={todayIso}
              onSelectDate={setSelectedDate}
              events={events}
              tasks={tasks}
              habits={habits}
              journalDay={activeJournalDay}
              overdueCount={overdueTasksCount}
              focusMinutesToday={focusMinutesToday}
              onMoveOverdueToToday={handleMoveOverdueToToday}
              onToggleHabitDate={handleToggleHabitDate}
              onOpenFocusView={() => handleSelectTab('focus')}
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
              todayIso={todayIso}
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
              overdueCount={overdueTasksCount}
              onMoveOverdueToToday={handleMoveOverdueToToday}
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
              todayIso={todayIso}
              onOpenDate={handleOpenJournalDate}
            />
          ) : activeTab === 'focus' ? (
            <FocusHabitsView
              todayIso={todayIso}
              habits={habits}
              tasks={tasks}
              journalDays={journalDays}
              focusLogs={focusLogs}
              onToggleHabitDate={handleToggleHabitDate}
              onCreateHabit={handleCreateHabit}
              onDeleteHabit={handleDeleteHabit}
              onToggleTask={handleToggleTask}
              timerState={timerState}
              onSelectPreset={handleSelectFocusPreset}
              onToggleTimerRun={() =>
                setTimerState((prev) => ({ ...prev, isRunning: !prev.isRunning }))
              }
              onResetTimer={() =>
                setTimerState((prev) => ({
                  ...prev,
                  isRunning: false,
                  secondsLeft: prev.totalSeconds,
                }))
              }
              onChangeLinkedTask={(taskId) =>
                setTimerState((prev) => ({ ...prev, linkedTaskId: taskId }))
              }
              onToggleSound={() =>
                setTimerState((prev) => ({
                  ...prev,
                  soundEnabled: !prev.soundEnabled,
                }))
              }
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
        onRequestReset={() => setResetModalOpen(true)}
        stats={{
          notesCount: notes.length,
          tasksCount: tasks.length,
          eventsCount: events.length,
          pagesCount: pages.length,
          journalCount: Object.keys(journalDays).length,
        }}
      />

      {/* About & Support Modal */}
      <AboutSupportModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        onExport={handleExportBackup}
        onImportFile={handleImportBackupFile}
        stats={{
          tasksCount: tasks.length,
          eventsCount: events.length,
          notesCount: notes.length,
          pagesCount: pages.length,
          journalCount: Object.keys(journalDays).length,
        }}
      />

      {/* Reset / Clear Sample Data Confirmation Modal */}
      <ResetWorkspaceModal
        isOpen={resetModalOpen}
        onCancel={() => setResetModalOpen(false)}
        onConfirm={handleStartFresh}
      />

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Undo / Status Toast */}
      {undoToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-18 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] shadow-xl"
        >
          <span className="text-xs font-medium truncate">{undoToast.label}</span>
          {undoToast.restore && (
            <button
              type="button"
              onClick={undoToast.restore}
              className="text-xs font-semibold text-[#60A5FA] dark:text-[#2383E2] px-2 min-h-[36px] whitespace-nowrap shrink-0"
            >
              Undo
            </button>
          )}
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
