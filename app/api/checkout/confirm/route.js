import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Tour from '@/models/Tour';
import Guide from '@/models/Guide';
import { sendPaymentEmails } from '@/lib/mailer';

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
      } else {
        result.push(r);
      }
    }
  }
  return result;
}

// Demo endpoint: creates a booking without special requests and marks it paid
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { tour: tourId, dates, travelers } = body || {};

    await connectDB();

    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const tour = await Tour.findById(tourId);
    if (!tour) return NextResponse.json({ success: false, message: 'Tour not found' }, { status: 404 });

    const normalizedDates = {
      startDate: dates?.startDate ? new Date(dates.startDate) : null,
      endDate: dates?.endDate ? new Date(dates.endDate) : undefined,
    };

    const totalPrice =
      (tour.pricePer === 'person'
        ? Number(tour.price || 0) * Number(travelers || 1)
        : Number(tour.price || 0));

    const booking = await Booking.create({
      user: user._id,
      tour: tour._id,
      guide: tour.guide,
      dates: normalizedDates,
      travelers: Number(travelers || 1),
      totalPrice,
      status: 'confirmed',
      paymentStatus: 'paid',
      approvedOfferUser: true,
      approvedOfferGuide: true,
    });

    // Block the paid range on guide availability
    try {
      const guide = await Guide.findById(tour.guide);
      if (guide && normalizedDates.startDate) {
        const start = normalizeToUtcMidnight(normalizedDates.startDate);
        const end = normalizeToUtcMidnight(normalizedDates.endDate || normalizedDates.startDate);
        if (start && end) {
          const existing = Array.isArray(guide.notAvailable) ? guide.notAvailable : [];
          const combined = mergeRanges([...existing, { start, end, note: `Booking ${booking._id}` }]);
          guide.notAvailable = combined;
          await guide.save();
        }
      }
    } catch (availErr) {
      console.error('Failed to update guide availability after payment (checkout confirm):', availErr);
    }

    // Send payment emails
    try {
      const guidePopulated = await Guide.findById(tour.guide).populate('user', 'email name');
      const guideUser = guidePopulated?.user;
      const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
      await sendPaymentEmails({ baseUrl, booking, user, guideUser, tour });
    } catch (mailErr) {
      console.error('Failed to send payment emails:', mailErr);
    }

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating paid booking:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}


