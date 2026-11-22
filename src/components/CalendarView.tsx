import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Repeat,
} from 'lucide-react';
import {
  CalendarEvent,
  EventCategory,
  JournalDay,
  TaskItem,
  TaskPriority,
} from '../types/workspace';
import {
  EVENT_CATEGORIES,
  EVENT_COLORS,
  TASK_CATEGORIES,
  TODAY_ISO,
} from '../data/seedData';
import {
  formatEventTimeRange,
  formatReadableDate,
  getEventsForDate,
  getMonthGridDays,
  getWeekDays,
  parseISODate,
  shiftDateIso,
  shiftMonth,
} from '../utils/dateUtils';
import { TaskRow } from './TaskRow';

interface CalendarViewProps {
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  viewMode: 'month' | 'week';
  onChangeViewMode: (mode: 'month' | 'week') => void;
  weekStartsOnMonday: boolean;
  onToggleWeekStart: () => void;
  events: CalendarEvent[];
  tasks: TaskItem[];
  journalDays: Record<string, JournalDay>;
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
  onOpenDayInToday: (dateIso: string) => void;
}

export function CalendarView({
  selectedDate,
  onSelectDate,
  viewMode,
  onChangeViewMode,
  weekStartsOnMonday,
  onToggleWeekStart,
  events,
  tasks,
  journalDays,
  onSelectEvent,
  onOpenNewEvent,
  onToggleTask,
  onSelectTask,
  onQuickAddTask,
  onOpenDayInToday,
}: CalendarViewProps) {
  const initialDt = parseISODate(selectedDate);
  const [displayMonth, setDisplayMonth] = useState<{
    year: number;
    monthIndex: number;
  }>({
    year: initialDt.getFullYear(),
    monthIndex: initialDt.getMonth(),
  });
  const [layerFilter, setLayerFilter] = useState<'all' | 'events' | 'tasks'>('all');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'All' | EventCategory>('All');
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');

  useEffect(() => {
    const dt = parseISODate(selectedDate);
    setDisplayMonth((prev) => {
      if (
        prev.year === dt.getFullYear() &&
        prev.monthIndex === dt.getMonth()
      ) {
        return prev;
      }
      return { year: dt.getFullYear(), monthIndex: dt.getMonth() };
    });
  }, [selectedDate]);

  const visibleEvents = useMemo(() => {
    if (layerFilter === 'tasks') return [];
    if (eventCategoryFilter === 'All') return events;
    return events.filter((e) => e.category === eventCategoryFilter);
  }, [events, layerFilter, eventCategoryFilter]);

  const visibleTasks = useMemo(() => {
    if (layerFilter === 'events') return [];
    return tasks;
  }, [tasks, layerFilter]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    for (const t of visibleTasks) {
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    }
    return map;
  }, [visibleTasks]);

  const monthCells = useMemo(
    () =>
      getMonthGridDays(
        displayMonth.year,
        displayMonth.monthIndex,
        weekStartsOnMonday
      ),
    [displayMonth.year, displayMonth.monthIndex, weekStartsOnMonday]
  );

  const weekDays = useMemo(
    () => getWeekDays(selectedDate, weekStartsOnMonday),
    [selectedDate, weekStartsOnMonday]
  );

  const weekdayHeaders = weekStartsOnMonday
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Count events occurring in current month grid
  const monthPrefix = `${displayMonth.year}-${String(
    displayMonth.monthIndex + 1
  ).padStart(2, '0')}`;

  const monthEventOccurrences = useMemo(() => {
    return monthCells
      .filter((c) => c.inCurrentMonth)
      .reduce(
        (acc, cell) => acc + getEventsForDate(visibleEvents, cell.iso).length,
        0
      );
  }, [monthCells, visibleEvents]);

  const monthTaskCount = useMemo(
    () => visibleTasks.filter((t) => t.dueDate.startsWith(monthPrefix)).length,
    [visibleTasks, monthPrefix]
  );

  const headerTitle = useMemo(() => {
    if (viewMode === 'month') {
      const dt = new Date(displayMonth.year, displayMonth.monthIndex, 1);
      return dt.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.monthShort === last.monthShort) {
      return `${first.monthShort} ${first.dayNum} – ${last.dayNum}, ${parseISODate(first.iso).getFullYear()}`;
    }
    return `${first.monthShort} ${first.dayNum} – ${last.monthShort} ${last.dayNum}, ${parseISODate(last.iso).getFullYear()}`;
  }, [viewMode, displayMonth, weekDays]);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setDisplayMonth((prev) => shiftMonth(prev.year, prev.monthIndex, -1));
    } else {
      onSelectDate(shiftDateIso(selectedDate, -7));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setDisplayMonth((prev) => shiftMonth(prev.year, prev.monthIndex, 1));
    } else {
      onSelectDate(shiftDateIso(selectedDate, 7));
    }
  };

  const handleJumpToday = () => {
    const todayDt = parseISODate(TODAY_ISO);
    setDisplayMonth({
      year: todayDt.getFullYear(),
      monthIndex: todayDt.getMonth(),
    });
    onSelectDate(TODAY_ISO);
  };

  const handleInlineAddTask = (e: React.FormEvent) => {
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

  const selectedDayEvents = useMemo(
    () => getEventsForDate(visibleEvents, selectedDate),
    [visibleEvents, selectedDate]
  );
  const selectedDayTasks = tasksByDate[selectedDate] || [];
  const selectedDayCompleted = selectedDayTasks.filter((t) => t.completed).length;
  const selectedJournal = journalDays[selectedDate];
  const selectedDt = parseISODate(selectedDate);

  const getEventColorMeta = (colorId: CalendarEvent['color']) =>
    EVENT_COLORS.find((c) => c.id === colorId) || EVENT_COLORS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-28 lg:pb-14 space-y-5">
      {/* Top Calendar Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#EFEFED] dark:border-[#2A2A2A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA] text-balance">
            {headerTitle}
          </h1>
          <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
            {monthEventOccurrences} event{monthEventOccurrences === 1 ? '' : 's'} ·{' '}
            {monthTaskCount} task{monthTaskCount === 1 ? '' : 's'} this month
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Create Event Button */}
          <button
            type="button"
            onClick={() => onOpenNewEvent(selectedDate)}
            className="inline-flex items-center gap-1.5 px-3.5 min-h-[42px] rounded-xl bg-[#2383E2] text-white text-xs font-medium hover:bg-[#1B70C4] transition-colors whitespace-nowrap shrink-0"
          >
            <CalendarPlus className="w-4 h-4" aria-hidden="true" />
            <span>New Event</span>
          </button>

          {/* Prev / Today / Next */}
          <div className="inline-flex items-center rounded-xl bg-[#F4F3EF] dark:bg-[#242424] p-0.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label={viewMode === 'month' ? 'Previous month' : 'Previous week'}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#37352F] dark:text-[#E6E5E1] hover:bg-white dark:hover:bg-[#333333] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleJumpToday}
              className="px-3 min-h-[40px] rounded-lg text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-white dark:hover:bg-[#333333] transition-colors whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label={viewMode === 'month' ? 'Next month' : 'Next week'}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#37352F] dark:text-[#E6E5E1] hover:bg-white dark:hover:bg-[#333333] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month / Week Segmented Switch */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#242424]">
            <button
              type="button"
              onClick={() => onChangeViewMode('month')}
              className={`px-3 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-[#333333] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774] dark:text-[#9B9A97]'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('week')}
              className={`px-3 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-[#333333] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774] dark:text-[#9B9A97]'
              }`}
            >
              Week
            </button>
          </div>

          {/* Week Start Toggle */}
          <button
            type="button"
            onClick={onToggleWeekStart}
            aria-label="Toggle week start day"
            className="px-3 min-h-[42px] rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E9E9E7] dark:border-[#323232] text-xs font-medium text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] transition-colors whitespace-nowrap"
          >
            {weekStartsOnMonday ? 'Mon–Sun' : 'Sun–Sat'}
          </button>
        </div>
      </div>

      {/* Layer + Event Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Layer Filter */}
        <div className="grid grid-cols-3 sm:inline-flex gap-1 p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#242424] shrink-0">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'events', label: 'Events' },
              { id: 'tasks', label: 'Tasks' },
            ] as const
          ).map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLayerFilter(l.id)}
              className={`px-3 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                layerFilter === l.id
                  ? 'bg-white dark:bg-[#333333] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774] dark:text-[#9B9A97]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Event Category Filter */}
        {layerFilter !== 'tasks' && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(['All', ...EVENT_CATEGORIES] as const).map((cat) => {
              const active = eventCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEventCategoryFilter(cat)}
                  className={`px-3 min-h-[38px] rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#37352F] text-white dark:bg-[#F0EFEA] dark:text-[#191919]'
                      : 'bg-[#F4F3EF] dark:bg-[#242424] text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {viewMode === 'month' ? (
        /* MONTH VIEW: 7-Col Grid + Selected Day Agenda Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Calendar Grid */}
          <div className="lg:col-span-7 rounded-2xl border border-[#EAE9E5] dark:border-[#2C2C2C] bg-white dark:bg-[#1E1E1E] overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-[#EFEFED] dark:border-[#2A2A2A] bg-[#FBFBFA] dark:bg-[#232323]">
              {weekdayHeaders.map((day) => (
                <div
                  key={day}
                  className="py-2.5 text-center text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97]"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#EFEFED] dark:divide-[#2A2A2A]">
              {monthCells.map((cell) => {
                const cellEvents = getEventsForDate(visibleEvents, cell.iso);
                const cellTasks = tasksByDate[cell.iso] || [];
                const openTaskCount = cellTasks.filter((t) => !t.completed).length;
                const hasJournal = Boolean(journalDays[cell.iso]);
                const isSelected = cell.iso === selectedDate;
                const totalItems = cellEvents.length + cellTasks.length;

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => onSelectDate(cell.iso)}
                    aria-label={`${formatReadableDate(cell.iso)}${
                      cellEvents.length > 0
                        ? `, ${cellEvents.length} events`
                        : ''
                    }${cellTasks.length > 0 ? `, ${cellTasks.length} tasks` : ''}`}
                    aria-pressed={isSelected}
                    className={`relative flex flex-col items-center md:items-stretch justify-start p-1.5 md:p-2 min-h-[60px] md:min-h-[104px] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2383E2] ${
                      isSelected
                        ? 'bg-[#F4F8FD] dark:bg-[#2383E2]/12'
                        : cell.inCurrentMonth
                          ? 'bg-white dark:bg-[#1E1E1E] hover:bg-[#F9F8F6] dark:hover:bg-[#252525]'
                          : 'bg-[#FBFBFA] dark:bg-[#1A1A1A] hover:bg-[#F5F4F0] dark:hover:bg-[#222222]'
                    }`}
                  >
                    {/* Top Row: Day Number + Journal indicator */}
                    <div className="w-full flex items-center justify-center md:justify-between gap-1">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold tabular-nums transition-colors ${
                          isSelected
                            ? 'bg-[#37352F] text-white dark:bg-[#F0EFEA] dark:text-[#191919]'
                            : cell.isToday
                              ? 'bg-[#2383E2] text-white'
                              : cell.inCurrentMonth
                                ? 'text-[#37352F] dark:text-[#E6E5E1]'
                                : 'text-[#B4B3AF] dark:text-[#5C5C5A]'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {hasJournal && (
                        <BookOpen
                          className="hidden md:block w-3 h-3 text-[#B57B2E] dark:text-[#DF9F4C] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Mobile Compact Color Bars (Events + Tasks + Journal) */}
                    <div className="mt-1 flex md:hidden flex-wrap items-center justify-center gap-0.5 max-w-[36px] min-h-[6px]">
                      {cellEvents.slice(0, 3).map((evt) => {
                        const cMeta = getEventColorMeta(evt.color);
                        return (
                          <span
                            key={evt.id}
                            className={`w-2.5 h-[3px] rounded-full ${cMeta.barClass}`}
                          />
                        );
                      })}
                      {cellTasks.length > 0 && (
                        <span
                          className={`w-2 h-[3px] rounded-full ${
                            openTaskCount === 0
                              ? 'bg-[#9B9A97]'
                              : 'bg-[#37352F] dark:bg-[#E6E5E1]'
                          }`}
                        />
                      )}
                      {hasJournal && (
                        <span className="w-1.5 h-[3px] rounded-full bg-[#B57B2E] dark:bg-[#DF9F4C]" />
                      )}
                    </div>

                    {/* Desktop Event & Task Previews */}
                    <div className="hidden md:flex flex-col gap-0.5 mt-1.5 w-full overflow-hidden">
                      {cellEvents.slice(0, 2).map((evt) => {
                        const cMeta = getEventColorMeta(evt.color);
                        return (
                          <div
                            key={evt.id}
                            className={`text-[10.5px] leading-tight truncate px-1.5 py-0.5 rounded border ${cMeta.surfaceClass} ${cMeta.textClass} font-medium`}
                          >
                            {!evt.allDay && (
                              <span className="tabular-nums opacity-80 mr-1">
                                {evt.startTime}
                              </span>
                            )}
                            {evt.title}
                          </div>
                        );
                      })}

                      {cellEvents.length < 2 &&
                        cellTasks.slice(0, 2 - cellEvents.length).map((t) => (
                          <div
                            key={t.id}
                            className={`text-[10.5px] leading-tight truncate px-1 py-0.5 rounded ${
                              t.completed
                                ? 'line-through text-[#9B9A97] dark:text-[#6B6B68]'
                                : 'text-[#37352F] dark:text-[#E6E5E1] bg-[#F4F3EF]/80 dark:bg-[#2A2A2A]'
                            }`}
                          >
                            {t.title}
                          </div>
                        ))}

                      {totalItems > 2 && (
                        <div className="text-[10px] font-medium text-[#787774] dark:text-[#9B9A97] px-1 tabular-nums">
                          +{totalItems - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Color Legend Footer */}
            <div className="px-4 py-2.5 border-t border-[#EFEFED] dark:border-[#2A2A2A] bg-[#FBFBFA] dark:bg-[#222222] flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#787774] dark:text-[#9B9A97]">
              {EVENT_COLORS.slice(0, 4).map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1.5">
                  <span className={`w-2.5 h-[3px] rounded-full ${c.barClass}`} />
                  <span>{c.label}</span>
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-[3px] rounded-full bg-[#37352F] dark:bg-[#E6E5E1]" />
                <span>Task</span>
              </span>
            </div>
          </div>

          {/* Selected Day Agenda & Event/Task Scheduler Panel */}
          <section
            aria-label="Selected day agenda"
            className="lg:col-span-5 rounded-2xl border border-[#EAE9E5] dark:border-[#2C2C2C] bg-[#FBFBFA] dark:bg-[#202020] p-4 sm:p-5 space-y-5"
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#787774] dark:text-[#9B9A97] tabular-nums">
                  {selectedDate === TODAY_ISO
                    ? 'Today'
                    : selectedDt.toLocaleDateString('en-US', {
                        weekday: 'long',
                      })}{' '}
                  · {selectedDt.getFullYear()}
                </div>
                <h2 className="mt-0.5 text-lg font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA] truncate">
                  {selectedDt.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <div className="mt-0.5 text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
                  {selectedDayEvents.length} event
                  {selectedDayEvents.length === 1 ? '' : 's'} ·{' '}
                  {selectedDayCompleted}/{selectedDayTasks.length} tasks done
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenDayInToday(selectedDate)}
                className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-xl bg-white dark:bg-[#2A2A2A] border border-[#E6E5E1] dark:border-[#343434] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:border-[#2383E2] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open day</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Events Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
                  Events
                </h3>
                <button
                  type="button"
                  onClick={() => onOpenNewEvent(selectedDate)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:underline min-h-[36px] px-1"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add event</span>
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <button
                  type="button"
                  onClick={() => onOpenNewEvent(selectedDate)}
                  className="w-full py-3.5 px-3 rounded-xl border border-dashed border-[#DFDDD6] dark:border-[#323232] text-xs text-[#787774] dark:text-[#9B9A97] hover:border-[#2383E2] hover:text-[#2383E2] dark:hover:text-[#60A5FA] transition-colors text-center"
                >
                  No events scheduled — tap to add an event
                </button>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((evt) => {
                    const cMeta = getEventColorMeta(evt.color);
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => onSelectEvent(evt)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all hover:opacity-95 ${cMeta.surfaceClass}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-sm font-semibold leading-snug ${cMeta.textClass}`}
                            >
                              {evt.title}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#5F5E5B] dark:text-[#B4B3AF] tabular-nums">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" aria-hidden="true" />
                                {formatEventTimeRange(evt)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{evt.category}</span>
                              {evt.repeat !== 'none' && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="inline-flex items-center gap-1 capitalize">
                                    <Repeat className="w-3 h-3" aria-hidden="true" />
                                    {evt.repeat}
                                  </span>
                                </>
                              )}
                            </div>
                            {evt.location && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-[#787774] dark:text-[#9B9A97] truncate">
                                <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            )}
                          </div>
                          <ChevronRight
                            className="w-4 h-4 text-[#9B9A97] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Day Tasks */}
            {layerFilter !== 'events' && (
              <div className="pt-3 border-t border-[#EFEFED] dark:border-[#2C2C2C] space-y-2">
                <h3 className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
                  Tasks
                </h3>

                <form onSubmit={handleInlineAddTask} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inlineTaskTitle}
                    onChange={(e) => setInlineTaskTitle(e.target.value)}
                    placeholder={`Add task for ${selectedDt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}...`}
                    className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#191919] border border-[#E6E5E1] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
                  />
                  <button
                    type="submit"
                    aria-label="Add task"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] hover:opacity-90 transition-opacity shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                {selectedDayTasks.length === 0 ? (
                  <p className="py-2 text-xs text-[#787774] dark:text-[#9B9A97]">
                    No tasks scheduled for this date.
                  </p>
                ) : (
                  <div className="divide-y divide-[#EFEFED] dark:divide-[#2A2A2A]">
                    {selectedDayTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={onToggleTask}
                        onSelect={onSelectTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Day Journal Snapshot */}
            <div className="pt-3 border-t border-[#EFEFED] dark:border-[#2C2C2C] space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
                  Journal snapshot
                </h3>
                <button
                  type="button"
                  onClick={() => onOpenDayInToday(selectedDate)}
                  className="text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:underline min-h-[36px] px-1"
                >
                  {selectedJournal ? 'Edit entry' : 'Start entry'}
                </button>
              </div>

              {selectedJournal ? (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#191919] border border-[#EAE9E5] dark:border-[#2E2E2E] space-y-1.5">
                  <div className="text-xs font-medium text-[#B57B2E] dark:text-[#DF9F4C] tabular-nums">
                    {selectedJournal.tone} · {selectedJournal.blocks.length} blocks
                  </div>
                  {selectedJournal.focusLine && (
                    <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1]">
                      {selectedJournal.focusLine}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#787774] dark:text-[#9B9A97]">
                  No reflection written for this day yet.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : (
        /* WEEK VIEW: Responsive 7-Day Event & Task Planner */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayEvents = getEventsForDate(visibleEvents, day.iso);
            const dayTasks = tasksByDate[day.iso] || [];
            const dayJournal = journalDays[day.iso];
            const isSelected = day.iso === selectedDate;

            return (
              <div
                key={day.iso}
                className={`flex flex-col rounded-2xl border p-3.5 transition-colors lg:min-h-[320px] ${
                  isSelected
                    ? 'border-[#2383E2] bg-[#F8FBFF] dark:bg-[#2383E2]/10'
                    : 'border-[#EAE9E5] dark:border-[#2C2C2C] bg-[#FBFBFA] dark:bg-[#202020]'
                }`}
              >
                {/* Day Column Header */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
                  <button
                    type="button"
                    onClick={() => onSelectDate(day.iso)}
                    className="flex items-center gap-2 text-left min-h-[36px] min-w-0"
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold tabular-nums shrink-0 ${
                        day.isToday
                          ? 'bg-[#2383E2] text-white'
                          : isSelected
                            ? 'bg-[#37352F] text-white dark:bg-[#F0EFEA] dark:text-[#191919]'
                            : 'bg-[#F0EFEA] dark:bg-[#2A2A2A] text-[#37352F] dark:text-[#E6E5E1]'
                      }`}
                    >
                      {day.dayNum}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#37352F] dark:text-[#F0EFEA] truncate">
                        {day.weekdayShort}
                      </div>
                      <div className="text-[11px] text-[#787774] dark:text-[#9B9A97] tabular-nums">
                        {day.monthShort} {day.dayNum}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenNewEvent(day.iso)}
                    aria-label={`New event for ${day.monthShort} ${day.dayNum}`}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#787774] dark:text-[#9B9A97] hover:text-[#2383E2] dark:hover:text-[#60A5FA] hover:bg-white dark:hover:bg-[#2A2A2A] transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Events in Day Column */}
                {dayEvents.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {dayEvents.map((evt) => {
                      const cMeta = getEventColorMeta(evt.color);
                      return (
                        <button
                          key={evt.id}
                          type="button"
                          onClick={() => onSelectEvent(evt)}
                          className={`w-full text-left p-2 rounded-xl border transition-opacity hover:opacity-90 ${cMeta.surfaceClass}`}
                        >
                          <div className="text-[10px] font-medium text-[#787774] dark:text-[#B4B3AF] tabular-nums">
                            {formatEventTimeRange(evt)} · {evt.category}
                          </div>
                          <div
                            className={`mt-0.5 text-xs font-semibold leading-snug line-clamp-2 ${cMeta.textClass}`}
                          >
                            {evt.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tasks in Day Column */}
                <div className="mt-2.5 flex-1 space-y-1.5">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-start gap-1.5 p-1.5 rounded-xl bg-white dark:bg-[#191919] border border-[#EAE9E5] dark:border-[#2E2E2E]"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleTask(t.id)}
                        aria-label={
                          t.completed
                            ? `Mark "${t.title}" incomplete`
                            : `Mark "${t.title}" complete`
                        }
                        className="min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0"
                      >
                        <span
                          className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                            t.completed
                              ? 'bg-[#2383E2] border-[#2383E2] text-white'
                              : 'border-[#C7C6C2] dark:border-[#4A4A48]'
                          }`}
                        >
                          {t.completed && (
                            <Check className="w-2.5 h-2.5 stroke-[2.75]" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectTask(t)}
                        className={`flex-1 min-w-0 text-left py-1 text-xs leading-snug ${
                          t.completed
                            ? 'line-through text-[#9B9A97]'
                            : 'text-[#37352F] dark:text-[#E6E5E1]'
                        }`}
                      >
                        {t.title}
                      </button>
                    </div>
                  ))}

                  {dayEvents.length === 0 && dayTasks.length === 0 && (
                    <div className="py-3 text-[11px] text-[#9B9A97] dark:text-[#6B6B68]">
                      Open schedule
                    </div>
                  )}
                </div>

                {/* Journal Indicator Footer */}
                <div className="mt-3 pt-2 border-t border-[#EFEFED] dark:border-[#2C2C2C] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDayInToday(day.iso)}
                    className="text-[11px] font-medium text-[#787774] dark:text-[#9B9A97] hover:text-[#2383E2] dark:hover:text-[#60A5FA] text-left min-h-[32px]"
                  >
                    {dayJournal ? `${dayJournal.tone} →` : 'Open day →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
