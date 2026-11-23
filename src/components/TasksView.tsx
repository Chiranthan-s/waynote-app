import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpDown, Plus, Trash2 } from 'lucide-react';
import { TaskItem, TaskPriority } from '../types/workspace';
import { TASK_CATEGORIES } from '../data/seedData';
import { getTodayIso } from '../utils/dateUtils';
import { TaskRow } from './TaskRow';

interface TasksViewProps {
  tasks: TaskItem[];
  sortBy: 'priority' | 'dueDate';
  overdueCount: number;
  onMoveOverdueToToday: () => void;
  onChangeSortBy: (sort: 'priority' | 'dueDate') => void;
  onToggleTask: (id: string) => void;
  onSelectTask: (task: TaskItem) => void;
  onQuickAddTask: (payload: {
    title: string;
    dueDate: string;
    priority: TaskPriority;
    category: string;
    notes: string;
  }) => void;
  onClearCompleted: () => void;
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function TasksView({
  tasks,
  sortBy,
  overdueCount,
  onMoveOverdueToToday,
  onChangeSortBy,
  onToggleTask,
  onSelectTask,
  onQuickAddTask,
  onClearCompleted,
}: TasksViewProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(TASK_CATEGORIES[0]);

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (statusFilter === 'active' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;
        if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (sortBy === 'priority') {
          return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
        }
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, statusFilter, categoryFilter, sortBy]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onQuickAddTask({
      title: trimmed,
      dueDate: getTodayIso(),
      priority: 'medium',
      category: newCategory,
      notes: '',
    });
    setNewTitle('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-28 lg:pb-14 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#EFEFED] dark:border-[#2A2A2A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA]">
            Tasks
          </h1>
          <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
            {activeCount} active · {completedCount} completed · {tasks.length} total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onChangeSortBy(sortBy === 'dueDate' ? 'priority' : 'dueDate')
            }
            className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E9E9E7] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#EFEFED] dark:hover:bg-[#2C2C2C] transition-colors whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sort: {sortBy === 'dueDate' ? 'Due date' : 'Priority'}</span>
          </button>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-medium text-[#787774] dark:text-[#9B9A97] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear done</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Add Bar */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-[#F7F6F3] dark:bg-[#222222] border border-[#EAE9E5] dark:border-[#2E2E2E]"
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new to-do..."
          className="flex-1 min-h-[44px] px-3 rounded-xl bg-white dark:bg-[#191919] border border-[#E6E5E1] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
        />
        <div className="flex items-center gap-2">
          <select
            aria-label="Category for new task"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 sm:flex-none min-h-[44px] px-3 rounded-xl bg-white dark:bg-[#191919] border border-[#E6E5E1] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] focus:outline-none focus:border-[#2383E2]"
          >
            {TASK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[#2383E2] text-white text-xs font-medium hover:bg-[#1B70C4] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Overdue Carry-Over Prompt */}
      {overdueCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-[#FDF6EB] dark:bg-[#2D2417] border border-[#F3DFBD] dark:border-[#493A22]">
          <span className="text-xs font-medium text-[#8C4D04] dark:text-[#FBBF24] tabular-nums">
            {overdueCount} overdue task{overdueCount === 1 ? '' : 's'} waiting from earlier dates
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Segmented Control */}
        <div className="grid grid-cols-3 sm:inline-flex gap-1 p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#242424]">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'completed', label: 'Completed' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 min-h-[38px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-[#333333] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                  : 'text-[#787774] dark:text-[#9B9A97]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter Scroll */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['All', ...TASK_CATEGORIES].map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 min-h-[38px] rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#37352F] text-white dark:bg-[#F0EFEA] dark:text-[#191919]'
                    : 'text-[#787774] dark:text-[#9B9A97] hover:bg-[#F4F3EF] dark:hover:bg-[#262626]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-[#E6E5E1] dark:border-[#2E2E2E]">
          <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1]">
            No tasks match this filter
          </p>
          <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97]">
            Try switching filters or add a new task above.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#191919] rounded-2xl border border-[#EAE9E5] dark:border-[#2B2B2B] px-4 sm:px-5">
          {filteredTasks.map((task) => (
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
  );
}
