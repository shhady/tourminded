import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Tour from '@/models/Tour';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';

// GET all bookings with optional filtering (requires authentication)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const tour = searchParams.get('tour');
    const guide = searchParams.get('guide');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Build filter object based on user role
    let filter = {};
    
    if (user.role === 'admin') {
      // Admin can see all bookings with optional filters
      if (tour) filter.tour = tour;
      if (guide) filter.guide = guide;
      if (status) filter.status = status;
    } else if (user.role === 'guide') {
      // Guide can only see their own bookings
      const Guide = (await import('@/models/Guide')).default;
      const guide = await Guide.findOne({ user: user._id });
      
      if (!guide) {
        return NextResponse.json(
          { success: false, message: 'Guide profile not found' },
          { status: 404 }
        );
      }
      
      filter.guide = guide._id;
      
      // Apply additional filters
      if (tour) filter.tour = tour;
      if (status) filter.status = status;
    } else {
      // Regular user can only see their own bookings
      filter.user = user._id;
      
      // Apply additional filters
      if (tour) filter.tour = tour;
      if (guide) filter.guide = guide;
      if (status) filter.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Find bookings with filters
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('tour', 'title price duration durationUnit')
      .populate('guide', 'name profileImage')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Count total bookings for pagination
    const total = await Booking.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      count: bookings.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST create a new booking (requires authentication)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const bookingData = await request.json();
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if tour exists
    const tour = await Tour.findById(bookingData.tour);
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Set guide from tour
    bookingData.guide = tour.guide;
    
    // Calculate total price
    const totalPrice = tour.price * bookingData.travelers;
    bookingData.totalPrice = totalPrice;
    
    // Create booking
    const booking = await Booking.create({
      ...bookingData,
      user: user._id,
    });
    
    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
} 