import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';

// Normalize a date string to UTC midnight
function normalizeToUtcMidnight(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Merge overlapping or touching ranges
function mergeRanges(ranges) {
  if (!Array.isArray(ranges) || ranges.length === 0) return [];
  const sorted = [...ranges]
    .map(r => ({ start: new Date(r.start), end: new Date(r.end), note: r.note }))
    .sort((a, b) => a.start - b.start);

  const result = [];
  for (const r of sorted) {
    if (result.length === 0) {
      result.push(r);
    } else {
      const last = result[result.length - 1];
      // Merge only if overlapping (not merely touching)
      if (r.start <= last.end) {
        if (r.end > last.end) last.end = r.end;
        // Do not merge notes to avoid accidental concatenation; keep first note
      } else {
        result.push(r);
      }
    }
  }
  return result;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const guide = await Guide.findOne({ user: user._id }).select('notAvailable');
    if (!guide) {
      return NextResponse.json({ success: false, message: 'Guide profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: guide.notAvailable || [] });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT supports two modes:
// - mode: 'add' (default) appends/merges provided ranges with existing ones
// - mode: 'replace' replaces all ranges
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const guide = await Guide.findOne({ user: user._id });
    if (!guide) {
      return NextResponse.json({ success: false, message: 'Guide profile not found' }, { status: 404 });
    }

    // Safely parse body (handles empty body without throwing)
    let body;
    try {
      const raw = await request.text();
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }
    const mode = body?.mode === 'replace' ? 'replace' : 'add';
    const inputRanges = Array.isArray(body?.ranges) ? body.ranges : [];
    if (inputRanges.length === 0) {
      return NextResponse.json({ success: false, message: 'ranges is required and must be a non-empty array' }, { status: 400 });
    }

    // Normalize and validate
    const normalized = [];
    for (let i = 0; i < inputRanges.length; i++) {
      const item = inputRanges[i];
      const start = normalizeToUtcMidnight(item.start);
      const end = normalizeToUtcMidnight(item.end ?? item.start);
      if (!start || !end) {
        return NextResponse.json({ success: false, message: `Invalid date in ranges[${i}]` }, { status: 400 });
      }
      if (end < start) {
        return NextResponse.json({ success: false, message: `End must be on/after start in ranges[${i}]` }, { status: 400 });
      }
      normalized.push({ start, end, note: item.note });
    }

    let combined;
    if (mode === 'replace') {
      combined = mergeRanges(normalized);
    } else {
      const existing = Array.isArray(guide.notAvailable) ? guide.notAvailable : [];
      combined = mergeRanges([...existing, ...normalized]);
    }

    guide.notAvailable = combined;
    await guide.save();

    return NextResponse.json({ success: true, data: guide.notAvailable });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}


