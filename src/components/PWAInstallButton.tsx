import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'topbar' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'topbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={
          variant === 'sidebar'
            ? 'w-full flex items-center justify-between px-3 min-h-[44px] rounded-xl text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:bg-[#EFEFED] dark:hover:bg-[#282828] transition-colors whitespace-nowrap'
            : 'inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E6E5E1] dark:border-[#323232] text-xs font-medium text-[#2383E2] dark:text-[#60A5FA] hover:bg-[#EFEFED] dark:hover:bg-[#2E2E2E] transition-colors whitespace-nowrap shrink-0'
        }
      >
        <span className="flex items-center gap-2">
          <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Install App</span>
        </span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'sidebar'
              ? 'w-full flex items-center justify-between px-3 min-h-[44px] rounded-xl text-xs font-medium text-[#5F5E5B] dark:text-[#A4A39E] hover:bg-[#EFEFED] dark:hover:bg-[#282828] transition-colors whitespace-nowrap'
              : 'inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E6E5E1] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#EFEFED] dark:hover:bg-[#2E2E2E] transition-colors whitespace-nowrap shrink-0'
          }
        >
          <span className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Install App</span>
          </span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4"
            onClick={() => setShowIOSGuide(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Install Waynote on iOS"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#E6E5E1] dark:border-[#2F2F2F] p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#37352F] dark:text-[#F0EFEA]">
                  Install on iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="space-y-2.5 text-sm text-[#5F5E5B] dark:text-[#B4B3AF]">
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
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
