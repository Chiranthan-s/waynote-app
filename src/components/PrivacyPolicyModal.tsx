import { useEffect } from 'react';
import { HardDrive, Lock, RotateCcw, ShieldCheck, Share2, WifiOff, X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestReset?: () => void;
  stats: {
    notesCount: number;
    tasksCount: number;
    eventsCount: number;
    pagesCount: number;
    journalCount: number;
  };
}

export function PrivacyPolicyModal({
  isOpen,
  onClose,
  onRequestReset,
  stats,
}: PrivacyPolicyModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Privacy Policy"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[88vh] bg-white dark:bg-[#1E1E1E] rounded-t-3xl sm:rounded-2xl border border-[#E6E5E1] dark:border-[#2F2F2F] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-[#D8D7D3] dark:bg-[#3F3F3D]" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EFEFED] dark:border-[#2C2C2C] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA]"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold text-[#37352F] dark:text-[#F0EFEA]">
              Privacy Policy
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close privacy policy"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm text-[#5F5E5B] dark:text-[#B4B3AF] leading-relaxed">
          <p className="text-[#37352F] dark:text-[#E6E5E1] font-medium">
            Your notes, journal entries, tasks, events, and theme preferences stay
            strictly on your own device.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAE9E5] dark:border-[#303030]">
              <HardDrive
                className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xs font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  100% Local Browser Storage
                </h3>
                <p className="mt-1 text-xs leading-relaxed">
                  Everything you write in Waynote is automatically saved to your
                  browser&apos;s <code className="font-mono-tabular">localStorage</code>{' '}
                  so your workspace remains intact across reloads and offline sessions.
                </p>
                <div className="mt-2 text-[11px] text-[#787774] dark:text-[#9B9A97] tabular-nums">
                  Currently on this device: {stats.notesCount} notes ·{' '}
                  {stats.tasksCount} tasks · {stats.eventsCount} events ·{' '}
                  {stats.journalCount} journal days · {stats.pagesCount} pages
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAE9E5] dark:border-[#303030]">
              <Lock
                className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xs font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  No Servers, Accounts, or Tracking
                </h3>
                <p className="mt-1 text-xs leading-relaxed">
                  Waynote runs entirely on the client. We do not collect, upload,
                  sync, analyze, or sell your personal notes, tasks, or usage habits.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAE9E5] dark:border-[#303030]">
              <Share2
                className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xs font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  Explicit Sharing &amp; Exports Only
                </h3>
                <p className="mt-1 text-xs leading-relaxed">
                  Data only leaves your browser when you click{' '}
                  <strong>Share to WhatsApp</strong> (which opens WhatsApp with that
                  selected note&apos;s text). <strong>Download .txt</strong> and{' '}
                  <strong>Print PDF</strong> export files locally on your device.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAE9E5] dark:border-[#303030]">
              <WifiOff
                className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xs font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  Offline Cache &amp; Your Control
                </h3>
                <p className="mt-1 text-xs leading-relaxed">
                  As a Progressive Web App, Waynote caches app assets on your device
                  for offline use. Clearing your browser site data permanently deletes
                  all stored notes and preferences.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-[#EFEFED] dark:border-[#2C2C2C] flex flex-wrap items-center justify-between gap-2 pb-safe shrink-0">
          {onRequestReset ? (
            <button
              type="button"
              onClick={onRequestReset}
              className="inline-flex items-center gap-1.5 px-3 min-h-[42px] rounded-xl border border-red-500/25 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Reset / Clear Sample Data</span>
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 min-h-[42px] rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Back to workspace
          </button>
        </div>
      </div>
    </div>
  );
}
