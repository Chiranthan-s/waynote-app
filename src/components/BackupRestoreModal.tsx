import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Database,
  Download,
  Upload,
  X,
} from 'lucide-react';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImportFile: (file: File) => Promise<string | null>;
  stats: {
    tasksCount: number;
    eventsCount: number;
    notesCount: number;
    pagesCount: number;
    journalCount: number;
  };
}

export function BackupRestoreModal({
  isOpen,
  onClose,
  onExport,
  onImportFile,
  stats,
}: BackupRestoreModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setImporting(false);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMessage(null);
    setImporting(true);
    try {
      const error = await onImportFile(file);
      if (error) {
        setErrorMessage(error);
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-restore-title"
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
            <Database
              className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA]"
              aria-hidden="true"
            />
            <h2
              id="backup-restore-title"
              className="text-base font-semibold text-[#37352F] dark:text-[#F0EFEA]"
            >
              Backup &amp; Restore
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close backup dialog"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-xs leading-relaxed text-[#5F5E5B] dark:text-[#B4B3AF]">
            Save a local JSON snapshot of your entire workspace or restore data from
            a previous Waynote backup file.
          </p>

          <div className="p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAE9E5] dark:border-[#303030] text-[11px] text-[#787774] dark:text-[#9B9A97] tabular-nums">
            Ready to backup: {stats.tasksCount} tasks · {stats.eventsCount} events ·{' '}
            {stats.notesCount} notes · {stats.pagesCount} pages ·{' '}
            {stats.journalCount} journal days
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-700 dark:text-red-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={onExport}
              className="w-full flex items-center justify-center gap-2 px-4 min-h-[46px] rounded-xl bg-[#2383E2] hover:bg-[#1B70C4] text-white text-xs font-medium transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Export Backup (.json)</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Select Waynote backup JSON file"
            />

            <button
              type="button"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 min-h-[46px] rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E6E5E1] dark:border-[#343434] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#EFEFED] dark:hover:bg-[#303030] disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                {importing ? 'Restoring backup...' : 'Import Backup (.json)'}
              </span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#EFEFED] dark:border-[#2C2C2C] flex justify-end pb-safe">
          <button
            type="button"
            onClick={onClose}
            className="px-4 min-h-[40px] rounded-xl text-xs font-medium text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
