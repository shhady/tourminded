import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import { currentUser } from '@clerk/nextjs/server';
import User from '@/models/User';

// GET a single tour by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to database
    await connectDB();
    
    // Find tour by ID
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: tour
    });
    
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT update a tour (requires authentication as the guide who created it or admin)
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
    const tourData = await request.json();
    
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
    
    // Find tour
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized (admin or the guide who created the tour)
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

// DELETE a tour (requires authentication as the tour owner or admin)
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
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the tour
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the tour owner or an admin
    if (tour.guide.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this tour' },
        { status: 403 }
      );
    }
    
    // Delete the tour
    await Tour.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Tour deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 