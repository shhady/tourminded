import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Tour from '@/models/Tour';
import Guide from '@/models/Guide';
import User from '@/models/User';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

    // Identify actor permissions
    const isAdmin = user.role === 'admin';
    const guide = await Guide.findOne({ user: user._id });
    const isGuideOwner = !!guide && booking.guide.toString() === guide._id.toString();
    const isBookingUser = booking.user.toString() === user._id.toString();

    const body = await request.json();
    const hasItemsInPayload = Array.isArray(body?.specialRequestsCheckBoxes);
    const items = hasItemsInPayload ? body.specialRequestsCheckBoxes : null;

    // Authorization: allow
    // - Admin or guide owner to change items and approvals
    // - Booking user to change items (propose) or set approvedOfferUser
    if (hasItemsInPayload && !(isAdmin || isGuideOwner || isBookingUser)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
    if (!hasItemsInPayload && !(isAdmin || isGuideOwner || isBookingUser)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    let normalized = Array.isArray(items) ? items
      .filter(it => it && typeof it.specialRequest === 'string')
      .map(it => {
        const price = Number(it.specialRequestPrice) || 0;
        const unit = (typeof it.specialRequestPricePerGroupOrPerson === 'string' && ['group','person'].includes(it.specialRequestPricePerGroupOrPerson)) ? it.specialRequestPricePerGroupOrPerson : 'group';
        return {
          specialRequest: it.specialRequest,
          specialRequestPrice: price,
          specialRequestPricePerGroupOrPerson: unit,
        };
      }) : null;

    if (normalized) {
      booking.specialRequestsCheckBoxes = normalized;
    } else {
      normalized = booking.specialRequestsCheckBoxes || [];
    }

    // Recalculate total as (base tour price) + (extras), where base recalculated from tour & travelers
    const travelers = Number(booking.travelers) || 1;
    const extra = normalized.reduce((sum, it) => {
      const price = Number(it.specialRequestPrice) || 0;
      const multiplier = it.specialRequestPricePerGroupOrPerson === 'person' ? travelers : 1;
      return sum + price * multiplier;
    }, 0);
    if (typeof body.recalculateTotal === 'boolean' ? body.recalculateTotal : true) {
      const tour = await Tour.findById(booking.tour);
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

    // Handle approvals
    // If body explicitly sets approvals and actor permitted, apply them
    if (typeof body.approvedOfferUser === 'boolean' && (isBookingUser || isAdmin)) {
      booking.approvedOfferUser = body.approvedOfferUser;
    }
    if (typeof body.approvedOfferGuide === 'boolean' && (isGuideOwner || isAdmin)) {
      booking.approvedOfferGuide = body.approvedOfferGuide;
    }

    // Auto-flow depending on actor and item changes
    const actorIsGuideOrAdmin = isGuideOwner || isAdmin;
    const actorIsUserOrAdmin = isBookingUser || isAdmin;

    if (hasItemsInPayload) {
      if (actorIsGuideOrAdmin) {
        // Guide proposed changes: mark guide approved, user pending unless no extras
        const noExtras = (normalized?.length || 0) === 0;
        if (noExtras) {
          booking.approvedOfferGuide = true;
          booking.approvedOfferUser = true;
          booking.status = 'completed';
        } else {
          booking.approvedOfferGuide = true;
          booking.approvedOfferUser = false;
        }
      } else if (actorIsUserOrAdmin) {
        // User proposed changes: mark user approved, guide pending
        booking.approvedOfferUser = true;
        booking.approvedOfferGuide = false;
      }
    } else {
      // No item changes: approvals can finalize
      if (body.approvedOfferGuide === true && actorIsGuideOrAdmin) {
        booking.approvedOfferGuide = true;
        booking.approvedOfferUser = true;
        booking.status = 'completed';
      }
      if (body.approvedOfferUser === true && actorIsUserOrAdmin) {
        booking.approvedOfferUser = true;
        booking.approvedOfferGuide = true;
        booking.status = 'completed';
      }
    }

    // If both approved, mark completed
    if (booking.approvedOfferGuide && booking.approvedOfferUser) {
      booking.status = 'completed';
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
    
    // Get current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
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
    
    // Get current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    
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