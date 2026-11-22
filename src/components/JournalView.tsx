import { useMemo, useState } from 'react';
import { CalendarPlus, ChevronRight } from 'lucide-react';
import { JournalDay, TaskItem } from '../types/workspace';
import { JOURNAL_TONES } from '../data/seedData';
import { formatReadableDate, parseISODate } from '../utils/dateUtils';

interface JournalViewProps {
  journalDays: Record<string, JournalDay>;
  tasks: TaskItem[];
  onOpenDate: (dateIso: string) => void;
}

export function JournalView({
  journalDays,
  tasks,
  onOpenDate,
}: JournalViewProps) {
  const [toneFilter, setToneFilter] = useState<string>('All');
  const [newEntryDate, setNewEntryDate] = useState<string>('2026-11-22');

  const entries = useMemo(() => {
    return Object.values(journalDays)
      .filter((day) => toneFilter === 'All' || day.tone === toneFilter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [journalDays, toneFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-28 lg:pb-14 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#EFEFED] dark:border-[#2A2A2A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA]">
            Journey Log
          </h1>
          <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
            {Object.keys(journalDays).length} daily entries recorded
          </p>
        </div>

        {/* Jump / Start entry for specific date */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="Pick date for journal entry"
            value={newEntryDate}
            onChange={(e) => setNewEntryDate(e.target.value)}
            className="min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E6E5E1] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] tabular-nums focus:outline-none focus:border-[#2383E2]"
          />
          <button
            type="button"
            onClick={() => onOpenDate(newEntryDate)}
            className="inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Open day</span>
          </button>
        </div>
      </div>

      {/* Tone Filter */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {['All', ...JOURNAL_TONES].map((tone) => {
          const active = toneFilter === tone;
          return (
            <button
              key={tone}
              type="button"
              onClick={() => setToneFilter(tone)}
              className={`px-3.5 min-h-[38px] rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#37352F] text-white dark:bg-[#F0EFEA] dark:text-[#191919]'
                  : 'bg-[#F4F3EF] dark:bg-[#242424] text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
              }`}
            >
              {tone}
            </button>
          );
        })}
      </div>

      {/* Timeline Entries */}
      {entries.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-[#E6E5E1] dark:border-[#2E2E2E]">
          <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1]">
            No journal entries for this mood filter
          </p>
          <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97]">
            Choose All above or pick a date to start writing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const dt = parseISODate(entry.date);
            const monthLabel = dt.toLocaleDateString('en-US', { month: 'short' });
            const dayNum = dt.getDate();
            const firstProse =
              entry.blocks.find((b) => b.type === 'text' || b.type === 'callout' || b.type === 'quote')
                ?.content || 'Open daily page to add reflections.';
            const linkedTasks = tasks.filter((t) => t.dueDate === entry.date);
            const doneTasks = linkedTasks.filter((t) => t.completed).length;

            return (
              <button
                key={entry.date}
                type="button"
                onClick={() => onOpenDate(entry.date)}
                className="w-full text-left flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-[#FBFBFA] dark:bg-[#202020] border border-[#EAE9E5] dark:border-[#2C2C2C] hover:border-[#C9C7C0] dark:hover:border-[#444442] transition-colors group"
              >
                {/* Date Calendar Block */}
                <div className="w-12 h-13 rounded-xl bg-[#F4F3EF] dark:bg-[#2A2A2A] flex flex-col items-center justify-center shrink-0">
                  <span className="text-[11px] font-medium text-[#787774] dark:text-[#9B9A97]">
                    {monthLabel}
                  </span>
                  <span className="text-base font-bold text-[#37352F] dark:text-[#F0EFEA] tabular-nums leading-tight">
                    {dayNum}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-[#37352F] dark:text-[#F0EFEA] truncate">
                      {formatReadableDate(entry.date)}
                    </h2>
                    <ChevronRight
                      className="w-4 h-4 text-[#B4B3AF] group-hover:text-[#37352F] dark:group-hover:text-[#E6E5E1] transition-colors shrink-0"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Unboxed Metadata */}
                  <div className="mt-0.5 text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
                    {entry.tone} · {entry.blocks.length} blocks
                    {linkedTasks.length > 0 && ` · ${doneTasks}/${linkedTasks.length} tasks`}
                  </div>

                  {entry.focusLine && (
                    <p className="mt-2 text-sm font-medium text-[#37352F] dark:text-[#E6E5E1] line-clamp-1">
                      {entry.focusLine}
                    </p>
                  )}

                  <p className="mt-1 text-sm text-[#5F5E5B] dark:text-[#A4A39E] line-clamp-2 leading-relaxed">
                    {firstProse}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
