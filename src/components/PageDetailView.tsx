import { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, Trash2, Type } from 'lucide-react';
import { PageIconName, WorkspacePage } from '../types/workspace';
import { COVER_PRESETS, TODAY_ISO } from '../data/seedData';
import { formatShortDate } from '../utils/dateUtils';
import { BlockEditor } from './BlockEditor';
import { CoverImage } from './CoverImage';
import { PAGE_ICON_OPTIONS, PageIcon } from './PageIcon';

interface PageDetailViewProps {
  page: WorkspacePage;
  onBack: () => void;
  onUpdatePage: (updated: WorkspacePage) => void;
  onDeletePage: (pageId: string) => void;
}

export function PageDetailView({
  page,
  onBack,
  onUpdatePage,
  onDeletePage,
}: PageDetailViewProps) {
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const patchPage = (patch: Partial<WorkspacePage>) => {
    onUpdatePage({
      ...page,
      ...patch,
      updatedAt: TODAY_ISO,
    });
  };

  return (
    <div className="pb-28 lg:pb-16">
      {/* Cover Banner */}
      {page.coverUrl && (
        <div className="relative w-full h-36 sm:h-52 bg-[#F4F3EF] dark:bg-[#242424] overflow-hidden">
          <CoverImage
            src={page.coverUrl}
            alt={`${page.title} cover`}
            fallbackTitle={page.title}
            fallbackIcon={page.icon}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Main Page Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6">
        {/* Top Utility Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-2.5 min-h-[44px] -ml-2 rounded-xl text-xs font-medium text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#262626] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Pages</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowCoverPicker((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-medium text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#262626] transition-colors whitespace-nowrap"
            >
              <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{page.coverUrl ? 'Cover' : 'Add cover'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                patchPage({
                  fontStyle: page.fontStyle === 'serif' ? 'sans' : 'serif',
                })
              }
              className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-medium text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#262626] transition-colors whitespace-nowrap"
            >
              <Type className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{page.fontStyle === 'serif' ? 'Serif' : 'Sans'}</span>
            </button>

            <button
              type="button"
              onClick={() => onDeletePage(page.id)}
              aria-label="Delete page"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Cover Selector Drawer */}
        {showCoverPicker && (
          <div className="mb-5 p-3 rounded-2xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E6E5E1] dark:border-[#323232] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#787774] dark:text-[#9B9A97]">
                Choose cover banner
              </span>
              <button
                type="button"
                onClick={() => setShowCoverPicker(false)}
                className="text-xs font-medium text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1] px-2 min-h-[36px]"
              >
                Done
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    patchPage({ coverUrl: preset.url });
                    setShowCoverPicker(false);
                  }}
                  className={`min-h-[52px] rounded-xl overflow-hidden border-2 transition-all ${
                    page.coverUrl === preset.url
                      ? 'border-[#2383E2]'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-14 object-cover"
                  />
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  patchPage({ coverUrl: undefined });
                  setShowCoverPicker(false);
                }}
                className="min-h-[52px] rounded-xl border border-[#E6E5E1] dark:border-[#343434] text-xs font-medium text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
              >
                No cover
              </button>
            </div>
          </div>
        )}

        {/* Page Icon + Editable Title */}
        <div className={`space-y-3 pb-6 border-b border-[#EFEFED] dark:border-[#2A2A2A] ${page.fontStyle === 'serif' ? 'font-editorial' : ''}`}>
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setShowIconPicker((v) => !v)}
              aria-label="Change page icon"
              className="w-12 h-12 rounded-2xl bg-[#F4F3EF] dark:bg-[#262626] border border-[#E6E5E1] dark:border-[#323232] flex items-center justify-center text-[#37352F] dark:text-[#F0EFEA] hover:border-[#2383E2] transition-colors"
            >
              <PageIcon name={page.icon} className="w-6 h-6" />
            </button>

            {showIconPicker && (
              <div className="mt-2 p-2 rounded-2xl bg-white dark:bg-[#242424] border border-[#E6E5E1] dark:border-[#343434] shadow-xl grid grid-cols-4 gap-1.5 z-20 relative w-64">
                {PAGE_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => {
                      patchPage({ icon: opt.name as PageIconName });
                      setShowIconPicker(false);
                    }}
                    className={`min-h-[44px] rounded-xl flex items-center justify-center transition-colors ${
                      page.icon === opt.name
                        ? 'bg-[#2383E2]/15 dark:bg-[#60A5FA]/20 text-[#2383E2] dark:text-[#60A5FA]'
                        : 'text-[#5F5E5B] dark:text-[#A4A39E] hover:bg-[#F4F3EF] dark:hover:bg-[#303030]'
                    }`}
                    aria-label={opt.label}
                  >
                    <PageIcon name={opt.name} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            value={page.title}
            onChange={(e) => patchPage({ title: e.target.value })}
            placeholder="Untitled"
            aria-label="Page title"
            className="w-full bg-transparent text-2xl sm:text-4xl font-bold tracking-tight text-[#37352F] dark:text-[#F0EFEA] placeholder:text-[#B4B3AF] focus:outline-none"
          />

          <input
            type="text"
            value={page.summary}
            onChange={(e) => patchPage({ summary: e.target.value })}
            placeholder="Add a brief subtitle or description..."
            aria-label="Page summary"
            className="w-full bg-transparent text-sm text-[#787774] dark:text-[#9B9A97] placeholder:text-[#B4B3AF] focus:outline-none font-sans"
          />

          <div className="text-xs text-[#787774] dark:text-[#9B9A97] font-sans tabular-nums">
            Updated {formatShortDate(page.updatedAt)} · {page.blocks.length} blocks
          </div>
        </div>

        {/* Page Blocks */}
        <div className="pt-6">
          <BlockEditor
            blocks={page.blocks}
            onChange={(nextBlocks) => patchPage({ blocks: nextBlocks })}
            serifMode={page.fontStyle === 'serif'}
            emptyPrompt="Start writing or tap + Add block..."
          />
        </div>
      </div>
    </div>
  );
}
