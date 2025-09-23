import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Tour from '@/models/Tour';
import Guide from '@/models/Guide';
import User from '@/models/User';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: clerkUser.id });
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

    // Only the guide of the booking (or admin) can update special requests
    const isAdmin = user.role === 'admin';
    const guide = await Guide.findOne({ user: user._id });
    const isGuideOwner = guide && booking.guide.toString() === guide._id.toString();
    if (!isAdmin && !isGuideOwner) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const items = Array.isArray(body?.specialRequestsCheckBoxes) ? body.specialRequestsCheckBoxes : null;
    if (!items) return NextResponse.json({ success: false, message: 'specialRequestsCheckBoxes is required' }, { status: 400 });

    // Normalize items
    const normalized = items
      .filter(it => it && typeof it.specialRequest === 'string')
      .map(it => ({ specialRequest: it.specialRequest, specialRequestPrice: Number(it.specialRequestPrice) || 0 }));

    booking.specialRequestsCheckBoxes = normalized;

    // Recalculate total as (base tour price) + (extras), where base recalculated from tour & travelers
    const extra = normalized.reduce((sum, it) => sum + (Number(it.specialRequestPrice) || 0), 0);
    if (typeof body.recalculateTotal === 'boolean' ? body.recalculateTotal : true) {
      const tour = await Tour.findById(booking.tour);
      const travelers = Number(booking.travelers) || 1;
      let base = 0;
      if (tour) {
        const pricePer = tour.pricePer || 'group';
        base = pricePer === 'person' ? (Number(tour.price) || 0) * travelers : (Number(tour.price) || 0);
      } else {
        // Fallback to previous total without extras if tour missing
        base = Math.max(0, Number(booking.totalPrice) || 0);
      }
      booking.totalPrice = base + extra;
    }

    await booking.save();
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

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

// Note: Status update logic removed to avoid duplicate exports; special requests PUT is supported above.

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