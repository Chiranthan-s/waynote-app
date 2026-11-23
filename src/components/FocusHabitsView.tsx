import React, { useMemo, useState } from 'react';
import {
  Check,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  EventColor,
  FocusDayLog,
  HabitCadence,
  HabitItem,
  JournalDay,
  TaskItem,
} from '../types/workspace';
import { EVENT_COLORS } from '../data/seedData';
import { formatReadableDate, getTodayIso } from '../utils/dateUtils';
import {
  ActivityHeatmapDay,
  buildActivityHeatmap,
  getHabitBestStreak,
  getHabitCurrentStreak,
  isHabitScheduledOnDate,
} from '../utils/habitUtils';

export type FocusPresetId = 'focus25' | 'deep45' | 'short5' | 'long15';

export const FOCUS_PRESETS: {
  id: FocusPresetId;
  label: string;
  minutes: number;
  isFocus: boolean;
}[] = [
  { id: 'focus25', label: '25m Focus', minutes: 25, isFocus: true },
  { id: 'deep45', label: '45m Deep', minutes: 45, isFocus: true },
  { id: 'short5', label: '5m Break', minutes: 5, isFocus: false },
  { id: 'long15', label: '15m Rest', minutes: 15, isFocus: false },
];

interface FocusHabitsViewProps {
  todayIso?: string;
  habits: HabitItem[];
  tasks: TaskItem[];
  journalDays: Record<string, JournalDay>;
  focusLogs: Record<string, FocusDayLog>;
  onToggleHabitDate: (habitId: string, dateIso: string) => void;
  onCreateHabit: (payload: {
    title: string;
    cadence: HabitCadence;
    color: EventColor;
  }) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleTask: (taskId: string) => void;
  timerState: {
    presetId: FocusPresetId;
    secondsLeft: number;
    totalSeconds: number;
    isRunning: boolean;
    linkedTaskId: string;
    soundEnabled: boolean;
  };
  onSelectPreset: (presetId: FocusPresetId) => void;
  onToggleTimerRun: () => void;
  onResetTimer: () => void;
  onChangeLinkedTask: (taskId: string) => void;
  onToggleSound: () => void;
}

function formatMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function FocusHabitsView({
  todayIso = getTodayIso(),
  habits,
  tasks,
  journalDays,
  focusLogs,
  onToggleHabitDate,
  onCreateHabit,
  onDeleteHabit,
  onToggleTask,
  timerState,
  onSelectPreset,
  onToggleTimerRun,
  onResetTimer,
  onChangeLinkedTask,
  onToggleSound,
}: FocusHabitsViewProps) {
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCadence, setNewHabitCadence] = useState<HabitCadence>('daily');
  const [newHabitColor, setNewHabitColor] = useState<EventColor>('emerald');

  const heatmapDays = useMemo(
    () =>
      buildActivityHeatmap(todayIso, 70, habits, tasks, journalDays, focusLogs),
    [todayIso, habits, tasks, journalDays, focusLogs]
  );

  const [inspectedDayIso, setInspectedDayIso] = useState<string>(todayIso);
  const inspectedDay: ActivityHeatmapDay =
    heatmapDays.find((d) => d.iso === inspectedDayIso) ||
    heatmapDays[heatmapDays.length - 1];

  // Organize 70 days into 10 weekly columns of 7 days
  const heatmapWeeks = useMemo(() => {
    const cols: ActivityHeatmapDay[][] = [];
    for (let i = 0; i < heatmapDays.length; i += 7) {
      cols.push(heatmapDays.slice(i, i + 7));
    }
    return cols;
  }, [heatmapDays]);

  const last7Isos = useMemo(
    () => heatmapDays.slice(-7).map((d) => d.iso),
    [heatmapDays]
  );

  const scheduledToday = habits.filter((h) =>
    isHabitScheduledOnDate(h, todayIso)
  );
  const doneTodayCount = scheduledToday.filter((h) =>
    h.completedDates.includes(todayIso)
  ).length;
  const activeDaysCount = heatmapDays.filter((d) => d.score > 0).length;

  const todayFocusLog = focusLogs[todayIso] || { sessions: 0, minutes: 0 };
  const activeTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const linkedTask = tasks.find((t) => t.id === timerState.linkedTaskId) || null;

  // Timer circular SVG math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progress =
    timerState.totalSeconds > 0
      ? Math.max(
          0,
          Math.min(1, 1 - timerState.secondsLeft / timerState.totalSeconds)
        )
      : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newHabitTitle.trim();
    if (!trimmed) return;
    onCreateHabit({
      title: trimmed,
      cadence: newHabitCadence,
      color: newHabitColor,
    });
    setNewHabitTitle('');
  };

  const levelClasses: Record<0 | 1 | 2 | 3 | 4, string> = {
    0: 'bg-[#ECEBE6] dark:bg-[#2A2A28]',
    1: 'bg-[#C6DDF7] dark:bg-[#1E3A5F]',
    2: 'bg-[#7BB7F5] dark:bg-[#2563EB]',
    3: 'bg-[#2383E2] dark:bg-[#3B82F6]',
    4: 'bg-[#1458A6] dark:bg-[#60A5FA]',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-28 lg:pb-14 space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#EFEFED] dark:border-[#2A2A2A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA] text-balance">
            Focus &amp; Habits
          </h1>
          <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
            {doneTodayCount}/{scheduledToday.length} habits today ·{' '}
            {todayFocusLog.sessions} focus session
            {todayFocusLog.sessions === 1 ? '' : 's'} ({todayFocusLog.minutes}m) ·{' '}
            {activeDaysCount}/70 active days
          </p>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Deep Focus Timer */}
        <section
          aria-label="Focus timer"
          className="lg:col-span-5 rounded-2xl border border-[#EAE9E5] dark:border-[#2C2C2C] bg-[#FBFBFA] dark:bg-[#202020] p-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#37352F] dark:text-[#F0EFEA]">
              Focus Timer
            </h2>
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={
                timerState.soundEnabled
                  ? 'Mute completion chime'
                  : 'Enable completion chime'
              }
              title={
                timerState.soundEnabled ? 'Sound chime on' : 'Sound chime muted'
              }
              className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-[#787774] dark:text-[#9B9A97] hover:bg-[#EFEFED] dark:hover:bg-[#2A2A2A] transition-colors"
            >
              {timerState.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Preset Mode Switcher */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#F0EFEA] dark:bg-[#282828]">
            {FOCUS_PRESETS.map((preset) => {
              const active = timerState.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset.id)}
                  className={`min-h-[36px] px-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap truncate ${
                    active
                      ? 'bg-white dark:bg-[#353535] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                      : 'text-[#787774] dark:text-[#9B9A97]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Circular Timer Ring */}
          <div className="flex flex-col items-center py-2">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg
                className="w-40 h-40 -rotate-90"
                viewBox="0 0 152 152"
                aria-hidden="true"
              >
                <circle
                  cx="76"
                  cy="76"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-[#EAE9E4] dark:text-[#2D2D2D]"
                />
                <circle
                  cx="76"
                  cy="76"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-[#2383E2] dark:text-[#60A5FA] transition-[stroke-dashoffset] duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono-tabular text-3xl font-semibold tracking-tight text-[#37352F] dark:text-[#F0EFEA] tabular-nums">
                  {formatMMSS(timerState.secondsLeft)}
                </span>
                <span className="mt-1 text-[11px] font-medium text-[#787774] dark:text-[#9B9A97]">
                  {timerState.isRunning ? 'In session' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Play / Pause & Reset */}
            <div className="mt-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onToggleTimerRun}
                className="inline-flex items-center justify-center gap-2 px-6 min-h-[46px] rounded-xl bg-[#2383E2] hover:bg-[#1B70C4] text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                {timerState.isRunning ? (
                  <>
                    <Pause className="w-4 h-4" aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" aria-hidden="true" />
                    <span>Start focus</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onResetTimer}
                aria-label="Reset timer"
                className="min-w-[46px] min-h-[46px] flex items-center justify-center rounded-xl bg-white dark:bg-[#262626] border border-[#E6E5E1] dark:border-[#343434] text-[#5F5E5B] dark:text-[#A4A39E] hover:text-[#37352F] dark:hover:text-[#E6E5E1] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Link Task to Focus Session */}
          <div className="pt-3 border-t border-[#EFEFED] dark:border-[#2C2C2C] space-y-2">
            <label
              htmlFor="focus-task-select"
              className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97]"
            >
              Working on task (optional)
            </label>
            <select
              id="focus-task-select"
              value={timerState.linkedTaskId}
              onChange={(e) => onChangeLinkedTask(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl bg-white dark:bg-[#191919] border border-[#E6E5E1] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] focus:outline-none focus:border-[#2383E2]"
            >
              <option value="">Open deep work (no task linked)</option>
              {activeTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            {linkedTask && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs text-[#5F5E5B] dark:text-[#A4A39E] truncate">
                  {linkedTask.category} · Due {formatReadableDate(linkedTask.dueDate, todayIso)}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleTask(linkedTask.id)}
                  className="inline-flex items-center gap-1 px-2.5 min-h-[34px] rounded-lg bg-[#16A34A]/12 text-[#15803D] dark:text-[#4ADE80] text-xs font-medium hover:bg-[#16A34A]/20 transition-colors whitespace-nowrap shrink-0"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Mark done</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right: 10-Week Consistency Heatmap + Habit Builder */}
        <div className="lg:col-span-7 space-y-5">
          {/* Consistency Heatmap */}
          <section
            aria-label="10-week consistency heatmap"
            className="rounded-2xl border border-[#EAE9E5] dark:border-[#2C2C2C] bg-[#FBFBFA] dark:bg-[#202020] p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  10-Week Consistency
                </h2>
                <p className="text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
                  {formatReadableDate(inspectedDay.iso, todayIso)} ·{' '}
                  {inspectedDay.habitsDone} habits · {inspectedDay.tasksDone} tasks
                  {inspectedDay.hasJournal ? ' · Journal' : ''}
                  {inspectedDay.focusSessions > 0
                    ? ` · ${inspectedDay.focusSessions} focus`
                    : ''}
                </p>
              </div>

              {/* Minimal Legend */}
              <div className="flex items-center gap-1 text-[11px] text-[#787774] dark:text-[#9B9A97]">
                <span>Less</span>
                {([0, 1, 2, 3, 4] as const).map((lvl) => (
                  <span
                    key={lvl}
                    className={`w-3 h-3 rounded-[3px] ${levelClasses[lvl]}`}
                  />
                ))}
                <span>More</span>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar py-1">
              <div className="grid grid-cols-10 gap-1.5 min-w-[280px]">
                {heatmapWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-1.5">
                    {week.map((cell) => {
                      const isInspected = cell.iso === inspectedDay.iso;
                      return (
                        <button
                          key={cell.iso}
                          type="button"
                          onClick={() => setInspectedDayIso(cell.iso)}
                          aria-label={`${formatReadableDate(cell.iso, todayIso)}: ${cell.habitsDone} habits, ${cell.tasksDone} tasks`}
                          className={`w-full aspect-square rounded-[4px] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2383E2] ${
                            levelClasses[cell.level]
                          } ${
                            isInspected
                              ? 'ring-2 ring-[#37352F] dark:ring-[#F0EFEA]'
                              : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Daily Habits Tracker & Builder */}
          <section
            aria-label="Daily habits"
            className="rounded-2xl border border-[#EAE9E5] dark:border-[#2C2C2C] bg-[#FBFBFA] dark:bg-[#202020] p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
              <h2 className="text-sm font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                Daily Habits
              </h2>
              <span className="text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
                {doneTodayCount}/{scheduledToday.length} completed today
              </span>
            </div>

            {/* Add New Habit Form */}
            <form onSubmit={handleAddHabit} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Add a daily habit (e.g. Drink 2L water, Stretch 10m)..."
                  className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#191919] border border-[#E6E5E1] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
                />
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Habit cadence"
                    value={newHabitCadence}
                    onChange={(e) =>
                      setNewHabitCadence(e.target.value as HabitCadence)
                    }
                    className="min-h-[44px] px-3 rounded-xl bg-white dark:bg-[#191919] border border-[#E6E5E1] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] focus:outline-none focus:border-[#2383E2]"
                  >
                    <option value="daily">Every day</option>
                    <option value="weekdays">Weekdays</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add habit</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#787774] dark:text-[#9B9A97] mr-1">
                  Color:
                </span>
                {EVENT_COLORS.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setNewHabitColor(c.id)}
                    aria-label={`Select ${c.label} color`}
                    className="min-w-[28px] min-h-[28px] flex items-center justify-center"
                  >
                    <span
                      className={`w-4 h-4 rounded-full ${c.swatchClass} ${
                        newHabitColor === c.id
                          ? 'ring-2 ring-[#2383E2] ring-offset-1 dark:ring-offset-[#202020]'
                          : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
            </form>

            {/* Habits List */}
            {habits.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-dashed border-[#E6E5E1] dark:border-[#323232]">
                <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1]">
                  No habits tracked yet
                </p>
                <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97]">
                  Add a small daily routine above to start building a streak.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EFEFED] dark:divide-[#2A2A2A]">
                {habits.map((habit) => {
                  const doneToday = habit.completedDates.includes(todayIso);
                  const currentStreak = getHabitCurrentStreak(habit, todayIso);
                  const bestStreak = getHabitBestStreak(habit);
                  const colorMeta =
                    EVENT_COLORS.find((c) => c.id === habit.color) ||
                    EVENT_COLORS[2];

                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between gap-2 py-2.5"
                    >
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onToggleHabitDate(habit.id, todayIso)}
                          aria-label={
                            doneToday
                              ? `Uncheck "${habit.title}" for today`
                              : `Check off "${habit.title}" for today`
                          }
                          className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl shrink-0"
                        >
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              doneToday
                                ? `${colorMeta.barClass} border-transparent text-white`
                                : 'border-[#C7C6C2] dark:border-[#4A4A48] hover:border-[#2383E2]'
                            }`}
                          >
                            {doneToday && (
                              <Check className="w-3.5 h-3.5 stroke-[2.75]" />
                            )}
                          </span>
                        </button>

                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-sm font-medium truncate ${
                              doneToday
                                ? 'text-[#787774] dark:text-[#9B9A97] line-through'
                                : 'text-[#37352F] dark:text-[#F0EFEA]'
                            }`}
                          >
                            {habit.title}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-[#787774] dark:text-[#9B9A97] tabular-nums">
                            <span className="inline-flex items-center gap-1 font-medium text-[#37352F] dark:text-[#D4D3CE]">
                              <Flame
                                className="w-3 h-3 text-[#D97706] dark:text-[#FBBF24]"
                                aria-hidden="true"
                              />
                              {currentStreak}d streak
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Best {bestStreak}d</span>
                            <span aria-hidden="true">·</span>
                            <span className="capitalize">{habit.cadence}</span>
                          </div>
                        </div>
                      </div>

                      {/* Last 7 Days Mini History */}
                      <div className="hidden sm:flex items-center gap-1 shrink-0">
                        {last7Isos.map((iso) => {
                          const completed = habit.completedDates.includes(iso);
                          return (
                            <button
                              key={iso}
                              type="button"
                              onClick={() => onToggleHabitDate(habit.id, iso)}
                              title={`${formatReadableDate(iso, todayIso)}: ${completed ? 'Done' : 'Not done'}`}
                              aria-label={`Toggle ${habit.title} on ${iso}`}
                              className={`w-4 h-4 rounded-[4px] transition-opacity hover:opacity-80 ${
                                completed
                                  ? colorMeta.barClass
                                  : 'bg-[#ECEBE6] dark:bg-[#2E2E2C]'
                              }`}
                            />
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteHabit(habit.id)}
                        aria-label={`Delete habit "${habit.title}"`}
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#9B9A97] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
