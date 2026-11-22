import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print fixed bottom-16 lg:bottom-5 left-4 z-40 flex items-center gap-2 rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] px-3 py-2 text-xs font-medium text-white dark:text-[#191919] shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Offline mode · Working from local device cache</span>
    </div>
  );
};
