import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';
import Booking from '@/models/Booking';
import Tour from '@/models/Tour';
import Review from '@/models/Review';

export async function GET(request, { params }) {
  try {
    // Get the current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get guide ID from params
    const { id } = params;
    
    // Find the user making the request
    const requestingUser =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the guide
    const guide = await Guide.findById(id);
    
    if (!guide) {
      return NextResponse.json(
        { success: false, message: 'Guide not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the guide owner or an admin
    const isOwner = guide.user.toString() === requestingUser._id.toString();
    const isAdmin = requestingUser.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to access this guide data' },
        { status: 403 }
      );
    }
    
    // Get stats
    const bookings = await Booking.countDocuments({ guide: id });
    const tours = await Tour.countDocuments({ guide: id });
    const reviews = await Review.countDocuments({ guide: id });
    
    // Get upcoming bookings
    const upcomingBookings = await Booking.find({ 
      guide: id,
      status: 'confirmed',
      'dates.startDate': { $gte: new Date() }
    })
      .populate('user', 'name')
      .populate('tour', 'title')
      .sort({ 'dates.startDate': 1 })
      .limit(5);
    
    return NextResponse.json({
      success: true,
      bookings,
      tours,
      reviews,
      upcomingBookings
    });
    
  } catch (error) {
    console.error('Error fetching guide stats:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 