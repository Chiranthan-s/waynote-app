import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { TaskItem, TaskPriority } from '../types/workspace';
import { TASK_CATEGORIES } from '../data/seedData';
import { generateId } from '../utils/dateUtils';

interface TaskInspectorSheetProps {
  task: TaskItem | null;
  onClose: () => void;
  onUpdate: (updated: TaskItem) => void;
  onDelete: (id: string) => void;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function TaskInspectorSheet({
  task,
  onClose,
  onUpdate,
  onDelete,
}: TaskInspectorSheetProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (task) {
      window.addEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [task, onClose]);

  if (!task) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;
    onUpdate({
      ...task,
      subtasks: [
        ...task.subtasks,
        { id: generateId('st'), title: trimmed, completed: false },
      ],
    });
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subId: string) => {
    onUpdate({
      ...task,
      subtasks: task.subtasks.map((s) =>
        s.id === subId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const deleteSubtask = (subId: string) => {
    onUpdate({
      ...task,
      subtasks: task.subtasks.filter((s) => s.id !== subId),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-stretch lg:justify-end bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Task details"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[88vh] lg:max-h-none lg:w-[440px] bg-white dark:bg-[#1E1E1E] rounded-t-3xl lg:rounded-t-none lg:rounded-l-2xl border-t lg:border-t-0 lg:border-l border-[#E6E5E1] dark:border-[#2F2F2F] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Mobile grab handle */}
        <div className="lg:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-[#D8D7D3] dark:bg-[#3F3F3D]" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#EFEFED] dark:border-[#2C2C2C] shrink-0">
          <button
            type="button"
            onClick={() => onUpdate({ ...task, completed: !task.completed })}
            className={`inline-flex items-center gap-2 px-3 min-h-[44px] rounded-xl text-xs font-medium transition-colors ${
              task.completed
                ? 'bg-[#2383E2] text-white'
                : 'bg-[#F4F3EF] dark:bg-[#2A2A2A] text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#EAE8E2] dark:hover:bg-[#343434]'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{task.completed ? 'Completed' : 'Mark complete'}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
              aria-label="Delete task"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close task details"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#2A2A2A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="task-title-input" className="sr-only">
              Task title
            </label>
            <textarea
              id="task-title-input"
              rows={2}
              value={task.title}
              onChange={(e) => onUpdate({ ...task, title: e.target.value })}
              placeholder="Task title"
              className="w-full bg-transparent text-xl font-semibold tracking-tight text-[#37352F] dark:text-[#F0EFEA] placeholder:text-[#B4B3AF] resize-none focus:outline-none"
            />
          </div>

          {/* Properties Grid */}
          <div className="space-y-4 pt-2 border-t border-[#EFEFED] dark:border-[#2C2C2C]">
            {/* Due Date */}
            <div className="flex items-center justify-between gap-4 min-h-[44px]">
              <label
                htmlFor="task-due-date"
                className="text-xs font-medium text-[#787774] dark:text-[#9B9A97] w-24 shrink-0"
              >
                Due date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={task.dueDate}
                onChange={(e) => onUpdate({ ...task, dueDate: e.target.value })}
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] tabular-nums focus:outline-none focus:border-[#2383E2]"
              />
            </div>

            {/* Priority Segmented Control */}
            <div className="flex items-center justify-between gap-4 min-h-[44px]">
              <span className="text-xs font-medium text-[#787774] dark:text-[#9B9A97] w-24 shrink-0">
                Priority
              </span>
              <div className="flex-1 grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#262626]">
                {PRIORITIES.map((p) => {
                  const active = task.priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => onUpdate({ ...task, priority: p.value })}
                      className={`min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-white dark:bg-[#343434] text-[#37352F] dark:text-[#F0EFEA] shadow-sm'
                          : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Selector */}
            <div className="flex items-center justify-between gap-4 min-h-[44px]">
              <label
                htmlFor="task-category"
                className="text-xs font-medium text-[#787774] dark:text-[#9B9A97] w-24 shrink-0"
              >
                List
              </label>
              <select
                id="task-category"
                value={task.category}
                onChange={(e) => onUpdate({ ...task, category: e.target.value })}
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] focus:outline-none focus:border-[#2383E2]"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtasks / Steps */}
          <div className="space-y-2.5 pt-3 border-t border-[#EFEFED] dark:border-[#2C2C2C]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
                Action steps
              </h3>
              <span className="text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </span>
            </div>

            <div className="space-y-1">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-1 min-h-[44px] rounded-xl hover:bg-[#F7F6F3] dark:hover:bg-[#252525] pr-1"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(sub.id)}
                    aria-label={sub.completed ? 'Mark step incomplete' : 'Mark step complete'}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                  >
                    <span
                      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                        sub.completed
                          ? 'bg-[#2383E2] border-[#2383E2] text-white'
                          : 'border-[#C7C6C2] dark:border-[#4A4A48]'
                      }`}
                    >
                      {sub.completed && <Check className="w-2.5 h-2.5 stroke-[2.75]" />}
                    </span>
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      sub.completed
                        ? 'line-through text-[#9B9A97]'
                        : 'text-[#37352F] dark:text-[#E6E5E1]'
                    }`}
                  >
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(sub.id)}
                    aria-label="Remove step"
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#9B9A97] hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a step..."
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
              />
              <button
                type="submit"
                aria-label="Add step"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#37352F] dark:bg-[#E6E5E1] text-white dark:text-[#191919] hover:opacity-90 transition-opacity shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-3 border-t border-[#EFEFED] dark:border-[#2C2C2C]">
            <label
              htmlFor="task-notes"
              className="block text-xs font-semibold text-[#787774] dark:text-[#9B9A97]"
            >
              Notes &amp; context
            </label>
            <textarea
              id="task-notes"
              rows={4}
              value={task.notes}
              onChange={(e) => onUpdate({ ...task, notes: e.target.value })}
              placeholder="Add background links, reminders, or thoughts..."
              className="w-full p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm leading-relaxed text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] resize-none focus:outline-none focus:border-[#2383E2]"
            />
          </div>
        </div>

        {/* Fixed Bottom Bar on Mobile */}
        <div className="p-4 pb-safe border-t border-[#EFEFED] dark:border-[#2C2C2C] bg-white dark:bg-[#1E1E1E] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] text-sm font-medium hover:opacity-90 active:scale-[0.99] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
