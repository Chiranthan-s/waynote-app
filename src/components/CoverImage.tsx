import { useState } from 'react';
import { PageIcon } from './PageIcon';
import { PageIconName } from '../types/workspace';

interface CoverImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  fallbackIcon?: PageIconName;
  className?: string;
}

export function CoverImage({
  src,
  alt,
  fallbackTitle,
  fallbackIcon = 'FileText',
  className = 'w-full h-36 object-cover',
}: CoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#F4F3EF] via-[#EAE8E1] to-[#E0DDD4] dark:from-[#242424] dark:via-[#2B2B29] dark:to-[#1F1F1E] text-[#787774] dark:text-[#9B9A97] ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="flex items-center gap-2 px-4 py-2">
          <PageIcon name={fallbackIcon} className="w-4 h-4 opacity-70" />
          <span className="text-xs font-medium tracking-tight truncate max-w-[200px]">
            {fallbackTitle}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
