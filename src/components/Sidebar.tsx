import {
  BookMarked,
  Calendar,
  CalendarDays,
  CheckSquare,
  FolderOpen,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  StickyNote,
  Sun,
  X,
} from 'lucide-react';
import { ActiveTab, WorkspacePage } from '../types/workspace';
import { PageIcon } from './PageIcon';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  activeTab: ActiveTab;
  selectedPageId: string | null;
  pages: WorkspacePage[];
  activeTaskCount: number;
  activeNoteCount: number;
  darkMode: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectPage: (pageId: string) => void;
  onOpenSearch: () => void;
  onOpenQuickAddPage: () => void;
  onToggleDarkMode: () => void;
  onOpenPrivacy: () => void;
}

export function Sidebar({
  activeTab,
  selectedPageId,
  pages,
  activeTaskCount,
  activeNoteCount,
  darkMode,
  mobileOpen,
  onCloseMobile,
  onSelectTab,
  onSelectPage,
  onOpenSearch,
  onOpenQuickAddPage,
  onToggleDarkMode,
  onOpenPrivacy,
}: SidebarProps) {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'tasks',
      label: 'All Tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      count: activeTaskCount,
    },
    {
      id: 'notes',
      label: 'Notes Studio',
      icon: <StickyNote className="w-4 h-4" />,
      count: activeNoteCount,
    },
    {
      id: 'journal',
      label: 'Journey Log',
      icon: <BookMarked className="w-4 h-4" />,
    },
    {
      id: 'pages',
      label: 'All Pages',
      icon: <FolderOpen className="w-4 h-4" />,
      count: pages.length,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#F7F6F3] dark:bg-[#202020] border-r border-[#E9E9E7] dark:border-[#2C2C2C] text-[#37352F] dark:text-[#E6E5E1]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#EFEFED] dark:border-[#2A2A2A] shrink-0">
        <button
          type="button"
          onClick={() => {
            onSelectTab('today');
            onCloseMobile();
          }}
          className="text-base font-bold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2383E2] rounded-lg px-1 py-1"
        >
          Waynote
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Search */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onOpenSearch();
          }}
          className="w-full flex items-center justify-between px-3 min-h-[44px] rounded-xl bg-white/80 dark:bg-[#2A2A2A] border border-[#E6E5E1] dark:border-[#333333] text-xs font-medium text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Search workspace</span>
          </span>
          <span className="hidden sm:inline font-mono-tabular text-[11px] opacity-70">
            ⌘K
          </span>
        </button>
      </div>

      {/* Primary Views */}
      <nav aria-label="Workspace views" className="px-2.5 py-2 space-y-0.5 shrink-0">
        {navItems.map((item) => {
          const isActive = activeTab === item.id && !selectedPageId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#EAE9E4] dark:bg-[#2E2E2E] text-[#37352F] dark:text-[#F0EFEA]'
                  : 'text-[#5F5E5B] dark:text-[#A4A39E] hover:bg-[#EFEFED] dark:hover:bg-[#282828]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                {item.icon}
                <span className="whitespace-nowrap truncate">{item.label}</span>
              </span>
              {typeof item.count === 'number' && (
                <span className="text-xs text-[#787774] dark:text-[#8E8D89] tabular-nums">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pages Section */}
      <div className="flex-1 overflow-y-auto px-2.5 pt-4 pb-4">
        <div className="flex items-center justify-between px-3 pb-1.5">
          <span className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
            Pages
          </span>
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onOpenQuickAddPage();
            }}
            aria-label="Create new page"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#EAE9E4] dark:hover:bg-[#2E2E2E] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-0.5">
          {pages.map((page) => {
            const isSelected = selectedPageId === page.id;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => {
                  onSelectPage(page.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-2.5 px-3 min-h-[44px] rounded-xl text-sm transition-colors text-left ${
                  isSelected
                    ? 'bg-[#EAE9E4] dark:bg-[#2E2E2E] font-medium text-[#37352F] dark:text-[#F0EFEA]'
                    : 'text-[#5F5E5B] dark:text-[#A4A39E] hover:bg-[#EFEFED] dark:hover:bg-[#282828]'
                }`}
              >
                <PageIcon name={page.icon} className="w-4 h-4 shrink-0 opacity-80" />
                <span className="truncate">{page.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Theme, Install & Privacy Footer */}
      <div className="p-3 border-t border-[#EFEFED] dark:border-[#2A2A2A] space-y-0.5 shrink-0">
        <PWAInstallButton variant="sidebar" />
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-between px-3 min-h-[44px] rounded-xl text-xs font-medium text-[#5F5E5B] dark:text-[#A4A39E] hover:bg-[#EFEFED] dark:hover:bg-[#282828] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            {darkMode ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{darkMode ? 'Light appearance' : 'Dark appearance'}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onOpenPrivacy();
          }}
          className="w-full flex items-center justify-between px-3 min-h-[44px] rounded-xl text-xs font-medium text-[#787774] dark:text-[#8E8D89] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#EFEFED] dark:hover:bg-[#282828] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Privacy Policy</span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex bg-black/40 backdrop-blur-[2px]"
          onClick={onCloseMobile}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="w-[280px] max-w-[82vw] h-full shadow-2xl"
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
