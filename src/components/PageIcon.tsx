import {
  BookOpen,
  CheckSquare,
  Compass,
  Feather,
  FileText,
  Layers,
  Sparkles,
  Sun,
} from 'lucide-react';
import { PageIconName } from '../types/workspace';

interface PageIconProps {
  name: PageIconName;
  className?: string;
}

export const PAGE_ICON_OPTIONS: { name: PageIconName; label: string }[] = [
  { name: 'Feather', label: 'Journal' },
  { name: 'BookOpen', label: 'Reading' },
  { name: 'Compass', label: 'Journey' },
  { name: 'Layers', label: 'Systems' },
  { name: 'CheckSquare', label: 'Checklist' },
  { name: 'Sun', label: 'Morning' },
  { name: 'Sparkles', label: 'Ideas' },
  { name: 'FileText', label: 'Notes' },
];

export function PageIcon({ name, className = 'w-4 h-4' }: PageIconProps) {
  switch (name) {
    case 'Feather':
      return <Feather className={className} aria-hidden="true" />;
    case 'BookOpen':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'Compass':
      return <Compass className={className} aria-hidden="true" />;
    case 'Layers':
      return <Layers className={className} aria-hidden="true" />;
    case 'CheckSquare':
      return <CheckSquare className={className} aria-hidden="true" />;
    case 'Sun':
      return <Sun className={className} aria-hidden="true" />;
    case 'Sparkles':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'FileText':
    default:
      return <FileText className={className} aria-hidden="true" />;
  }
}
