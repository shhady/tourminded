import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Tour from '@/models/Tour';
import Guide from '@/models/Guide';
import { sendPaymentEmails } from '@/lib/mailer';

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

    // Send payment emails
    try {
      const guide = await Guide.findById(tour.guide).populate('user', 'email name');
      const guideUser = guide?.user;
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


