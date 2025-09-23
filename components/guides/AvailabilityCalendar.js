'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

function toUtcMidnight(dateLike) {
  const d = new Date(dateLike);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function dateInRanges(d, ranges) {
  const target = toUtcMidnight(d).getTime();
  for (const r of ranges) {
    const start = toUtcMidnight(r.start).getTime();
    const end = toUtcMidnight(r.end || r.start).getTime();
    if (target >= start && target <= end) return true;
  }
  return false;
}

function buildMonthMatrix(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const startWeekday = first.getUTCDay(); // 0-6 Sun-Sat
  const matrix = [];
  let current = new Date(Date.UTC(year, month, 1 - startWeekday));
  for (let week = 0; week < 6; week++) {
    const row = [];
    for (let day = 0; day < 7; day++) {
      row.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }
    matrix.push(row);
  }
  return matrix;
}

export default function AvailabilityCalendar({ locale = 'en', ranges = [] }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(now.getUTCMonth());

  const matrix = useMemo(() => buildMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' })
        .format(new Date(Date.UTC(viewYear, viewMonth, 1)));
    } catch {
      return `${viewYear}-${viewMonth + 1}`;
    }
  }, [locale, viewYear, viewMonth]);

  const weekdayLabels = locale === 'ar'
    ? ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت']
    : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-gray-100" aria-label="Previous month">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="font-medium flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary-600" />
          {monthLabel}
        </div>
        <button onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-gray-100" aria-label="Next month">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 py-2">
        {weekdayLabels.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {matrix.flat().map((d, idx) => {
          const inMonth = d.getUTCMonth() === viewMonth;
          const unavailable = dateInRanges(d, ranges);
          return (
            <div key={idx} className={`bg-white ${!inMonth ? 'opacity-40' : ''}`}>
              <div className={`h-10 flex items-center justify-center text-sm border ${unavailable ? 'bg-red-100 border-red-300 text-red-700' : 'border-gray-100'}`}>
                {d.getUTCDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


