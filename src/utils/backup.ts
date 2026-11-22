import {
  CalendarEvent,
  JournalDay,
  NoteItem,
  TaskItem,
  WorkspacePage,
} from '../types/workspace';

export interface WaynoteBackupData {
  tasks: TaskItem[];
  events: CalendarEvent[];
  notes: NoteItem[];
  pages: WorkspacePage[];
  journalDays: Record<string, JournalDay>;
}

export interface WaynoteBackup {
  app: 'Waynote';
  version: 1;
  exportedAt: string;
  data: WaynoteBackupData;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function hasStringIdArray(arr: unknown): arr is { id: string }[] {
  return (
    Array.isArray(arr) &&
    arr.every((item) => isPlainObject(item) && typeof item.id === 'string')
  );
}

function isValidJournalRecord(
  obj: unknown
): obj is Record<string, JournalDay> {
  if (!isPlainObject(obj)) return false;
  return Object.entries(obj).every(
    ([key, val]) =>
      isPlainObject(val) &&
      typeof val.date === 'string' &&
      key.length > 0 &&
      Array.isArray(val.blocks)
  );
}

export function getTodayFilenameDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function downloadWaynoteBackup(data: WaynoteBackupData): void {
  const payload: WaynoteBackup = {
    app: 'Waynote',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `waynote-backup-${getTodayFilenameDate()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseAndValidateWaynoteBackup(
  rawText: string
): { ok: true; data: WaynoteBackupData } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      ok: false,
      error: 'The selected file is not valid JSON.',
    };
  }

  if (!isPlainObject(parsed) || parsed.app !== 'Waynote' || !isPlainObject(parsed.data)) {
    return {
      ok: false,
      error: 'This file does not appear to be a valid Waynote backup.',
    };
  }

  const { tasks, events, notes, pages, journalDays } = parsed.data;

  if (
    !hasStringIdArray(tasks) ||
    !hasStringIdArray(events) ||
    !hasStringIdArray(notes) ||
    !hasStringIdArray(pages) ||
    !isValidJournalRecord(journalDays)
  ) {
    return {
      ok: false,
      error:
        'Backup data is missing required Waynote collections or has an invalid format.',
    };
  }

  return {
    ok: true,
    data: {
      tasks: tasks as unknown as TaskItem[],
      events: events as unknown as CalendarEvent[],
      notes: notes as unknown as NoteItem[],
      pages: pages as unknown as WorkspacePage[],
      journalDays,
    },
  };
}
