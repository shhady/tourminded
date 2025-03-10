import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import { getTokenCookie, verifyToken } from '@/lib/auth';

// GET a single tour by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to database
    await connectDB();
    
    // Find tour by ID
    const tour = await Tour.findById(id)
      .populate('guide', 'name profileImage rating reviewCount languages expertise about')
      .populate('locations', 'name description images')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name',
        },
      });
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: tour,
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT update a tour (requires authentication as the guide who created it or admin)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Get token from cookie
    const token = getTokenCookie();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const tourData = await request.json();
    
    // Connect to database
    await connectDB();
    
    // Find tour
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized (admin or the guide who created the tour)
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: user._id });
    
    if (user.role !== 'admin' && (!guide || tour.guide.toString() !== guide._id.toString())) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this tour' },
        { status: 403 }
      );
    }
    
    // Update tour
    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      tourData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedTour,
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE a tour (requires authentication as the guide who created it or admin)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Get token from cookie
    const token = getTokenCookie();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find tour
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized (admin or the guide who created the tour)
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: user._id });
    
    if (user.role !== 'admin' && (!guide || tour.guide.toString() !== guide._id.toString())) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this tour' },
        { status: 403 }
      );
    }
    
    // Delete tour
    await tour.deleteOne();
    
    return NextResponse.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 