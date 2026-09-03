import React from 'react';
import { clsx } from 'clsx';

const DAY_ABBREVIATIONS = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun'
};

export const WeeklyDayPicker = ({
  days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  selectedDay,
  onDayChange,
  todayDay,
  className = ''
}) => (
  <div className={clsx('flex gap-1.5 overflow-x-auto pb-1 scrollbar-none', className)}>
    {days.map(day => {
      const isSelected = day === selectedDay;
      const isToday = day === todayDay;
      return (
        <button
          key={day}
          onClick={() => onDayChange(day)}
          className={clsx(
            'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all text-center',
            isSelected
              ? 'bg-emerald-600 text-white shadow-md'
              : isToday
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}
        >
          <span className="text-[10px] font-semibold">{DAY_ABBREVIATIONS[day] || day.slice(0, 3)}</span>
          {isToday && !isSelected && (
            <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1" />
          )}
        </button>
      );
    })}
  </div>
);
