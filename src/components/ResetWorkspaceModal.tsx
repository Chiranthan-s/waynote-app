import { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface ResetWorkspaceModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetWorkspaceModal({
  isOpen,
  onCancel,
  onConfirm,
}: ResetWorkspaceModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-workspace-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white dark:bg-[#1E1E1E] rounded-t-3xl sm:rounded-2xl border border-[#E6E5E1] dark:border-[#2F2F2F] shadow-2xl overflow-hidden"
      >
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#D8D7D3] dark:bg-[#3F3F3D]" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
          <div className="flex items-center gap-2">
            <RotateCcw
              className="w-4 h-4 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
            <h2
              id="reset-workspace-title"
              className="text-base font-semibold text-[#37352F] dark:text-[#F0EFEA]"
            >
              Reset / Clear Sample Data
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-2">
          <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1]">
            Clear all sample tasks, events, and notes to start fresh?
          </p>
          <p className="text-xs leading-relaxed text-[#787774] dark:text-[#9B9A97]">
            This removes all pre-loaded demo tasks, schedule events, notes,
            journal entries, and sample pages from local storage on this device
            and keeps your workspace empty on reload. Your theme preference is
            preserved.
          </p>
        </div>

        <div className="px-5 py-3.5 border-t border-[#EFEFED] dark:border-[#2C2C2C] flex items-center justify-end gap-2 pb-safe">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 min-h-[44px] rounded-xl bg-[#F4F3EF] dark:bg-[#2A2A2A] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#EAE8E2] dark:hover:bg-[#343434] transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors whitespace-nowrap"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
