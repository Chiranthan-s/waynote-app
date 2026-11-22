import { Plus } from 'lucide-react';
import { WorkspacePage } from '../types/workspace';
import { formatShortDate } from '../utils/dateUtils';
import { CoverImage } from './CoverImage';
import { PageIcon } from './PageIcon';

interface PagesViewProps {
  pages: WorkspacePage[];
  onSelectPage: (pageId: string) => void;
  onOpenNewPage: () => void;
}

export function PagesView({
  pages,
  onSelectPage,
  onOpenNewPage,
}: PagesViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-28 lg:pb-14 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-4 border-b border-[#EFEFED] dark:border-[#2A2A2A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA]">
            Workspace Pages
          </h1>
          <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97] tabular-nums">
            {pages.length} collections &amp; long-form notes
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewPage}
          className="inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-xl bg-[#37352F] dark:bg-[#F0EFEA] text-white dark:text-[#191919] text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New page</span>
        </button>
      </div>

      {/* Pages Grid */}
      {pages.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-[#E6E5E1] dark:border-[#2E2E2E]">
          <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1]">
            No pages yet
          </p>
          <button
            type="button"
            onClick={onOpenNewPage}
            className="mt-3 inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[#2383E2] text-white text-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Create first page</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => onSelectPage(page.id)}
              className="text-left flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#202020] border border-[#EAE9E5] dark:border-[#2C2C2C] hover:border-[#C9C7C0] dark:hover:border-[#444442] transition-colors group"
            >
              {page.coverUrl ? (
                <CoverImage
                  src={page.coverUrl}
                  alt={`${page.title} cover banner`}
                  fallbackTitle={page.title}
                  fallbackIcon={page.icon}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-[#F7F6F3] to-[#ECEAE4] dark:from-[#252525] dark:to-[#1D1D1D] flex items-center justify-center text-[#9B9A97]">
                  <PageIcon name={page.icon} className="w-6 h-6 opacity-60" />
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <PageIcon
                      name={page.icon}
                      className="w-4 h-4 text-[#787774] dark:text-[#9B9A97] shrink-0"
                    />
                    <h2 className="text-base font-semibold text-[#37352F] dark:text-[#F0EFEA] truncate">
                      {page.title}
                    </h2>
                  </div>
                  <p className="mt-1.5 text-xs text-[#5F5E5B] dark:text-[#A4A39E] line-clamp-2 leading-relaxed">
                    {page.summary}
                  </p>
                </div>

                {/* Unboxed metadata */}
                <div className="text-[11px] text-[#787774] dark:text-[#9B9A97] tabular-nums">
                  Updated {formatShortDate(page.updatedAt)} · {page.blocks.length} blocks
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
