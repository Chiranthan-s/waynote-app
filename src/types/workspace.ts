export type TaskPriority = 'high' | 'medium' | 'low';

export type BlockType =
  | 'heading'
  | 'text'
  | 'todo'
  | 'bullet'
  | 'callout'
  | 'quote'
  | 'divider';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  category: string;
  notes: string;
  subtasks: Subtask[];
  createdAt: string;
}

export interface JournalDay {
  date: string; // YYYY-MM-DD
  tone: string;
  focusLine: string;
  blocks: ContentBlock[];
}

export type PageIconName =
  | 'Feather'
  | 'BookOpen'
  | 'Compass'
  | 'Layers'
  | 'CheckSquare'
  | 'Sparkles'
  | 'Sun'
  | 'FileText';

export interface WorkspacePage {
  id: string;
  title: string;
  icon: PageIconName;
  coverUrl?: string;
  fontStyle: 'sans' | 'serif';
  updatedAt: string; // YYYY-MM-DD
  summary: string;
  blocks: ContentBlock[];
}

export type NoteTint = 'default' | 'sand' | 'sage' | 'sky' | 'blush';

export interface NoteChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  notebook: string;
  tags: string[];
  tint: NoteTint;
  pinned: boolean;
  archived: boolean;
  checklist: NoteChecklistItem[];
  linkedNoteIds: string[];
  updatedAt: string;
  createdAt: string;
}

export type HabitCadence = 'daily' | 'weekdays';

export interface HabitItem {
  id: string;
  title: string;
  cadence: HabitCadence;
  color: EventColor;
  completedDates: string[]; // YYYY-MM-DD[]
  createdAt: string;
}

export interface FocusDayLog {
  sessions: number;
  minutes: number;
}

export type ActiveTab =
  | 'today'
  | 'calendar'
  | 'tasks'
  | 'notes'
  | 'journal'
  | 'focus'
  | 'pages';

export type EventCategory =
  | 'Deep Work'
  | 'Meeting'
  | 'Personal'
  | 'Milestone'
  | 'Health'
  | 'Travel';

export type EventColor =
  | 'blue'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'violet'
  | 'slate';

export type EventRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

export type EventReminder = 'none' | '10m' | '30m' | '1h' | '1d';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (start date)
  allDay: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: EventCategory;
  color: EventColor;
  location: string;
  description: string;
  repeat: EventRepeat;
  reminder: EventReminder;
  createdAt: string;
}
