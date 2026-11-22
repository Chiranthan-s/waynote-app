import { Check, ChevronRight } from 'lucide-react';
import { TaskItem } from '../types/workspace';
import { formatShortDate } from '../utils/dateUtils';

interface TaskRowProps {
  task: TaskItem;
  onToggle: (id: string) => void;
  onSelect: (task: TaskItem) => void;
}

const PRIORITY_LABEL: Record<TaskItem['priority'], { text: string; color: string }> = {
  high: {
    text: 'High priority',
    color: 'text-[#C4554D] dark:text-[#E87A72]',
  },
  medium: {
    text: 'Medium',
    color: 'text-[#B57B2E] dark:text-[#DF9F4C]',
  },
  low: {
    text: 'Low',
    color: 'text-[#787774] dark:text-[#9B9A97]',
  },
};

export function TaskRow({ task, onToggle, onSelect }: TaskRowProps) {
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const priorityInfo = PRIORITY_LABEL[task.priority];

  return (
    <div className="flex items-center gap-1 min-h-[60px] py-1.5 border-b border-[#EFEFED] dark:border-[#2A2A2A] last:border-b-0 group">
      {/* 44x44px minimum touch hitbox for checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        className="min-w-[44px] min-h-[44px] -ml-1.5 flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2383E2] shrink-0"
      >
        <span
          className={`w-[19px] h-[19px] rounded-[5px] border flex items-center justify-center transition-all duration-150 ${
            task.completed
              ? 'bg-[#2383E2] border-[#2383E2] text-white'
              : 'border-[#C7C6C2] dark:border-[#4A4A48] bg-white dark:bg-[#1E1E1E] group-hover:border-[#2383E2]'
          }`}
        >
          {task.completed && <Check className="w-3 h-3 stroke-[2.75]" />}
        </span>
      </button>

      {/* Main row button opening Task Inspector */}
      <button
        type="button"
        onClick={() => onSelect(task)}
        className="flex-1 min-w-0 min-h-[44px] flex items-center justify-between gap-3 py-1.5 px-1.5 rounded-xl text-left hover:bg-[#F7F6F3] dark:hover:bg-[#232323] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2383E2]"
      >
        <div className="min-w-0 flex-1">
          <div
            className={`text-[15px] font-medium leading-snug truncate transition-colors ${
              task.completed
                ? 'line-through text-[#9B9A97] dark:text-[#6B6B68]'
                : 'text-[#37352F] dark:text-[#E6E5E1]'
            }`}
          >
            {task.title}
          </div>
          {/* Zero-pill unboxed metadata with typographic dot separators */}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
            <span className={task.completed ? '' : priorityInfo.color}>
              {priorityInfo.text}
            </span>
            <span aria-hidden="true">·</span>
            <span>{task.category}</span>
            <span aria-hidden="true">·</span>
            <span>{formatShortDate(task.dueDate)}</span>
            {totalSubtasks > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {completedSubtasks}/{totalSubtasks} steps
                </span>
              </>
            )}
          </div>
        </div>
        <ChevronRight
          className="w-4 h-4 text-[#B4B3AF] dark:text-[#5C5C5A] shrink-0"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
