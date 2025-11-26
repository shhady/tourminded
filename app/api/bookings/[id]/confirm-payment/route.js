import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Guide from '@/models/Guide';
import Tour from '@/models/Tour';
import { sendPaymentEmails } from '@/lib/mailer';

// Demo confirmation endpoint to be called after a successful checkout
// Marks the booking as paid and notifies guide and user by email.
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    // Resolve current user
    const actor = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    if (!actor) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Load booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // Authorization: booking owner or admin can confirm payment in this demo
    const isOwner = booking.user.toString() === String(actor._id);
    const isAdmin = actor.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Mark as paid/confirmed
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.approvedOfferUser = true;
    await booking.save();

    // Fetch related data for emails
    const user = await User.findById(booking.user);
    const tour = await Tour.findById(booking.tour).select('title');
    const guide = await Guide.findById(booking.guide).populate('user', 'email name');
    const guideUser = guide?.user;

    // Send confirmation emails
    try {
      const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
      await sendPaymentEmails({ baseUrl, booking, user, guideUser, tour });
    } catch (mailErr) {
      console.error('Failed to send payment emails:', mailErr);
      // Do not fail the request if email sending fails
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}


