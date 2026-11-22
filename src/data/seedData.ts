import {
  CalendarEvent,
  EventCategory,
  EventColor,
  JournalDay,
  NoteItem,
  NoteTint,
  TaskItem,
  WorkspacePage,
} from '../types/workspace';

export const TODAY_ISO = '2026-11-21';

export const COVER_PRESETS: { label: string; url: string }[] = [
  {
    label: 'Warm Paper',
    url: '/src/assets/images/cover_warm_paper_1795325650282.jpg',
  },
  {
    label: 'Sage Mist',
    url: '/src/assets/images/cover_sage_mist_1795325650691.jpg',
  },
  {
    label: 'Oak & Stone',
    url: '/src/assets/images/cover_slate_architecture_1795325650927.jpg',
  },
];

export const TASK_CATEGORIES = [
  'Daily Focus',
  'Product Craft',
  'Personal',
  'Reading',
];

export const JOURNAL_TONES = ['Grounded', 'Focused', 'Reflective', 'Energized'];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Finalize mobile thumb-zone navigation flow',
    completed: true,
    dueDate: '2026-11-21',
    priority: 'high',
    category: 'Product Craft',
    notes: 'Verify 44px minimum touch targets across all bottom bar and block controls.',
    subtasks: [
      { id: 'st-1', title: 'Audit bottom bar height under 15% cap', completed: true },
      { id: 'st-2', title: 'Test slide-up sheet swipe and close button', completed: true },
    ],
    createdAt: '2026-11-20T09:15:00Z',
  },
  {
    id: 'task-2',
    title: 'Write Saturday morning journal reflection',
    completed: false,
    dueDate: '2026-11-21',
    priority: 'medium',
    category: 'Daily Focus',
    notes: 'Capture three quiet moments from this week and set one intention for Sunday.',
    subtasks: [],
    createdAt: '2026-11-21T08:00:00Z',
  },
  {
    id: 'task-3',
    title: 'Pick up fresh roasted espresso beans',
    completed: false,
    dueDate: '2026-11-21',
    priority: 'low',
    category: 'Personal',
    notes: 'Roastery on 4th Street closes at 4:00 PM on Saturdays.',
    subtasks: [
      { id: 'st-3', title: 'Bring reusable canister', completed: false },
    ],
    createdAt: '2026-11-21T08:30:00Z',
  },
  {
    id: 'task-4',
    title: 'Read Chapter 4 of The Timeless Way of Building',
    completed: false,
    dueDate: '2026-11-21',
    priority: 'medium',
    category: 'Reading',
    notes: 'Add key excerpts to Q4 Reading & Notes page.',
    subtasks: [],
    createdAt: '2026-11-19T18:20:00Z',
  },
  {
    id: 'task-5',
    title: 'Organize Kyoto train & ryokan confirmations',
    completed: false,
    dueDate: '2026-11-22',
    priority: 'high',
    category: 'Personal',
    notes: 'Confirm Shinkansen seat reservation numbers and check-in window.',
    subtasks: [
      { id: 'st-4', title: 'Save offline PDF tickets', completed: true },
      { id: 'st-5', title: 'Email ryokan about late arrival', completed: false },
    ],
    createdAt: '2026-11-18T14:00:00Z',
  },
  {
    id: 'task-6',
    title: 'Clean up weekly inbox and archive old drafts',
    completed: false,
    dueDate: '2026-11-22',
    priority: 'low',
    category: 'Daily Focus',
    notes: 'Keep only active projects in the sidebar tree.',
    subtasks: [],
    createdAt: '2026-11-20T17:45:00Z',
  },
  {
    id: 'task-7',
    title: 'Sketch block-editor keyboard shortcuts spec',
    completed: true,
    dueDate: '2026-11-20',
    priority: 'medium',
    category: 'Product Craft',
    notes: 'Documented slash menu triggers and Enter-to-continue behavior.',
    subtasks: [],
    createdAt: '2026-11-19T10:00:00Z',
  },
];

export const INITIAL_JOURNAL_DAYS: Record<string, JournalDay> = {
  '2026-11-21': {
    date: '2026-11-21',
    tone: 'Grounded',
    focusLine: 'Slow Saturday — finish deep reading before noon, keep evening offline.',
    blocks: [
      {
        id: 'jb-21-1',
        type: 'heading',
        content: 'Morning check-in',
      },
      {
        id: 'jb-21-2',
        type: 'text',
        content:
          'Rain cleared early around 7:15 AM. Starting the weekend with a quiet cup of pour-over and reviewing what actually moved the needle this week instead of rushing straight into errands.',
      },
      {
        id: 'jb-21-3',
        type: 'callout',
        content:
          'Reminder: Clarity comes from subtracting commitments, not packing more blocks onto the calendar.',
      },
      {
        id: 'jb-21-4',
        type: 'heading',
        content: 'Small wins & observations',
      },
      {
        id: 'jb-21-5',
        type: 'todo',
        content: '20-minute morning walk without headphones',
        checked: true,
      },
      {
        id: 'jb-21-6',
        type: 'todo',
        content: 'Note three highlights for the Sunday weekly review',
        checked: false,
      },
      {
        id: 'jb-21-7',
        type: 'bullet',
        content: 'Kept screen brightness low and reading notes concise.',
      },
    ],
  },
  '2026-11-20': {
    date: '2026-11-20',
    tone: 'Focused',
    focusLine: 'Close out sprint reviews cleanly before the weekend.',
    blocks: [
      {
        id: 'jb-20-1',
        type: 'heading',
        content: 'End of week wrap-up',
      },
      {
        id: 'jb-20-2',
        type: 'text',
        content:
          'Shipped the typography audit before 3 PM. Having fewer concurrent tasks made Friday feel noticeably calmer.',
      },
      {
        id: 'jb-20-3',
        type: 'quote',
        content: 'How we spend our days is, of course, how we spend our lives.',
      },
    ],
  },
  '2026-11-19': {
    date: '2026-11-19',
    tone: 'Reflective',
    focusLine: 'Protect two uninterrupted hours for writing.',
    blocks: [
      {
        id: 'jb-19-1',
        type: 'heading',
        content: 'Midweek notes',
      },
      {
        id: 'jb-19-2',
        type: 'text',
        content:
          'Noticed that writing directly inside daily pages right next to my top three tasks keeps both context and execution together.',
      },
      {
        id: 'jb-19-3',
        type: 'bullet',
        content: 'Drafted outline for Q4 reading synthesis',
      },
      {
        id: 'jb-19-4',
        type: 'bullet',
        content: 'Called Mom after dinner for 30 minutes',
      },
    ],
  },
};

export const INITIAL_PAGES: WorkspacePage[] = [
  {
    id: 'page-morning-pages',
    title: 'Morning Pages',
    icon: 'Feather',
    coverUrl: COVER_PRESETS[0].url,
    fontStyle: 'serif',
    updatedAt: '2026-11-21',
    summary: 'Unfiltered morning thoughts, recurring prompts, and quiet observations.',
    blocks: [
      {
        id: 'p1-b1',
        type: 'callout',
        content: 'Three prompts to revisit whenever focus feels scattered: What matters today? What can wait? What am I grateful for?',
      },
      {
        id: 'p1-b2',
        type: 'heading',
        content: 'Autumn Anchor',
      },
      {
        id: 'p1-b3',
        type: 'text',
        content:
          'November has been about pacing. Rather than tracking twenty micro-habits, keeping a single honest daily page with three real tasks feels sustainable.',
      },
      {
        id: 'p1-b4',
        type: 'divider',
        content: '',
      },
      {
        id: 'p1-b5',
        type: 'todo',
        content: 'Keep phone outside the bedroom overnight',
        checked: true,
      },
      {
        id: 'p1-b6',
        type: 'todo',
        content: 'Write 150 words before opening email',
        checked: false,
      },
    ],
  },
  {
    id: 'page-reading-list',
    title: 'Q4 Reading & Notes',
    icon: 'BookOpen',
    coverUrl: COVER_PRESETS[1].url,
    fontStyle: 'sans',
    updatedAt: '2026-11-20',
    summary: 'Books on architecture, craft, and calm systems with chapter takeaways.',
    blocks: [
      {
        id: 'p2-b1',
        type: 'heading',
        content: 'Currently Reading',
      },
      {
        id: 'p2-b2',
        type: 'todo',
        content: 'The Timeless Way of Building — Christopher Alexander',
        checked: false,
      },
      {
        id: 'p2-b3',
        type: 'todo',
        content: 'Four Thousand Weeks — Oliver Burkeman',
        checked: true,
      },
      {
        id: 'p2-b4',
        type: 'quote',
        content: 'A pattern is a careful description of a perennial solution to a recurring problem within a building context.',
      },
      {
        id: 'p2-b5',
        type: 'bullet',
        content: 'Notice how living spaces invite calm movement rather than demanding attention.',
      },
    ],
  },
  {
    id: 'page-kyoto-trip',
    title: 'Kyoto Autumn Itinerary',
    icon: 'Compass',
    coverUrl: COVER_PRESETS[2].url,
    fontStyle: 'sans',
    updatedAt: '2026-11-18',
    summary: 'Neighborhood walks, tea houses, transit notes, and packing checklist.',
    blocks: [
      {
        id: 'p3-b1',
        type: 'heading',
        content: 'Neighborhoods to explore on foot',
      },
      {
        id: 'p3-b2',
        type: 'bullet',
        content: 'Philosopher’s Path early morning before 8:00 AM',
      },
      {
        id: 'p3-b3',
        type: 'bullet',
        content: 'Higashiyama side streets & ceramic workshops',
      },
      {
        id: 'p3-b4',
        type: 'heading',
        content: 'Packing & Transit Checklist',
      },
      {
        id: 'p3-b5',
        type: 'todo',
        content: 'Load ICOCA card onto mobile wallet',
        checked: true,
      },
      {
        id: 'p3-b6',
        type: 'todo',
        content: 'Pack compact film camera + 2 rolls of Portra 400',
        checked: false,
      },
    ],
  },
  {
    id: 'page-weekly-ritual',
    title: 'Weekly Review Ritual',
    icon: 'Layers',
    fontStyle: 'sans',
    updatedAt: '2026-11-17',
    summary: 'Sunday evening reset checklist to close loops and preview next week.',
    blocks: [
      {
        id: 'p4-b1',
        type: 'text',
        content: 'Run through this short reset every Sunday around 5 PM.',
      },
      {
        id: 'p4-b2',
        type: 'todo',
        content: 'Review completed tasks and celebrate quiet progress',
        checked: false,
      },
      {
        id: 'p4-b3',
        type: 'todo',
        content: 'Reschedule or drop stale tasks older than 14 days',
        checked: false,
      },
      {
        id: 'p4-b4',
        type: 'todo',
        content: 'Pick top 3 priorities for Monday morning',
        checked: false,
      },
    ],
  },
];

export const NOTE_NOTEBOOKS = [
  'Ideas',
  'Meetings',
  'Reference',
  'Snippets',
  'Projects',
];

export const NOTE_TINTS: {
  id: NoteTint;
  label: string;
  cardClass: string;
  swatchClass: string;
}[] = [
  {
    id: 'default',
    label: 'Paper',
    cardClass:
      'bg-[#FFFFFF] dark:bg-[#202020] border-[#EAE9E5] dark:border-[#2C2C2C]',
    swatchClass:
      'bg-[#FFFFFF] dark:bg-[#202020] border-[#D4D3CE] dark:border-[#4A4A48]',
  },
  {
    id: 'sand',
    label: 'Warm Sand',
    cardClass:
      'bg-[#FAF7F0] dark:bg-[#27241D] border-[#ECE6D8] dark:border-[#3B3529]',
    swatchClass:
      'bg-[#F5EFE2] dark:bg-[#3A3324] border-[#DDD4C1] dark:border-[#554B35]',
  },
  {
    id: 'sage',
    label: 'Sage',
    cardClass:
      'bg-[#F3F7F4] dark:bg-[#1E2621] border-[#DFEAE2] dark:border-[#2E3C33]',
    swatchClass:
      'bg-[#E5EFE8] dark:bg-[#26352C] border-[#C5DACB] dark:border-[#3B5244]',
  },
  {
    id: 'sky',
    label: 'Sky',
    cardClass:
      'bg-[#F3F7FB] dark:bg-[#1D242C] border-[#DFEAFA] dark:border-[#2C3A48]',
    swatchClass:
      'bg-[#E5EFFB] dark:bg-[#243242] border-[#C3D8F3] dark:border-[#39506B]',
  },
  {
    id: 'blush',
    label: 'Rose',
    cardClass:
      'bg-[#FBF5F5] dark:bg-[#292021] border-[#F0E1E2] dark:border-[#3F2E30]',
    swatchClass:
      'bg-[#F7E8E9] dark:bg-[#3B2A2C] border-[#E5C9CB] dark:border-[#593D40]',
  },
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-thumb-ergonomics',
    title: 'Mobile Thumb-Zone Field Notes',
    body: 'Primary capture controls belong in the bottom 40% of the viewport so capturing an idea one-handed while walking takes under two seconds.\n\nKey takeaway: separate quick-capture (frictionless index card) from long-form daily reflection (chronological journal).',
    notebook: 'Ideas',
    tags: ['ux', 'mobile', 'design'],
    tint: 'sky',
    pinned: true,
    archived: false,
    checklist: [
      { id: 'nc-1', text: 'Keep quick capture reachable in 1 tap', done: true },
      { id: 'nc-2', text: 'Verify 44px minimum tap targets on cards', done: true },
      { id: 'nc-3', text: 'Test one-handed tag filtering on 375px', done: false },
    ],
    linkedNoteIds: ['note-zettelkasten'],
    updatedAt: '2026-11-21T16:40:00Z',
    createdAt: '2026-11-19T10:15:00Z',
  },
  {
    id: 'note-zettelkasten',
    title: 'Evergreen Notes vs Daily Journal',
    body: 'Daily journals answer "what happened today?" while evergreen notes answer "what do I know or want to build across time?"\n\nLinking related notes lets ideas compound instead of getting buried under three weeks of dated entries.',
    notebook: 'Reference',
    tags: ['pkm', 'writing'],
    tint: 'sand',
    pinned: true,
    archived: false,
    checklist: [],
    linkedNoteIds: ['note-thumb-ergonomics'],
    updatedAt: '2026-11-20T19:10:00Z',
    createdAt: '2026-11-18T09:00:00Z',
  },
  {
    id: 'note-design-crit',
    title: 'Friday Craft Sync — Typography & Spacing',
    body: 'Agreed to keep metadata unboxed with subtle middot separators instead of pill clusters.\n\nDecisions:\n- Use tabular numerals for all word counts and dates\n- Keep card surfaces within 7% brightness delta of canvas\n- Promote action items directly into the main task queue',
    notebook: 'Meetings',
    tags: ['typography', 'review'],
    tint: 'default',
    pinned: false,
    archived: false,
    checklist: [
      { id: 'nc-4', text: 'Send updated spacing tokens to team', done: false },
      { id: 'nc-5', text: 'Archive deprecated v1 layout draft', done: true },
    ],
    linkedNoteIds: [],
    updatedAt: '2026-11-20T15:30:00Z',
    createdAt: '2026-11-20T14:50:00Z',
  },
  {
    id: 'note-kyoto-coffee',
    title: 'Kyoto Tea & Pour-Over Spots',
    body: 'Recommendations from Kenji for quiet morning work & reading:\n- Weekenders Coffee Tominokoji (courtyard stand, opens 7:30 AM)\n- Kurasu Ebisugawa (clean single-origin pour-over)\n- Ippodo Tea Kaboku Tearoom for afternoon matcha',
    notebook: 'Projects',
    tags: ['kyoto', 'travel', 'coffee'],
    tint: 'sage',
    pinned: false,
    archived: false,
    checklist: [
      { id: 'nc-6', text: 'Pin locations on offline map', done: false },
    ],
    linkedNoteIds: [],
    updatedAt: '2026-11-19T21:05:00Z',
    createdAt: '2026-11-17T11:20:00Z',
  },
  {
    id: 'note-css-snippet',
    title: 'Reduced Motion & Safe Area Snippet',
    body: '@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}\n\nAlways pair bottom sticky bars with env(safe-area-inset-bottom) on iOS.',
    notebook: 'Snippets',
    tags: ['css', 'accessibility'],
    tint: 'blush',
    pinned: false,
    archived: false,
    checklist: [],
    linkedNoteIds: ['note-thumb-ergonomics'],
    updatedAt: '2026-11-18T13:12:00Z',
    createdAt: '2026-11-18T13:00:00Z',
  },
];

export const EVENT_CATEGORIES: EventCategory[] = [
  'Deep Work',
  'Meeting',
  'Personal',
  'Milestone',
  'Health',
  'Travel',
];

export const EVENT_COLORS: {
  id: EventColor;
  label: string;
  surfaceClass: string;
  swatchClass: string;
  barClass: string;
  textClass: string;
}[] = [
  {
    id: 'blue',
    label: 'Cobalt',
    surfaceClass:
      'bg-[#EEF5FD] dark:bg-[#1D2B3A] border-[#CFE2F7] dark:border-[#2C435C]',
    swatchClass: 'bg-[#2383E2]',
    barClass: 'bg-[#2383E2]',
    textClass: 'text-[#1A66B8] dark:text-[#7BB7F5]',
  },
  {
    id: 'amber',
    label: 'Amber',
    surfaceClass:
      'bg-[#FDF6EB] dark:bg-[#2F2617] border-[#F3DFBD] dark:border-[#4B3B20]',
    swatchClass: 'bg-[#D97706]',
    barClass: 'bg-[#D97706]',
    textClass: 'text-[#A85B06] dark:text-[#FBBF24]',
  },
  {
    id: 'emerald',
    label: 'Sage Green',
    surfaceClass:
      'bg-[#EFF8F2] dark:bg-[#1B2B22] border-[#CBEAD5] dark:border-[#2A4435]',
    swatchClass: 'bg-[#16A34A]',
    barClass: 'bg-[#16A34A]',
    textClass: 'text-[#15803D] dark:text-[#6EE7B7]',
  },
  {
    id: 'rose',
    label: 'Crimson',
    surfaceClass:
      'bg-[#FDF1F2] dark:bg-[#311E21] border-[#F5CFD4] dark:border-[#4E2E33]',
    swatchClass: 'bg-[#E11D48]',
    barClass: 'bg-[#E11D48]',
    textClass: 'text-[#BE123C] dark:text-[#FDA4AF]',
  },
  {
    id: 'violet',
    label: 'Plum',
    surfaceClass:
      'bg-[#F5F2FC] dark:bg-[#272136] border-[#E0D6F7] dark:border-[#3D3257]',
    swatchClass: 'bg-[#7C3AED]',
    barClass: 'bg-[#7C3AED]',
    textClass: 'text-[#6D28D9] dark:text-[#C4B5FD]',
  },
  {
    id: 'slate',
    label: 'Graphite',
    surfaceClass:
      'bg-[#F4F3EF] dark:bg-[#282826] border-[#DFDDD6] dark:border-[#3C3C39]',
    swatchClass: 'bg-[#57534E]',
    barClass: 'bg-[#57534E] dark:bg-[#A8A29E]',
    textClass: 'text-[#44403C] dark:text-[#D6D3D1]',
  },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Deep Reading Block: Architecture & Craft',
    date: '2026-11-21',
    allDay: false,
    startTime: '09:30',
    endTime: '11:00',
    category: 'Deep Work',
    color: 'blue',
    location: 'Home Study',
    description: 'Read Chapter 4 without notifications and capture excerpts in Notes Studio.',
    repeat: 'none',
    reminder: '10m',
    createdAt: '2026-11-20T18:00:00Z',
  },
  {
    id: 'evt-2',
    title: 'Coffee Walk & Market Errands',
    date: '2026-11-21',
    allDay: false,
    startTime: '14:00',
    endTime: '15:15',
    category: 'Personal',
    color: 'emerald',
    location: '4th Street Roastery',
    description: 'Pick up fresh espresso beans and walk through the park.',
    repeat: 'none',
    reminder: '30m',
    createdAt: '2026-11-21T07:45:00Z',
  },
  {
    id: 'evt-3',
    title: 'Weekly Review & Sunday Reset',
    date: '2026-11-15',
    allDay: false,
    startTime: '17:00',
    endTime: '17:45',
    category: 'Milestone',
    color: 'amber',
    location: 'Desk',
    description: 'Close weekly loops, clear completed tasks, and pick top 3 Monday priorities.',
    repeat: 'weekly',
    reminder: '30m',
    createdAt: '2026-11-14T12:00:00Z',
  },
  {
    id: 'evt-4',
    title: 'Design Systems Sync',
    date: '2026-11-23',
    allDay: false,
    startTime: '10:00',
    endTime: '10:45',
    category: 'Meeting',
    color: 'violet',
    location: 'Studio Meet Link',
    description: 'Review mobile calendar density and typography spacing tokens.',
    repeat: 'none',
    reminder: '10m',
    createdAt: '2026-11-20T15:00:00Z',
  },
  {
    id: 'evt-5',
    title: 'Morning Strength & Mobility',
    date: '2026-11-24',
    allDay: false,
    startTime: '07:30',
    endTime: '08:15',
    category: 'Health',
    color: 'rose',
    location: 'Neighborhood Gym',
    description: '45-minute kettlebell and stretching session.',
    repeat: 'none',
    reminder: '1h',
    createdAt: '2026-11-19T20:00:00Z',
  },
  {
    id: 'evt-6',
    title: 'Kyoto Rail & Ryokan Check-in Window',
    date: '2026-11-27',
    allDay: true,
    startTime: '09:00',
    endTime: '18:00',
    category: 'Travel',
    color: 'slate',
    location: 'Kyoto Station → Higashiyama',
    description: 'Bring offline PDF tickets and ICOCA mobile pass.',
    repeat: 'none',
    reminder: '1d',
    createdAt: '2026-11-18T14:30:00Z',
  },
];
