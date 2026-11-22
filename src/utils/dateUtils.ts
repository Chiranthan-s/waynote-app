import { TODAY_ISO } from '../data/seedData';
import { CalendarEvent } from '../types/workspace';

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatReadableDate(iso: string): string {
  if (iso === TODAY_ISO) {
    const dt = parseISODate(iso);
    return `Today, ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  const dt = parseISODate(iso);
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  if (iso === TODAY_ISO) return 'Today';
  const dt = parseISODate(iso);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getSurroundingDates(centerIso: string, daysBefore = 3, daysAfter = 3): {
  iso: string;
  weekdayShort: string;
  dayNum: number;
  isToday: boolean;
}[] {
  const center = parseISODate(centerIso);
  const result = [];
  for (let offset = -daysBefore; offset <= daysAfter; offset++) {
    const d = new Date(center);
    d.setDate(center.getDate() + offset);
    const iso = formatISODate(d);
    result.push({
      iso,
      weekdayShort: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: iso === TODAY_ISO,
    });
  }
  return result;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function shiftDateIso(iso: string, deltaDays: number): string {
  const dt = parseISODate(iso);
  dt.setDate(dt.getDate() + deltaDays);
  return formatISODate(dt);
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number
): { year: number; monthIndex: number } {
  const dt = new Date(year, monthIndex + delta, 1);
  return { year: dt.getFullYear(), monthIndex: dt.getMonth() };
}

export interface CalendarGridCell {
  iso: string;
  dayNum: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthGridDays(
  year: number,
  monthIndex: number,
  weekStartsOnMonday = false
): CalendarGridCell[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const offset = weekStartsOnMonday
    ? (startWeekday + 6) % 7
    : startWeekday;

  const lastOfMonth = new Date(year, monthIndex + 1, 0);
  const totalDaysNeeded = offset + lastOfMonth.getDate();
  const totalCells = totalDaysNeeded <= 35 ? 35 : 42;

  const cells: CalendarGridCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dt = new Date(year, monthIndex, 1 - offset + i);
    const iso = formatISODate(dt);
    cells.push({
      iso,
      dayNum: dt.getDate(),
      inCurrentMonth: dt.getMonth() === monthIndex && dt.getFullYear() === year,
      isToday: iso === TODAY_ISO,
    });
  }
  return cells;
}

export interface WeekDayInfo {
  iso: string;
  weekdayShort: string;
  weekdayLong: string;
  monthShort: string;
  dayNum: number;
  isToday: boolean;
}

export function getWeekDays(
  anchorIso: string,
  weekStartsOnMonday = false
): WeekDayInfo[] {
  const anchor = parseISODate(anchorIso);
  const dayOfWeek = anchor.getDay();
  const offset = weekStartsOnMonday ? (dayOfWeek + 6) % 7 : dayOfWeek;
  const startOfWeek = new Date(anchor);
  startOfWeek.setDate(anchor.getDate() - offset);

  const days: WeekDayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(startOfWeek);
    dt.setDate(startOfWeek.getDate() + i);
    const iso = formatISODate(dt);
    days.push({
      iso,
      weekdayShort: dt.toLocaleDateString('en-US', { weekday: 'short' }),
      weekdayLong: dt.toLocaleDateString('en-US', { weekday: 'long' }),
      monthShort: dt.toLocaleDateString('en-US', { month: 'short' }),
      dayNum: dt.getDate(),
      isToday: iso === TODAY_ISO,
    });
  }
  return days;
}

export function eventOccursOnDate(
  event: CalendarEvent,
  targetIso: string
): boolean {
  if (targetIso === event.date) return true;
  if (event.repeat === 'none') return false;
  if (targetIso < event.date) return false;

  const start = parseISODate(event.date);
  const target = parseISODate(targetIso);

  if (event.repeat === 'daily') {
    return true;
  }
  if (event.repeat === 'weekly') {
    return start.getDay() === target.getDay();
  }
  if (event.repeat === 'monthly') {
    return start.getDate() === target.getDate();
  }
  return false;
}

export function getEventsForDate(
  events: CalendarEvent[],
  targetIso: string
): CalendarEvent[] {
  return events
    .filter((evt) => eventOccursOnDate(evt, targetIso))
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return a.startTime.localeCompare(b.startTime);
    });
}

export function formatEventTimeRange(event: CalendarEvent): string {
  if (event.allDay) return 'All day';
  if (!event.startTime) return '';
  return event.endTime ? `${event.startTime} – ${event.endTime}` : event.startTime;
}
