"use client";
import React, { useEffect, useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function GuideCalendar({ email }) {
  const [allDayBusyDates, setAllDayBusyDates] = useState([]);
  const [partialBusyDates, setPartialBusyDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch(`/api/guides/calendar?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.allDayBusyDates || data.partialBusyDates) {
          setAllDayBusyDates(data.allDayBusyDates || []);
          setPartialBusyDates(data.partialBusyDates || []);
        } else if (data.busyDates) {
          // fallback for old API
          setAllDayBusyDates(data.busyDates);
          setPartialBusyDates([]);
        } else setError(data.error || "Unknown error");
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch calendar");
        setLoading(false);
      });
  }, [email]);

  // Get current month info
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  // Build calendar grid
  const calendar = [];
  let day = 1;
  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < startDay) || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
        day++;
      }
    }
    calendar.push(week);
  }

  if (loading) return <div className="py-8 text-center text-gray-500">Loading calendar...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-4 mt-8">
      <h2 className="text-lg font-bold mb-4 text-center">Your Google Calendar (Current Month)</h2>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(d => (
          <div key={d} className="text-xs font-semibold text-center text-gray-500">{d}</div>
        ))}
      </div>
      {calendar.map((week, i) => (
        <div key={i} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((d, j) => {
            if (!d) return <div key={j} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isAllDay = allDayBusyDates.includes(dateStr);
            const isPartial = partialBusyDates.includes(dateStr);
            let bg = "bg-gray-100 text-gray-800";
            if (isAllDay) bg = "bg-red-500 text-white";
            else if (isPartial) bg = "bg-yellow-300 text-gray-900";
            return (
              <div
                key={j}
                className={`h-9 flex items-center justify-center rounded-md font-medium text-sm ${bg}`}
              >
                {d}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
} 