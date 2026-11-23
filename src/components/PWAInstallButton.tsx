import React, { useEffect, useState } from 'react';
import {
  Check,
  Download,
  Share,
  Share2,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'topbar' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'topbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [sharedCopied, setSharedCopied] = useState(false);

  useEffect(() => {
    if (!showInstallModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowInstallModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showInstallModal]);

  const handleShareApp = async () => {
    const shareData = {
      title: 'Waynote — Offline Journal, Notes & Tasks',
      text: 'Check out Waynote — a fast, private offline-first daily journal, calendar, habit tracker, and notes app.',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share unsupported; fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.origin);
      setSharedCopied(true);
      window.setTimeout(() => setSharedCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Already running as installed standalone app: hide install CTA in topbar, keep subtle Share button in sidebar
  if (isInstalled) {
    if (variant === 'topbar') return null;
    return (
      <button
        type="button"
        onClick={() => void handleShareApp()}
        className="w-full flex items-center justify-between px-3 min-h-[44px] rounded-xl text-xs font-medium text-[#5F5E5B] dark:text-[#A4A39E] hover:bg-[#EFEFED] dark:hover:bg-[#282828] transition-colors whitespace-nowrap"
      >
        <span className="flex items-center gap-2.5">
          {sharedCopied ? (
            <Check className="w-4 h-4 text-[#16A34A] shrink-0" aria-hidden="true" />
          ) : (
            <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          <span>{sharedCopied ? 'Link copied!' : 'Share Waynote'}</span>
        </span>
      </button>
    );
  }

  const handlePrimaryClick = () => {
    if (isInstallable) {
      void install();
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePrimaryClick}
        className={
          variant === 'sidebar'
            ? 'w-full flex items-center justify-between px-3 min-h-[44px] rounded-xl text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:bg-[#EFEFED] dark:hover:bg-[#282828] transition-colors whitespace-nowrap'
            : 'inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E6E5E1] dark:border-[#323232] text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:bg-[#EFEFED] dark:hover:bg-[#2E2E2E] transition-colors whitespace-nowrap shrink-0'
        }
      >
        <span className="flex items-center gap-2">
          <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{isInstallable ? 'Install App' : 'Get App'}</span>
        </span>
      </button>

      {showInstallModal && (
        <div
          className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] p-0 sm:p-4"
          onClick={() => setShowInstallModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Install Waynote App"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#E6E5E1] dark:border-[#2F2F2F] shadow-2xl overflow-hidden"
          >
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-[#D8D7D3] dark:bg-[#3F3F3D]" />
            </div>

            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EFEFED] dark:border-[#2C2C2C]">
              <div className="flex items-center gap-2">
                <Smartphone
                  className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA]"
                  aria-hidden="true"
                />
                <h3 className="text-base font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  Install Waynote App
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                aria-label="Close install dialog"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 text-sm text-[#5F5E5B] dark:text-[#B4B3AF]">
              <p className="text-[#37352F] dark:text-[#E6E5E1] font-medium">
                Install Waynote on your phone or computer for full-screen focus and
                instant offline access.
              </p>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAE9E5] dark:border-[#303030]">
                <WifiOff
                  className="w-4 h-4 text-[#2383E2] dark:text-[#60A5FA] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="text-xs leading-relaxed">
                  Works 100% offline with zero accounts. Your tasks, habits,
                  events, and notes open instantly from your home screen.
                </div>
              </div>

              {isIOS ? (
                <ol className="space-y-2 text-xs leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#37352F] dark:text-[#E6E5E1]">
                      1.
                    </span>
                    <span>
                      Tap the{' '}
                      <strong className="inline-flex items-center gap-1 text-[#37352F] dark:text-[#E6E5E1]">
                        Share <Share className="w-3.5 h-3.5 inline" aria-hidden="true" />
                      </strong>{' '}
                      button in Safari&apos;s toolbar.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#37352F] dark:text-[#E6E5E1]">
                      2.
                    </span>
                    <span>
                      Scroll down and tap{' '}
                      <strong className="text-[#37352F] dark:text-[#E6E5E1]">
                        Add to Home Screen
                      </strong>
                      .
                    </span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2 text-xs leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#37352F] dark:text-[#E6E5E1]">
                      1.
                    </span>
                    <span>
                      In Chrome, Edge, or Brave, open the browser menu (<strong>⋮</strong>) or click the <strong>Install</strong> icon in the address bar.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#37352F] dark:text-[#E6E5E1]">
                      2.
                    </span>
                    <span>
                      Tap{' '}
                      <strong className="text-[#37352F] dark:text-[#E6E5E1]">
                        Install app / Add to Home screen
                      </strong>{' '}
                      to launch Waynote like a native app.
                    </span>
                  </li>
                </ol>
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-[#EFEFED] dark:border-[#2C2C2C] flex flex-wrap items-center justify-between gap-2 pb-safe">
              <button
                type="button"
                onClick={() => void handleShareApp()}
                className="inline-flex items-center gap-1.5 px-3.5 min-h-[42px] rounded-xl bg-[#F4F3EF] dark:bg-[#2A2A2A] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#EAE8E2] dark:hover:bg-[#343434] transition-colors whitespace-nowrap"
              >
                {sharedCopied ? (
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{sharedCopied ? 'App Link Copied!' : 'Share App'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="px-4 min-h-[42px] rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
