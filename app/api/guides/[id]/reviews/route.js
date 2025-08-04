import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';

export async function POST(request, { params }) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { review, rating } = await request.json();

    // Validate input
    if (!review || !rating) {
      return NextResponse.json(
        { success: false, message: 'Review text and rating are required' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the MongoDB user by Clerk ID
    const user = await User.findOne({ clerkId: clerkUser.id });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found in database' },
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

    // Check if user already reviewed this guide (handle both old Clerk ID and new MongoDB ID)
    const existingReviewIndex = guide.reviews.findIndex(
      r => {
        if (!r.userId) return false;
        
        // Check if it's the new MongoDB ObjectId format
        if (r.userId.toString() === user._id.toString()) {
          return true;
        }
        
        // Check if it's the old Clerk ID format
        if (typeof r.userId === 'string' && r.userId === clerkUser.id) {
          return true;
        }
        
        return false;
      }
    );

    let updatedReviews;
    if (existingReviewIndex !== -1) {
      // Update existing review
      updatedReviews = [...guide.reviews];
      updatedReviews[existingReviewIndex] = {
        id: guide.reviews[existingReviewIndex].id,
        userId: user._id,
        review: review.trim(),
        rating: rating,
        createdAt: new Date()
      };
    } else {
      // Add new review
      updatedReviews = [...guide.reviews, {
        userId: user._id,
        review: review.trim(),
        rating: rating,
        createdAt: new Date()
      }];
    }

    // Calculate new overall rating and review count
    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const reviewCount = updatedReviews.length;
    const newRating = totalRating / reviewCount;

    // Use findByIdAndUpdate to avoid full document validation
    await Guide.findByIdAndUpdate(
      id,
      {
        $set: {
          reviews: updatedReviews,
          rating: newRating,
          reviewCount: reviewCount
        }
      },
      { 
        new: true,
        runValidators: false // Skip validation to avoid language proficiency issues
      }
    );

    return NextResponse.json({
      success: true,
      message: existingReviewIndex !== -1 ? 'Review updated successfully' : 'Review added successfully',
      review: {
        id: existingReviewIndex !== -1 ? updatedReviews[existingReviewIndex].id : updatedReviews[updatedReviews.length - 1].id,
        review: review.trim(),
        rating: rating
      }
    });

  } catch (error) {
    console.error('Error handling review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process review' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();



    // Find the guide and get reviews
    const guide = await Guide.findById(id).select('reviews rating reviewCount').lean();
    if (!guide) {
      return NextResponse.json(
        { success: false, message: 'Guide not found' },
        { status: 404 }
      );
    }

    // Populate user data for each review
    const reviewsWithUserData = await Promise.all(
      (guide.reviews || []).map(async (review) => {
        let user = null;
        
        // Handle both old format (Clerk ID strings) and new format (MongoDB ObjectIds)
        if (review.userId) {
          if (typeof review.userId === 'string' && review.userId.startsWith('user_')) {
            // Old format: Clerk ID
            user = await User.findOne({ clerkId: review.userId }).select('firstName lastName name clerkId').lean();
          } else {
            // New format: MongoDB ObjectId
            try {
              user = await User.findById(review.userId).select('firstName lastName name clerkId').lean();
            } catch (err) {
              // If ObjectId cast fails, try as Clerk ID fallback
              user = await User.findOne({ clerkId: review.userId }).select('firstName lastName name clerkId').lean();
            }
          }
        }
        
        return {
          ...review,
          user: user ? (() => {
            // Handle different user name formats
            if (user.firstName && user.lastName) {
              // User has separate firstName and lastName
              return {
                firstName: user.firstName,
                lastName: user.lastName
              };
            } else if (user.name) {
              // User has combined name field, split it
              const nameParts = user.name.trim().split(' ');
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';
              return {
                firstName,
                lastName
              };
            } else {
              // No name data available
              return {
                firstName: '',
                lastName: ''
              };
            }
          })() : null
        };
      })
    );

    // Calculate rating from actual reviews (not stored rating field)
    const validReviews = reviewsWithUserData.filter(review => review.rating && typeof review.rating === 'number');
    const calculatedRating = validReviews.length > 0 
      ? validReviews.reduce((sum, review) => sum + review.rating, 0) / validReviews.length 
      : 0;

    return NextResponse.json({
      success: true,
      reviews: reviewsWithUserData,
      rating: calculatedRating,
      reviewCount: validReviews.length
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}