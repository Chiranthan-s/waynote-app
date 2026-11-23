import {
  FocusDayLog,
  HabitItem,
  JournalDay,
  TaskItem,
} from '../types/workspace';
import { parseISODate, shiftDateIso } from './dateUtils';

export function isHabitScheduledOnDate(habit: HabitItem, iso: string): boolean {
  if (habit.cadence === 'daily') return true;
  const day = parseISODate(iso).getDay();
  return day !== 0 && day !== 6;
}

export function getHabitCurrentStreak(
  habit: HabitItem,
  todayIso: string
): number {
  const completedSet = new Set(habit.completedDates);
  let streak = 0;
  let cursor = todayIso;

  // If today is not yet completed, allow streak to count back from yesterday
  if (!completedSet.has(cursor)) {
    cursor = shiftDateIso(cursor, -1);
  }

  for (let i = 0; i < 365; i++) {
    if (!isHabitScheduledOnDate(habit, cursor)) {
      cursor = shiftDateIso(cursor, -1);
      continue;
    }
    if (completedSet.has(cursor)) {
      streak += 1;
      cursor = shiftDateIso(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

export function getHabitBestStreak(habit: HabitItem): number {
  if (habit.completedDates.length === 0) return 0;
  const sorted = [...new Set(habit.completedDates)].sort();
  let best = 0;
  let current = 0;
  let prevIso: string | null = null;

  for (const iso of sorted) {
    if (!prevIso) {
      current = 1;
      best = 1;
      prevIso = iso;
      continue;
    }

    // Walk from prevIso + 1 to iso; if only unscheduled weekend days lie between, streak continues
    let gapCursor = shiftDateIso(prevIso, 1);
    let broken = false;
    let safety = 0;
    while (gapCursor < iso && safety < 14) {
      if (isHabitScheduledOnDate(habit, gapCursor)) {
        broken = true;
        break;
      }
      gapCursor = shiftDateIso(gapCursor, 1);
      safety++;
    }
    if (safety >= 14) broken = true;

    current = broken ? 1 : current + 1;
    if (current > best) best = current;
    prevIso = iso;
  }

  return best;
}

export interface ActivityHeatmapDay {
  iso: string;
  habitsDone: number;
  tasksDone: number;
  hasJournal: boolean;
  focusSessions: number;
  score: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function buildActivityHeatmap(
  todayIso: string,
  daysCount: number,
  habits: HabitItem[],
  tasks: TaskItem[],
  journalDays: Record<string, JournalDay>,
  focusLogs: Record<string, FocusDayLog>
): ActivityHeatmapDay[] {
  const tasksDoneByDate: Record<string, number> = {};
  for (const t of tasks) {
    if (t.completed) {
      tasksDoneByDate[t.dueDate] = (tasksDoneByDate[t.dueDate] || 0) + 1;
    }
  }

  const habitDatesMap: Record<string, number> = {};
  for (const h of habits) {
    for (const d of h.completedDates) {
      habitDatesMap[d] = (habitDatesMap[d] || 0) + 1;
    }
  }

  const result: ActivityHeatmapDay[] = [];
  for (let offset = -(daysCount - 1); offset <= 0; offset++) {
    const iso = shiftDateIso(todayIso, offset);
    const habitsDone = habitDatesMap[iso] || 0;
    const tasksDone = tasksDoneByDate[iso] || 0;
    const j = journalDays[iso];
    const hasJournal = Boolean(
      j && (j.blocks.some((b) => b.content.trim().length > 0) || j.focusLine.trim().length > 0)
    );
    const focusSessions = focusLogs[iso]?.sessions || 0;

    const score = habitsDone + tasksDone + (hasJournal ? 2 : 0) + focusSessions;
    const level: 0 | 1 | 2 | 3 | 4 =
      score === 0 ? 0 : score <= 1 ? 1 : score <= 3 ? 2 : score <= 5 ? 3 : 4;

    result.push({
      iso,
      habitsDone,
      tasksDone,
      hasJournal,
      focusSessions,
      score,
      level,
    });
  }
  return result;
}
