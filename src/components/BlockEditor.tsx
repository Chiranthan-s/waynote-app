import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Heading2,
  Info,
  List,
  Minus,
  MoreHorizontal,
  Plus,
  Quote,
  Trash2,
  Type,
  CheckSquare,
} from 'lucide-react';
import { BlockType, ContentBlock } from '../types/workspace';
import { generateId } from '../utils/dateUtils';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (nextBlocks: ContentBlock[]) => void;
  serifMode?: boolean;
  emptyPrompt?: string;
}

const BLOCK_TYPE_META: {
  type: BlockType;
  label: string;
  hint: string;
  icon: React.ReactNode;
}[] = [
  {
    type: 'text',
    label: 'Text',
    hint: 'Plain journal prose',
    icon: <Type className="w-4 h-4" />,
  },
  {
    type: 'heading',
    label: 'Heading',
    hint: 'Section title',
    icon: <Heading2 className="w-4 h-4" />,
  },
  {
    type: 'todo',
    label: 'To-do',
    hint: 'Interactive checklist item',
    icon: <CheckSquare className="w-4 h-4" />,
  },
  {
    type: 'bullet',
    label: 'Bulleted list',
    hint: 'Concise observation',
    icon: <List className="w-4 h-4" />,
  },
  {
    type: 'callout',
    label: 'Callout',
    hint: 'Highlighted note box',
    icon: <Info className="w-4 h-4" />,
  },
  {
    type: 'quote',
    label: 'Quote',
    hint: 'Captured excerpt',
    icon: <Quote className="w-4 h-4" />,
  },
  {
    type: 'divider',
    label: 'Divider',
    hint: 'Subtle hairline break',
    icon: <Minus className="w-4 h-4" />,
  },
];

export function BlockEditor({
  blocks,
  onChange,
  serifMode = false,
  emptyPrompt = 'Write a reflection or tap + Add block below...',
}: BlockEditorProps) {
  const [activeMenuBlockId, setActiveMenuBlockId] = useState<string | null>(null);
  const [slashPickerBlockId, setSlashPickerBlockId] = useState<string | null>(null);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);

  const inputRefs = useRef<Record<string, HTMLTextAreaElement | HTMLInputElement | null>>({});

  useEffect(() => {
    if (focusBlockId && inputRefs.current[focusBlockId]) {
      const el = inputRefs.current[focusBlockId];
      el?.focus();
      setFocusBlockId(null);
    }
  }, [focusBlockId, blocks]);

  const updateBlock = (id: string, patch: Partial<ContentBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const addBlock = (type: BlockType, afterId?: string) => {
    const newBlock: ContentBlock = {
      id: generateId('blk'),
      type,
      content: '',
      checked: type === 'todo' ? false : undefined,
    };

    if (!afterId) {
      onChange([...blocks, newBlock]);
    } else {
      const idx = blocks.findIndex((b) => b.id === afterId);
      const next = [...blocks];
      next.splice(idx + 1, 0, newBlock);
      onChange(next);
    }
    setShowAddPicker(false);
    setSlashPickerBlockId(null);
    if (type !== 'divider') {
      setFocusBlockId(newBlock.id);
    }
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
    setActiveMenuBlockId(null);
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(idx, 1);
    next.splice(targetIdx, 0, item);
    onChange(next);
    setActiveMenuBlockId(null);
  };

  const convertBlockType = (id: string, type: BlockType) => {
    onChange(
      blocks.map((b) =>
        b.id === id
          ? {
              ...b,
              type,
              content: b.content === '/' ? '' : b.content,
              checked: type === 'todo' ? Boolean(b.checked) : undefined,
            }
          : b
      )
    );
    setActiveMenuBlockId(null);
    setSlashPickerBlockId(null);
    if (type !== 'divider') {
      setFocusBlockId(id);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
    block: ContentBlock
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const continueType: BlockType =
        block.type === 'todo' || block.type === 'bullet' ? block.type : 'text';
      addBlock(continueType, block.id);
    } else if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault();
      const idx = blocks.findIndex((b) => b.id === block.id);
      const prev = blocks[idx - 1];
      deleteBlock(block.id);
      if (prev && prev.type !== 'divider') {
        setFocusBlockId(prev.id);
      }
    }
  };

  const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className={`space-y-1.5 ${serifMode ? 'font-editorial' : ''}`}>
      {blocks.length === 0 && (
        <button
          type="button"
          onClick={() => addBlock('text')}
          className="w-full text-left py-4 px-3 rounded-xl border border-dashed border-[#E3E2DE] dark:border-[#2E2E2E] text-sm text-[#787774] dark:text-[#9B9A97] hover:bg-[#F7F6F3] dark:hover:bg-[#232323] transition-colors min-h-[44px]"
        >
          {emptyPrompt}
        </button>
      )}

      {blocks.map((block, index) => {
        const isMenuOpen = activeMenuBlockId === block.id;
        const isSlashOpen = slashPickerBlockId === block.id;

        return (
          <div key={block.id} className="relative group">
            <div className="flex items-start gap-1">
              {/* Block Content */}
              <div className="flex-1 min-w-0">
                {block.type === 'divider' ? (
                  <div className="py-3 flex items-center">
                    <hr className="w-full border-t border-[#E9E9E7] dark:border-[#2F2F2F]" />
                  </div>
                ) : block.type === 'heading' ? (
                  <input
                    ref={(el) => {
                      inputRefs.current[block.id] = el;
                    }}
                    type="text"
                    value={block.content}
                    placeholder="Heading"
                    onChange={(e) => {
                      const val = e.target.value;
                      updateBlock(block.id, { content: val });
                      setSlashPickerBlockId(val === '/' ? block.id : null);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    className="w-full bg-transparent pt-3 pb-1 text-lg sm:text-xl font-semibold tracking-tight text-[#37352F] dark:text-[#F0EFEA] placeholder:text-[#B4B3AF] dark:placeholder:text-[#5C5C5A] focus:outline-none min-h-[44px]"
                  />
                ) : block.type === 'todo' ? (
                  <div className="flex items-start gap-1.5 py-0.5">
                    <button
                      type="button"
                      onClick={() => updateBlock(block.id, { checked: !block.checked })}
                      aria-label={block.checked ? 'Mark item incomplete' : 'Mark item complete'}
                      className="min-w-[44px] min-h-[44px] -ml-2.5 flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2383E2] shrink-0"
                    >
                      <span
                        className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-colors duration-150 ${
                          block.checked
                            ? 'bg-[#2383E2] border-[#2383E2] text-white'
                            : 'border-[#C7C6C2] dark:border-[#4A4A48] bg-transparent hover:border-[#2383E2]'
                        }`}
                      >
                        {block.checked && <Check className="w-3 h-3 stroke-[2.75]" />}
                      </span>
                    </button>
                    <textarea
                      ref={(el) => {
                        inputRefs.current[block.id] = el;
                        autoResizeTextarea(el);
                      }}
                      rows={1}
                      value={block.content}
                      placeholder="To-do item..."
                      onChange={(e) => {
                        autoResizeTextarea(e.target);
                        const val = e.target.value;
                        updateBlock(block.id, { content: val });
                        setSlashPickerBlockId(val === '/' ? block.id : null);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      className={`w-full bg-transparent py-2.5 text-[15px] leading-relaxed resize-none focus:outline-none placeholder:text-[#B4B3AF] dark:placeholder:text-[#5C5C5A] ${
                        block.checked
                          ? 'line-through text-[#9B9A97] dark:text-[#6B6B68]'
                          : 'text-[#37352F] dark:text-[#E6E5E1]'
                      }`}
                    />
                  </div>
                ) : block.type === 'bullet' ? (
                  <div className="flex items-start gap-2.5 py-0.5 pl-1.5">
                    <span
                      aria-hidden="true"
                      className="mt-[15px] w-1.5 h-1.5 rounded-full bg-[#37352F] dark:bg-[#B8B7B2] shrink-0"
                    />
                    <textarea
                      ref={(el) => {
                        inputRefs.current[block.id] = el;
                        autoResizeTextarea(el);
                      }}
                      rows={1}
                      value={block.content}
                      placeholder="List item..."
                      onChange={(e) => {
                        autoResizeTextarea(e.target);
                        const val = e.target.value;
                        updateBlock(block.id, { content: val });
                        setSlashPickerBlockId(val === '/' ? block.id : null);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      className="w-full bg-transparent py-2 text-[15px] leading-relaxed text-[#37352F] dark:text-[#E6E5E1] resize-none focus:outline-none placeholder:text-[#B4B3AF] dark:placeholder:text-[#5C5C5A]"
                    />
                  </div>
                ) : block.type === 'callout' ? (
                  <div className="my-1.5 flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E9E9E7] dark:border-[#2F2F2F]">
                    <Info
                      className="w-4 h-4 mt-1 text-[#787774] dark:text-[#9B9A97] shrink-0"
                      aria-hidden="true"
                    />
                    <textarea
                      ref={(el) => {
                        inputRefs.current[block.id] = el;
                        autoResizeTextarea(el);
                      }}
                      rows={1}
                      value={block.content}
                      placeholder="Key takeaway or gentle reminder..."
                      onChange={(e) => {
                        autoResizeTextarea(e.target);
                        updateBlock(block.id, { content: e.target.value });
                      }}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      className="w-full bg-transparent text-[14.5px] leading-relaxed text-[#37352F] dark:text-[#E6E5E1] resize-none focus:outline-none placeholder:text-[#B4B3AF] dark:placeholder:text-[#5C5C5A]"
                    />
                  </div>
                ) : block.type === 'quote' ? (
                  <div className="my-1.5 pl-4 pr-3 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#202020] border border-[#EFEFED] dark:border-[#2B2B2B]">
                    <textarea
                      ref={(el) => {
                        inputRefs.current[block.id] = el;
                        autoResizeTextarea(el);
                      }}
                      rows={1}
                      value={block.content}
                      placeholder="Captured quote or excerpt..."
                      onChange={(e) => {
                        autoResizeTextarea(e.target);
                        updateBlock(block.id, { content: e.target.value });
                      }}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      className="w-full bg-transparent font-editorial italic text-[15.5px] leading-relaxed text-[#55534E] dark:text-[#D1D0CB] resize-none focus:outline-none placeholder:text-[#B4B3AF] dark:placeholder:text-[#5C5C5A]"
                    />
                  </div>
                ) : (
                  <textarea
                    ref={(el) => {
                      inputRefs.current[block.id] = el;
                      autoResizeTextarea(el);
                    }}
                    rows={1}
                    value={block.content}
                    placeholder="Type '/' for block types, or start writing..."
                    onChange={(e) => {
                      autoResizeTextarea(e.target);
                      const val = e.target.value;
                      updateBlock(block.id, { content: val });
                      setSlashPickerBlockId(val === '/' ? block.id : null);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    className="w-full bg-transparent py-1.5 text-[15px] leading-[1.65] text-[#37352F] dark:text-[#E6E5E1] resize-none focus:outline-none placeholder:text-[#B4B3AF] dark:placeholder:text-[#5C5C5A] min-h-[40px]"
                  />
                )}
              </div>

              {/* Block Actions Trigger (44x44 touch target) */}
              <button
                type="button"
                onClick={() =>
                  setActiveMenuBlockId(isMenuOpen ? null : block.id)
                }
                aria-label="Block options"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] opacity-70 lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100 transition-opacity shrink-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Slash Picker */}
            {isSlashOpen && (
              <div className="mt-1 mb-2 p-1.5 rounded-xl bg-white dark:bg-[#252525] border border-[#E6E5E1] dark:border-[#343434] shadow-lg z-20 max-w-xs">
                <div className="px-2.5 py-1 text-[11px] font-medium text-[#787774] dark:text-[#9B9A97]">
                  Turn into block
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  {BLOCK_TYPE_META.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => convertBlockType(block.id, item.type)}
                      className="w-full flex items-center gap-3 px-2.5 py-2 min-h-[44px] rounded-lg text-left hover:bg-[#F4F3EF] dark:hover:bg-[#303030] transition-colors"
                    >
                      <span className="text-[#787774] dark:text-[#9B9A97]">
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#37352F] dark:text-[#E6E5E1]">
                          {item.label}
                        </div>
                        <div className="text-xs text-[#787774] dark:text-[#9B9A97]">
                          {item.hint}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Block Action Menu */}
            {isMenuOpen && (
              <div className="mt-1 mb-2 p-1.5 rounded-xl bg-white dark:bg-[#252525] border border-[#E6E5E1] dark:border-[#343434] shadow-lg z-20 flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveBlock(block.id, -1)}
                  className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#303030] disabled:opacity-35"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  Up
                </button>
                <button
                  type="button"
                  disabled={index === blocks.length - 1}
                  onClick={() => moveBlock(block.id, 1)}
                  className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#303030] disabled:opacity-35"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  Down
                </button>
                <div className="h-5 w-px bg-[#E6E5E1] dark:bg-[#343434] mx-1" />
                {BLOCK_TYPE_META.filter((m) => m.type !== block.type).slice(0, 4).map((m) => (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => convertBlockType(block.id, m.type)}
                    className="inline-flex items-center gap-1.5 px-2.5 min-h-[44px] rounded-lg text-xs font-medium text-[#787774] dark:text-[#B4B3AF] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#303030]"
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Block Bar */}
      <div className="pt-2">
        {!showAddPicker ? (
          <button
            type="button"
            onClick={() => setShowAddPicker(true)}
            className="inline-flex items-center gap-2 px-3 min-h-[44px] rounded-lg text-xs font-medium text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E5E1] hover:bg-[#F4F3EF] dark:hover:bg-[#262626] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add block</span>
          </button>
        ) : (
          <div className="p-2 rounded-2xl bg-[#F7F6F3] dark:bg-[#242424] border border-[#E6E5E1] dark:border-[#323232]">
            <div className="flex items-center justify-between px-2 pb-1.5">
              <span className="text-xs font-medium text-[#787774] dark:text-[#9B9A97]">
                Choose block type
              </span>
              <button
                type="button"
                onClick={() => setShowAddPicker(false)}
                className="text-xs font-medium text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1] px-2 min-h-[36px]"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {BLOCK_TYPE_META.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addBlock(item.type)}
                  className="flex items-center gap-2 px-3 min-h-[44px] rounded-xl bg-white dark:bg-[#1C1C1C] border border-[#EAE9E5] dark:border-[#2F2F2F] text-left hover:border-[#2383E2] transition-colors"
                >
                  <span className="text-[#787774] dark:text-[#9B9A97] shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] truncate">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
