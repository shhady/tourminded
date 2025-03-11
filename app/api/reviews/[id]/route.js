import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { currentUser } from '@clerk/nextjs/server';
import User from '@/models/User';

// GET a single review by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to database
    await connectDB();
    
    // Find review by ID
    const review = await Review.findById(id)
      .populate('user', 'name')
      .populate('tour', 'title')
      .populate('guide', 'name');
    
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT update a review (requires authentication as the user who created it or admin)
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
    const reviewData = await request.json();
    
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
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized (admin or the user who created the review)
    if (user.role !== 'admin' && review.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this review' },
        { status: 403 }
      );
    }
    
    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      reviewData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE a review (requires authentication as the user who created it or admin)
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
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized (admin or the user who created the review)
    if (user.role !== 'admin' && review.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this review' },
        { status: 403 }
      );
    }
    
    // Delete review
    await review.deleteOne();
    
    return NextResponse.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 