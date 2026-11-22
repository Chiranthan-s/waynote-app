import React, { useEffect, useState } from 'react';
import { Bell, Clock, MapPin, Repeat, Trash2, X } from 'lucide-react';
import {
  CalendarEvent,
  EventCategory,
  EventColor,
  EventReminder,
  EventRepeat,
} from '../types/workspace';
import { EVENT_CATEGORIES, EVENT_COLORS, TODAY_ISO } from '../data/seedData';
import { generateId } from '../utils/dateUtils';

interface EventModalSheetProps {
  isOpen: boolean;
  editingEvent: CalendarEvent | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
}

const REPEAT_OPTIONS: { value: EventRepeat; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const REMINDER_OPTIONS: { value: EventReminder; label: string }[] = [
  { value: 'none', label: 'No reminder' },
  { value: '10m', label: '10 minutes before' },
  { value: '30m', label: '30 minutes before' },
  { value: '1h', label: '1 hour before' },
  { value: '1d', label: '1 day before' },
];

export function EventModalSheet({
  isOpen,
  editingEvent,
  defaultDate = TODAY_ISO,
  onClose,
  onSave,
  onDelete,
}: EventModalSheetProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<EventCategory>('Deep Work');
  const [color, setColor] = useState<EventColor>('blue');
  const [location, setLocation] = useState('');
  const [repeat, setRepeat] = useState<EventRepeat>('none');
  const [reminder, setReminder] = useState<EventReminder>('10m');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDate(editingEvent.date);
      setAllDay(editingEvent.allDay);
      setStartTime(editingEvent.startTime || '09:00');
      setEndTime(editingEvent.endTime || '10:00');
      setCategory(editingEvent.category);
      setColor(editingEvent.color);
      setLocation(editingEvent.location);
      setRepeat(editingEvent.repeat);
      setReminder(editingEvent.reminder);
      setDescription(editingEvent.description);
    } else {
      setTitle('');
      setDate(defaultDate);
      setAllDay(false);
      setStartTime('09:00');
      setEndTime('10:00');
      setCategory('Deep Work');
      setColor('blue');
      setLocation('');
      setRepeat('none');
      setReminder('10m');
      setDescription('');
    }
  }, [isOpen, editingEvent, defaultDate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedColorMeta =
    EVENT_COLORS.find((c) => c.id === color) || EVENT_COLORS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const saved: CalendarEvent = {
      id: editingEvent ? editingEvent.id : generateId('evt'),
      title: trimmedTitle,
      date,
      allDay,
      startTime,
      endTime,
      category,
      color,
      location: location.trim(),
      description: description.trim(),
      repeat,
      reminder,
      createdAt: editingEvent
        ? editingEvent.createdAt
        : new Date().toISOString(),
    };
    onSave(saved);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={editingEvent ? 'Customize event' : 'Create calendar event'}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[92vh] sm:max-w-lg bg-white dark:bg-[#1E1E1E] rounded-t-3xl sm:rounded-2xl border border-[#E6E5E1] dark:border-[#2F2F2F] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-[#D8D7D3] dark:bg-[#3F3F3D]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#EFEFED] dark:border-[#2C2C2C] shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-sm ${selectedColorMeta.swatchClass}`}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-[#37352F] dark:text-[#F0EFEA]">
              {editingEvent ? 'Customize Event' : 'New Event'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {editingEvent && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingEvent.id);
                  onClose();
                }}
                aria-label="Delete event"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close event dialog"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#787774] hover:text-[#37352F] dark:hover:text-[#E6E5E1]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
        >
          {/* Live Preview Banner */}
          <div
            className={`p-3 rounded-xl border transition-colors ${selectedColorMeta.surfaceClass}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-sm font-semibold truncate ${selectedColorMeta.textClass}`}
              >
                {title.trim() || 'Event title preview'}
              </span>
              <span className="text-[11px] font-medium text-[#787774] dark:text-[#9B9A97] tabular-nums shrink-0">
                {allDay ? 'All day' : `${startTime} – ${endTime}`}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-[#787774] dark:text-[#9B9A97] truncate">
              {category}
              {location.trim() ? ` · ${location.trim()}` : ''}
              {repeat !== 'none' ? ` · Repeats ${repeat}` : ''}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="event-title-input"
              className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
            >
              Event title
            </label>
            <input
              id="event-title-input"
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product design review, Dentist, Sprint kick-off..."
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-[15px] text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          {/* Date & All-Day Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label
                htmlFor="event-date-input"
                className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
              >
                Date
              </label>
              <input
                id="event-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] tabular-nums focus:outline-none focus:border-[#2383E2]"
              />
            </div>

            <button
              type="button"
              onClick={() => setAllDay((v) => !v)}
              aria-pressed={allDay}
              className={`min-h-[44px] px-3.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-colors ${
                allDay
                  ? 'border-[#2383E2] bg-[#2383E2]/10 dark:bg-[#60A5FA]/15 text-[#2383E2] dark:text-[#60A5FA]'
                  : 'border-[#E9E9E7] dark:border-[#323232] bg-[#F7F6F3] dark:bg-[#262626] text-[#37352F] dark:text-[#E6E5E1]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>All-day event</span>
              </span>
              <span>{allDay ? 'On' : 'Off'}</span>
            </button>
          </div>

          {/* Time Range */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="event-start-time"
                  className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                >
                  Start time
                </label>
                <input
                  id="event-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] tabular-nums focus:outline-none focus:border-[#2383E2]"
                />
              </div>
              <div>
                <label
                  htmlFor="event-end-time"
                  className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
                >
                  End time
                </label>
                <input
                  id="event-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] tabular-nums focus:outline-none focus:border-[#2383E2]"
                />
              </div>
            </div>
          )}

          {/* Category Picker */}
          <div>
            <span className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5">
              Category
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {EVENT_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`min-h-[42px] px-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap truncate ${
                      active
                        ? 'bg-[#37352F] text-white dark:bg-[#F0EFEA] dark:text-[#191919]'
                        : 'bg-[#F4F3EF] dark:bg-[#262626] text-[#5F5E5B] dark:text-[#A4A39E] hover:text-[#37352F] dark:hover:text-[#E6E5E1]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Accent */}
          <div>
            <span className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5">
              Calendar color
            </span>
            <div className="grid grid-cols-6 gap-2">
              {EVENT_COLORS.map((c) => {
                const active = color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    aria-label={`Color ${c.label}`}
                    title={c.label}
                    className={`min-h-[44px] rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      active
                        ? 'border-[#2383E2] bg-[#2383E2]/8'
                        : 'border-[#E9E9E7] dark:border-[#323232] bg-[#FBFBFA] dark:bg-[#242424]'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${c.swatchClass}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="event-location-input"
              className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
            >
              Location or link (optional)
            </label>
            <div className="relative">
              <MapPin
                className="w-4 h-4 text-[#9B9A97] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="event-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Room, café, address, or meeting URL..."
                className="w-full min-h-[44px] pl-9 pr-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2]"
              />
            </div>
          </div>

          {/* Repeat & Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="event-repeat-select"
                className="flex items-center gap-1.5 text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
              >
                <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Repeat</span>
              </label>
              <select
                id="event-repeat-select"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as EventRepeat)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] focus:outline-none focus:border-[#2383E2]"
              >
                {REPEAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="event-reminder-select"
                className="flex items-center gap-1.5 text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
              >
                <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reminder</span>
              </label>
              <select
                id="event-reminder-select"
                value={reminder}
                onChange={(e) => setReminder(e.target.value as EventReminder)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-xs font-medium text-[#37352F] dark:text-[#E6E5E1] focus:outline-none focus:border-[#2383E2]"
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes / Description */}
          <div>
            <label
              htmlFor="event-desc-input"
              className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="event-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda, prep items, or context..."
              className="w-full p-3 rounded-xl bg-[#F7F6F3] dark:bg-[#262626] border border-[#E9E9E7] dark:border-[#323232] text-sm text-[#37352F] dark:text-[#E6E5E1] placeholder:text-[#9B9A97] resize-none focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          <div className="pt-1 pb-safe">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#2383E2] text-white text-sm font-medium hover:bg-[#1B70C4] active:scale-[0.99] transition-all"
            >
              {editingEvent ? 'Save Event Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
