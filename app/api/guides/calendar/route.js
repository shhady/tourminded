import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';
import axios from 'axios';
import { DateTime } from 'luxon';
import { refreshAccessToken } from '@/lib/google/refreshAccessToken';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email'); // For demo/testing, pass ?email=...

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const guide = await Guide.findOne({ user: user._id });
  if (!guide) return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
  if (!guide.googleCalendar?.accessToken) {
    return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 401 });
  }

  // Check token expiry and refresh if needed
  if (guide.googleCalendar.tokenExpiry && new Date() > guide.googleCalendar.tokenExpiry) {
    try {
      console.log('Access token expired — refreshing...');
      const newAccessToken = await refreshAccessToken(guide);
      guide.googleCalendar.accessToken = newAccessToken; // ensure it's updated for the current request
    } catch (err) {
      return NextResponse.json({ error: 'Token expired and refresh failed' }, { status: 401 });
    }
  }

  // Get current month range
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  try {
    const res = await axios.post(
      'https://www.googleapis.com/calendar/v3/freeBusy',
      {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: guide.googleCalendar.calendarId }],
      },
      {
        headers: {
          Authorization: `Bearer ${guide.googleCalendar.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const busy = res.data.calendars[guide.googleCalendar.calendarId]?.busy || [];
    // Classify busy days using luxon for timezone-aware all-day detection
    const allDayBusyDates = new Set();
    const partialBusyDates = new Set();
    for (const b of busy) {
      const startJerusalem = DateTime.fromISO(b.start, { zone: 'utc' }).setZone('Asia/Jerusalem');
      const endJerusalem = DateTime.fromISO(b.end, { zone: 'utc' }).setZone('Asia/Jerusalem');
      // Improved all-day detection
      const isAllDay =
        startJerusalem.hour === 0 &&
        startJerusalem.minute === 0 &&
        (
          // Ends at midnight next day (classic all-day)
          (endJerusalem.hour === 0 && endJerusalem.minute === 0 && endJerusalem.diff(startJerusalem, 'hours').hours === 24)
          ||
          // Ends at 23:59 or 23:59:59 same day (Google's sometimes format)
          (
            endJerusalem.year === startJerusalem.year &&
            endJerusalem.month === startJerusalem.month &&
            endJerusalem.day === startJerusalem.day &&
            (
              (endJerusalem.hour === 23 && endJerusalem.minute === 59) ||
              (endJerusalem.hour === 23 && endJerusalem.minute === 59 && endJerusalem.second === 59)
            )
          )
        );
      const dateStr = startJerusalem.toISODate();
      // Debug log
      console.log(
        `Busy block: UTC [${b.start} - ${b.end}], Jerusalem [${startJerusalem.toISO()} - ${endJerusalem.toISO()}], classified as: ${isAllDay ? 'ALL-DAY (RED)' : 'PARTIAL (YELLOW)'} on ${dateStr}`
      );
      if (isAllDay) {
        allDayBusyDates.add(dateStr);
      } else {
        if (!allDayBusyDates.has(dateStr)) {
          partialBusyDates.add(dateStr);
        }
      }
    }
    return NextResponse.json({
      allDayBusyDates: Array.from(allDayBusyDates),
      partialBusyDates: Array.from(partialBusyDates),
    });
  } catch (err) {
    console.error('Google Calendar API error:', err.response?.data || err);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
} 