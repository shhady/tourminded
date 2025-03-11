import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { currentUser } from '@clerk/nextjs/server';
import User from '@/models/User';

// GET a single booking by ID (requires authentication)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find booking by ID
    const booking = await Booking.findById(id)
      .populate('user', 'name email')
      .populate('tour', 'title price duration durationUnit images')
      .populate('guide', 'name profileImage phone email');
    
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Admin can view any booking
    if (user.role === 'admin') {
      return NextResponse.json({
        success: true,
        data: booking,
      });
    }
    
    // Guide can view bookings for their tours
    if (user.role === 'guide') {
      const Guide = (await import('@/models/Guide')).default;
      const guide = await Guide.findOne({ user: user._id });
      
      if (!guide) {
        return NextResponse.json(
          { success: false, message: 'Guide profile not found' },
          { status: 404 }
        );
      }
      
      if (booking.guide.toString() === guide._id.toString()) {
        return NextResponse.json({
          success: true,
          data: booking,
        });
      }
    }
    
    // User can view their own bookings
    if (booking.user._id.toString() === user._id.toString()) {
      return NextResponse.json({
        success: true,
        data: booking,
      });
    }
    
    // Not authorized
    return NextResponse.json(
      { success: false, message: 'Not authorized to view this booking' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT update a booking status (requires authentication as guide, admin, or booking owner)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
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
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find booking
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Admin can update any booking
    if (user.role === 'admin') {
      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        bookingData,
        { new: true, runValidators: true }
      );
      
      return NextResponse.json({
        success: true,
        data: updatedBooking,
      });
    }
    
    // Guide can update status of bookings for their tours
    if (user.role === 'guide') {
      const Guide = (await import('@/models/Guide')).default;
      const guide = await Guide.findOne({ user: user._id });
      
      if (!guide) {
        return NextResponse.json(
          { success: false, message: 'Guide profile not found' },
          { status: 404 }
        );
      }
      
      if (booking.guide.toString() === guide._id.toString()) {
        // Guide can only update status
        const updatedBooking = await Booking.findByIdAndUpdate(
          id,
          { status: bookingData.status },
          { new: true, runValidators: true }
        );
        
        return NextResponse.json({
          success: true,
          data: updatedBooking,
        });
      }
    }
    
    // User can cancel their own bookings
    if (booking.user.toString() === user._id.toString()) {
      // User can only cancel booking
      if (bookingData.status === 'cancelled') {
        const updatedBooking = await Booking.findByIdAndUpdate(
          id,
          { status: 'cancelled' },
          { new: true, runValidators: true }
        );
        
        return NextResponse.json({
          success: true,
          data: updatedBooking,
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Users can only cancel bookings' },
          { status: 403 }
        );
      }
    }
    
    // Not authorized
    return NextResponse.json(
      { success: false, message: 'Not authorized to update this booking' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE a booking (requires authentication as admin)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete bookings' },
        { status: 403 }
      );
    }
    
    // Find booking
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Delete booking
    await booking.deleteOne();
    
    return NextResponse.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 