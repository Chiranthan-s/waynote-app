import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Flame,
  Plus,
  Sparkles,
  Timer,
} from 'lucide-react';
import {
  CalendarEvent,
  ContentBlock,
  HabitItem,
  JournalDay,
  TaskItem,
  TaskPriority,
} from '../types/workspace';
import {
  EVENT_COLORS,
  JOURNAL_TONES,
  TASK_CATEGORIES,
} from '../data/seedData';
import { JOURNAL_TEMPLATES } from '../utils/journalTemplates';
import {
  getHabitCurrentStreak,
  isHabitScheduledOnDate,
} from '../utils/habitUtils';
import {
  formatEventTimeRange,
  formatReadableDate,
  getEventsForDate,
  getSurroundingDates,
  getTodayIso,
  parseISODate,
} from '../utils/dateUtils';
import { BlockEditor } from './BlockEditor';
import { TaskRow } from './TaskRow';

interface TodayViewProps {
  selectedDate: string;
  todayIso?: string;
  onSelectDate: (iso: string) => void;
  events: CalendarEvent[];
  tasks: TaskItem[];
  habits: HabitItem[];
  journalDay: JournalDay;
  overdueCount: number;
  focusMinutesToday: number;
  onMoveOverdueToToday: () => void;
  onToggleHabitDate: (habitId: string, dateIso: string) => void;
  onOpenFocusView: () => void;
  onUpdateJournalDay: (date: string, patch: Partial<JournalDay>) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenNewEvent: (dateIso: string) => void;
  onToggleTask: (id: string) => void;
  onSelectTask: (task: TaskItem) => void;
  onQuickAddTask: (payload: {
    title: string;
    dueDate: string;
    priority: TaskPriority;
    category: string;
    notes: string;
  }) => void;
  onOpenCalendar?: () => void;
}

export function TodayView({
  selectedDate,
  todayIso = getTodayIso(),
  onSelectDate,
  events,
  tasks,
  habits,
  journalDay,
  overdueCount,
  focusMinutesToday,
  onMoveOverdueToToday,
  onToggleHabitDate,
  onOpenFocusView,
  onUpdateJournalDay,
  onSelectEvent,
  onOpenNewEvent,
  onToggleTask,
  onSelectTask,
  onQuickAddTask,
  onOpenCalendar,
}: TodayViewProps) {
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');
  const [mobileSection, setMobileSection] = useState<'all' | 'tasks' | 'journal'>('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const dates = getSurroundingDates(selectedDate, 3, 3, todayIso);
  const dayEvents = getEventsForDate(events, selectedDate);
  const dayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const completedCount = dayTasks.filter((t) => t.completed).length;
  const totalCount = dayTasks.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const dt = parseISODate(selectedDate);
  const fullWeekday = dt.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // SVG progress ring math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inlineTaskTitle.trim();
    if (!trimmed) return;
    onQuickAddTask({
      title: trimmed,
      dueDate: selectedDate,
      priority: 'medium',
      category: TASK_CATEGORIES[0],
      notes: '',
    });
    setInlineTaskTitle('');
  };

  const handleBlocksChange = (nextBlocks: ContentBlock[]) => {
    onUpdateJournalDay(selectedDate, { blocks: nextBlocks });
  };

  const applyJournalTemplate = (templateId: string) => {
    const tpl = JOURNAL_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const newBlocks = tpl.buildBlocks();
    const hasExistingContent = journalDay.blocks.some(
      (b) => b.content.trim().length > 0
    );
    onUpdateJournalDay(selectedDate, {
      tone: journalDay.tone || tpl.tone,
      focusLine: journalDay.focusLine.trim() ? journalDay.focusLine : tpl.focusLine,
      blocks: hasExistingContent
        ? [...journalDay.blocks, ...newBlocks]
        : newBlocks,
    });
    setShowTemplates(false);
  };

  const scheduledHabits = habits.filter((h) =>
    isHabitScheduledOnDate(h, selectedDate)
  );
  const completedHabitsCount = scheduledHabits.filter((h) =>
    h.completedDates.includes(selectedDate)
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 sm:pt-8 pb-28 lg:pb-14">
      {/* Horizontal Date Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1">
        {dates.map((d) => {
          const isSelected = d.iso === selectedDate;
          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => onSelectDate(d.iso)}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[58px] px-2.5 py-1.5 rounded-2xl transition-colors shrink-0 ${
                isSelected
                  ? 'bg-[#37352F] text-white dark:bg-[#F0EFEA] dark:text-[#191919]'
                  : 'bg-[#F7F6F3] dark:bg-[#242424] text-[#5F5E5B] dark:text-[#A4A39E] hover:bg-[#EFEFED] dark:hover:bg-[#2C2C2C]'
              }`}
            >
              <span className="text-[11px] font-medium leading-none">
                {d.weekdayShort}
              </span>
              <span className="mt-1.5 text-sm font-semibold tabular-nums leading-none">
                {d.dayNum}
              </span>
              {d.isToday && (
                <span
                  className={`mt-1 text-[9px] font-medium leading-none ${
                    isSelected ? 'opacity-80' : 'text-[#2383E2] dark:text-[#60A5FA]'
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
        {onOpenCalendar && (
          <button
            type="button"
            onClick={onOpenCalendar}
            aria-label="Open full calendar"
            className="flex flex-col items-center justify-center min-w-[54px] min-h-[58px] px-2.5 py-1.5 rounded-2xl bg-[#F7F6F3] dark:bg-[#242424] text-[#5F5E5B] dark:text-[#A4A39E] hover:bg-[#EFEFED] dark:hover:bg-[#2C2C2C] transition-colors shrink-0"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span className="mt-1.5 text-[10px] font-medium leading-none whitespace-nowrap">
              Month
            </span>
          </button>
        )}
      </div>

      {/* Editorial Day Header */}
      <div className="mt-3 pb-5 border-b border-[#EFEFED] dark:border-[#2A2A2A] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#787774] dark:text-[#9B9A97] tabular-nums">
            <span>
              {selectedDate === todayIso ? 'Today' : formatReadableDate(selectedDate, todayIso)} ·{' '}
              {dt.getFullYear()}
            </span>
            {selectedDate !== todayIso && (
              <button
                type="button"
                onClick={() => onSelectDate(todayIso)}
                className="text-xs font-semibold text-[#2383E2] dark:text-[#60A5FA] hover:underline px-1.5 py-0.5 rounded-md"
              >
                Jump to Today
              </button>
            )}
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA] text-balance">
            {fullWeekday}, {monthDay}
          </h1>
        </div>

        {/* Daily Progress Summary + Focus Timer Shortcut */}
        <div className="flex flex-wrap items-center gap-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-[#EAE9E4] dark:text-[#2D2D2D]"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-[#2383E2] dark:text-[#60A5FA] transition-all duration-300"
                />
              </svg>
              <span className="absolute text-[11px] font-semibold text-[#37352F] dark:text-[#E6E5E1] tabular-nums">
                {progressPct}%
              </span>
            </div>
            <div className="text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
              <div className="font-semibold text-[#37352F] dark:text-[#E6E5E1]">
                {completedCount}/{totalCount} tasks · {completedHabitsCount}/{scheduledHabits.length} habits
              </div>
              <div>
                {journalDay.blocks.length} journal blocks
                {focusMinutesToday > 0 ? ` · ${focusMinutesToday}m focus` : ''}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenFocusView}
            className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#EAE9E5] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:border-[#2383E2] transition-colors whitespace-nowrap"
          >
            <Timer className="w-3.5 h-3.5 text-[#2383E2] dark:text-[#60A5FA]" aria-hidden="true" />
            <span>Focus Timer</span>
          </button>
        </div>
      </div>

      {/* Overdue Carry-Over Prompt (Shown only when past unfinished tasks exist) */}
      {overdueCount > 0 && selectedDate === todayIso && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-[#FDF6EB] dark:bg-[#2D2417] border border-[#F3DFBD] dark:border-[#493A22]">
          <span className="text-xs font-medium text-[#8C4D04] dark:text-[#FBBF24] tabular-nums">
            {overdueCount} unfinished task{overdueCount === 1 ? '' : 's'} from earlier days
          </span>
          <button
            type="button"
            onClick={onMoveOverdueToToday}
            className="inline-flex items-center gap-1 px-3 min-h-[36px] rounded-lg bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <span>Move to Today</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Mobile View Switcher (Thumb-friendly filter between Combined, Tasks, Journal) */}
      <div className="mt-4 lg:hidden">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#242424]">
          {(
            [
              { id: 'all', label: 'Combined' },
              { id: 'tasks', label: `Tasks (${totalCount})` },
              { id: 'journal', label: 'Journal' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileSection(tab.id)}
              className={`min-h-[38px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap tabular-nums ${
                mobileSection === tab.id
                  ? 'bg-white dark:bg-[#333333] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774] dark:text-[#9B9A97]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive 2-Column Desktop Workspace / Single Scroll Mobile */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Schedule & Tasks Column (First on mobile for rapid check-off, Right column on desktop) */}
        {(mobileSection === 'all' || mobileSection === 'tasks') && (
          <div className="lg:col-span-5 lg:order-2 space-y-5">
            {/* Day Events Card */}
            <section
              aria-label="Today's events"
              className="bg-[#FBFBFA] dark:bg-[#202020] rounded-2xl border border-[#EAE9E5] dark:border-[#2C2C2C] p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
                <h2 className="text-sm font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  Schedule
                </h2>
                <button
                  type="button"
                  onClick={() => onOpenNewEvent(selectedDate)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:underline min-h-[36px] px-1"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add event</span>
                </button>
              </div>

              {dayEvents.length === 0 ? (
                <p className="text-xs text-[#787774] dark:text-[#9B9A97] py-1">
                  No events scheduled for this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map((evt) => {
                    const cMeta =
                      EVENT_COLORS.find((c) => c.id === evt.color) ||
                      EVENT_COLORS[0];
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => onSelectEvent(evt)}
                        className={`w-full text-left p-3 rounded-xl border transition-opacity hover:opacity-95 ${cMeta.surfaceClass}`}
                      >
                        <div className={`text-xs font-semibold ${cMeta.textClass} truncate`}>
                          {evt.title}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#5F5E5B] dark:text-[#B4B3AF] tabular-nums">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {formatEventTimeRange(evt)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{evt.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Daily Tasks Card */}
            <section
              aria-label="Daily tasks"
              className="bg-[#FBFBFA] dark:bg-[#202020] rounded-2xl border border-[#EAE9E5] dark:border-[#2C2C2C] p-4 sm:p-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
                <h2 className="text-sm font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  Today&apos;s Tasks
                </h2>
                <span className="text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
                  {completedCount}/{totalCount}
                </span>
              </div>

              {/* Inline Quick-Add Task */}
              <form onSubmit={handleInlineAdd} className="mt-3 mb-2 flex items-center gap-2">
                <input
                  type="text"
                  value={inlineTaskTitle}
                  onChange={(e) => setInlineTaskTitle(e.target.value)}
                  placeholder="Add a task for this day..."
                  className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#191919] border border-[#E6E5E1] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
                />
                <button
                  type="submit"
                  aria-label="Add task"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] hover:opacity-90 active:scale-[0.97] transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {dayTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#787774] dark:text-[#9B9A97]">
                    No tasks scheduled for {formatReadableDate(selectedDate, todayIso)}.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#EFEFED] dark:divide-[#2A2A2A]">
                  {dayTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={onToggleTask}
                      onSelect={onSelectTask}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Daily Habits Quick Check-off Card */}
            <section
              aria-label="Daily habits"
              className="bg-[#FBFBFA] dark:bg-[#202020] rounded-2xl border border-[#EAE9E5] dark:border-[#2C2C2C] p-4 sm:p-5 space-y-2.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
                <h2 className="text-sm font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  Daily Habits
                </h2>
                <button
                  type="button"
                  onClick={onOpenFocusView}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:underline min-h-[34px] px-1"
                >
                  <span>Manage &amp; streaks</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>

              {scheduledHabits.length === 0 ? (
                <p className="text-xs text-[#787774] dark:text-[#9B9A97] py-1">
                  No habits scheduled for this day.
                </p>
              ) : (
                <div className="divide-y divide-[#EFEFED] dark:divide-[#2A2A2A]">
                  {scheduledHabits.map((habit) => {
                    const done = habit.completedDates.includes(selectedDate);
                    const streak = getHabitCurrentStreak(habit, todayIso);
                    const colorMeta =
                      EVENT_COLORS.find((c) => c.id === habit.color) ||
                      EVENT_COLORS[2];
                    return (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <button
                          type="button"
                          onClick={() => onToggleHabitDate(habit.id, selectedDate)}
                          className="flex items-center gap-2 min-w-0 flex-1 text-left min-h-[44px]"
                        >
                          <span
                            className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0 transition-colors ${
                              done
                                ? `${colorMeta.barClass} border-transparent text-white`
                                : 'border-[#C7C6C2] dark:border-[#4A4A48]'
                            }`}
                          >
                            {done && <Check className="w-3 h-3 stroke-[2.75]" />}
                          </span>
                          <span
                            className={`text-sm truncate ${
                              done
                                ? 'line-through text-[#9B9A97] dark:text-[#6B6B68]'
                                : 'text-[#37352F] dark:text-[#E6E5E1]'
                            }`}
                          >
                            {habit.title}
                          </span>
                        </button>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#787774] dark:text-[#9B9A97] tabular-nums shrink-0">
                          <Flame
                            className="w-3 h-3 text-[#D97706] dark:text-[#FBBF24]"
                            aria-hidden="true"
                          />
                          {streak}d
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Journal Page Column (Left 7 cols on desktop) */}
        {(mobileSection === 'all' || mobileSection === 'journal') && (
          <section aria-label="Daily journal" className="lg:col-span-7 lg:order-1 space-y-5">
            {/* Daily Focus & Tone Header */}
            <div className="space-y-3 pb-4 border-b border-[#EFEFED] dark:border-[#2A2A2A]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="daily-focus-input"
                  className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97]"
                >
                  Daily intention
                </label>
                {/* Tone selector (interactive segmented buttons) */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {JOURNAL_TONES.map((tone) => {
                    const active = journalDay.tone === tone;
                    return (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => onUpdateJournalDay(selectedDate, { tone })}
                        className={`px-2.5 min-h-[34px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-[#EAE9E4] dark:bg-[#2E2E2E] text-[#37352F] dark:text-[#F0EFEA]'
                            : 'text-[#787774] dark:text-[#8E8D89] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
                        }`}
                      >
                        {tone}
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                id="daily-focus-input"
                type="text"
                value={journalDay.focusLine}
                onChange={(e) =>
                  onUpdateJournalDay(selectedDate, { focusLine: e.target.value })
                }
                placeholder="Set one quiet intention for today..."
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#EAE9E5] dark:border-[#303030] text-[15px] font-medium text-[#37352F] dark:text-[#F0EFEA] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
              />
            </div>

            {/* 1-Tap Guided Journal Templates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#787774] dark:text-[#9B9A97]">
                  Journal blocks
                </span>
                <button
                  type="button"
                  onClick={() => setShowTemplates((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-2.5 min-h-[34px] rounded-lg text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:bg-[#2383E2]/10 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{showTemplates ? 'Hide templates' : 'Use template'}</span>
                </button>
              </div>

              {showTemplates && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 rounded-2xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#EAE9E5] dark:border-[#303030]">
                  {JOURNAL_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => applyJournalTemplate(tpl.id)}
                      className="text-left px-3 py-2.5 min-h-[44px] rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#EAE9E5] dark:border-[#2F2F2F] hover:border-[#2383E2] transition-colors"
                    >
                      <div className="text-xs font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                        {tpl.label}
                      </div>
                      <div className="text-[11px] text-[#787774] dark:text-[#9B9A97]">
                        {tpl.tone} · {tpl.buildBlocks().length} blocks
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notion-style Journal Block Editor */}
            <div>
              <BlockEditor
                blocks={journalDay.blocks}
                onChange={handleBlocksChange}
                emptyPrompt="Start today's journal entry or tap + Add block..."
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
