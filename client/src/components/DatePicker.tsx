import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface DatePickerProps {
  value: string; // ISO date string 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  label?: string;
  required?: boolean;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label = 'Next Renewal Date',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or fallback to today
  const parseValueToDate = (str: string): Date => {
    if (!str) return new Date();
    const parts = str.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(str);
  };

  const selectedDate = parseValueToDate(value);
  const [viewDate, setViewDate] = useState<Date>(selectedDate);

  // Close calendar popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync viewDate when value changes from outside
  useEffect(() => {
    if (value) {
      setViewDate(parseValueToDate(value));
    }
  }, [value]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const formatToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSelectDay = (day: number, monthOffset: number = 0) => {
    const newDate = new Date(viewYear, viewMonth + monthOffset, day);
    onChange(formatToISO(newDate));
    setIsOpen(false);
  };

  const handleQuickPreset = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    onChange(formatToISO(d));
    setViewDate(d);
    setIsOpen(false);
  };

  const handleQuickMonthPreset = (monthsOffset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsOffset);
    onChange(formatToISO(d));
    setViewDate(d);
    setIsOpen(false);
  };

  // Generate calendar days matrix
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate days remaining from today
  const getDaysDiffFromToday = (target: Date) => {
    const targetMidnight = new Date(target);
    targetMidnight.setHours(0, 0, 0, 0);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((targetMidnight.getTime() - today.getTime()) / msPerDay);
  };

  const daysRemaining = getDaysDiffFromToday(selectedDate);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-emerald-400">*</span>}
          </span>
          {value && (
            <span className={`text-[10px] font-mono font-medium ${
              daysRemaining >= 0 && daysRemaining <= 7 ? 'text-amber-400' : daysRemaining < 0 ? 'text-red-400' : 'text-slate-500'
            }`}>
              {daysRemaining === 0
                ? 'Renews Today'
                : daysRemaining === 1
                ? 'Renews Tomorrow'
                : daysRemaining > 1 && daysRemaining <= 7
                ? `⚡ ${daysRemaining} days (Soon)`
                : daysRemaining < 0
                ? `Overdue (${Math.abs(daysRemaining)}d ago)`
                : `in ${daysRemaining} days`}
            </span>
          )}
        </label>
      )}

      {/* Visual Trigger Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-950 border border-slate-700/90 hover:border-emerald-500/60 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 flex items-center justify-between shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-left group cursor-pointer"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0" />
          <span className={value ? 'text-slate-100 font-medium font-mono text-xs sm:text-sm' : 'text-slate-500 text-xs sm:text-sm'}>
            {value ? formatDate(value) : 'Pick renewal date...'}
          </span>
        </div>
        <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
          <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Interactive Visual Calendar Dropdown Popup */}
      {isOpen && (
        <div className="absolute z-[100] mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl shadow-black/90 p-4 animate-fadeIn text-slate-100 right-0">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-white text-sm">
                {MONTHS[viewMonth]}
              </span>
              <span className="font-bold text-emerald-400 text-sm">
                {viewYear}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewDate(new Date())}
                title="Jump to Current Month"
                className="px-2 py-1 rounded-md text-[11px] font-semibold text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-1 mb-3 pb-2.5 border-b border-slate-800/80 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickPreset(0)}
              className="py-1 px-1 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-center font-medium"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(3)}
              className="py-1 px-1 rounded-md bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 transition-colors text-center font-medium"
              title="Test 3-day urgent renewal alert"
            >
              +3 Days ⚡
            </button>
            <button
              type="button"
              onClick={() => handleQuickMonthPreset(1)}
              className="py-1 px-1 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-center font-medium"
            >
              +1 Month
            </button>
            <button
              type="button"
              onClick={() => handleQuickMonthPreset(12)}
              className="py-1 px-1 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-center font-medium"
            >
              +1 Year
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((d, i) => (
              <span key={i} className="text-[11px] font-bold text-slate-500 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Previous month trailing days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const day = daysInPrevMonth - firstDayIndex + i + 1;
              return (
                <button
                  key={`prev-${i}`}
                  type="button"
                  onClick={() => handleSelectDay(day, -1)}
                  className="h-8 rounded-lg text-slate-600 hover:bg-slate-800/60 hover:text-slate-400 transition-colors flex items-center justify-center text-[11px]"
                >
                  {day}
                </button>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const day = i + 1;
              const thisDate = new Date(viewYear, viewMonth, day);
              thisDate.setHours(0, 0, 0, 0);

              const isSelected =
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === day;

              const isToday = today.getTime() === thisDate.getTime();
              const diffFromToday = getDaysDiffFromToday(thisDate);
              const isUrgentWindow = diffFromToday >= 0 && diffFromToday <= 7;

              return (
                <button
                  key={`curr-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day, 0)}
                  className={`h-8 rounded-lg font-medium transition-all relative flex items-center justify-center text-xs ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 scale-105 z-10'
                      : isToday
                      ? 'border border-emerald-500/60 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40'
                      : isUrgentWindow
                      ? 'text-amber-300 hover:bg-amber-950/40 hover:text-amber-200'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{day}</span>
                  {/* Subtle dot for 7-day urgent alert window */}
                  {isUrgentWindow && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-amber-400 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span className="text-amber-400/90 font-medium">●</span> Within 7d alert window
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
