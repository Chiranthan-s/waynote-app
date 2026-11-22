import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  FileText,
  HelpCircle,
  Mail,
  Sparkles,
  X,
} from 'lucide-react';

interface AboutSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORT_EMAIL = 'waynote.support@gmail.com';

export function AboutSupportModal({
  isOpen,
  onClose,
}: AboutSupportModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
    } catch {
      // ignore clipboard errors on restricted origins
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-support-title"
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
            <HelpCircle
              className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA]"
              aria-hidden="true"
            />
            <h2
              id="about-support-title"
              className="text-base font-semibold text-[#37352F] dark:text-[#F0EFEA]"
            >
              About &amp; Support
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close about and support"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-sm text-[#5F5E5B] dark:text-[#B4B3AF] leading-relaxed">
          {/* Overview */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAE9E5] dark:border-[#303030]">
            <Sparkles
              className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-xs font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                About Waynote
              </h3>
              <p className="mt-1 text-xs leading-relaxed">
                Waynote is a fast, offline-first daily planner, task tracker,
                notes studio, and journal designed to keep your thoughts and
                schedule organized privately on your own device.
              </p>
            </div>
          </div>

          {/* Terms of Use */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAE9E5] dark:border-[#303030]">
            <FileText
              className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-xs font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                Terms of Use
              </h3>
              <p className="mt-1 text-xs leading-relaxed">
                Waynote is provided &ldquo;as-is&rdquo; for personal productivity
                without warranty. Because all notes, tasks, and events live
                exclusively in your browser&apos;s local storage, you are
                responsible for exporting regular backups using{' '}
                <strong>Backup &amp; Restore</strong> before clearing site data
                or switching devices.
              </p>
            </div>
          </div>

          {/* Contact & Feedback */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAE9E5] dark:border-[#303030]">
            <Mail
              className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                Contact &amp; Feedback
              </h3>
              <p className="mt-1 text-xs leading-relaxed">
                Have feedback, feature ideas, or need help? Reach out anytime:
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-[#191919] border border-[#E6E5E1] dark:border-[#323232]">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:underline truncate"
                >
                  {SUPPORT_EMAIL}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-lg bg-[#F4F3EF] dark:bg-[#2A2A2A] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#EAE8E2] dark:hover:bg-[#343434] transition-colors whitespace-nowrap shrink-0"
                >
                  {copied ? (
                    <>
                      <Check
                        className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#4ADE80]"
                        aria-hidden="true"
                      />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-[#EFEFED] dark:border-[#2C2C2C] flex items-center justify-end pb-safe shrink-0">
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
