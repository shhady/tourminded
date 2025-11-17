import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';

// GET all reviews with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const tour = searchParams.get('tour');
    const guide = searchParams.get('guide');
    const user = searchParams.get('user');
    const rating = searchParams.get('rating');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    // Build filter object
    const filter = {};
    
    if (tour) {
      filter.tour = tour;
    }
    
    if (guide) {
      filter.guide = guide;
    }
    
    if (user) {
      filter.user = user;
    }
    
    if (rating) {
      filter.rating = { $gte: parseInt(rating) };
    }
    
    // Connect to database
    await connectDB();
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Find reviews with filters
    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .populate('tour', 'title')
      .populate('guide', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Count total reviews for pagination
    const total = await Review.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST create a new review (requires authentication)
export async function POST(request) {
  try {
    // Get current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
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
    const user =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if tour or guide exists
    if (reviewData.tour) {
      const Tour = (await import('@/models/Tour')).default;
      const tour = await Tour.findById(reviewData.tour);
      
      if (!tour) {
        return NextResponse.json(
          { success: false, message: 'Tour not found' },
          { status: 404 }
        );
      }
    }
    
    if (reviewData.guide) {
      const Guide = (await import('@/models/Guide')).default;
      const guide = await Guide.findById(reviewData.guide);
      
      if (!guide) {
        return NextResponse.json(
          { success: false, message: 'Guide not found' },
          { status: 404 }
        );
      }
    }
    
    // Check if user has already reviewed this tour or guide
    const existingReview = await Review.findOne({
      user: user._id,
      ...(reviewData.tour ? { tour: reviewData.tour } : {}),
      ...(reviewData.guide ? { guide: reviewData.guide } : {}),
    });
    
    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this tour or guide' },
        { status: 400 }
      );
    }
    
    // Create review (canonical)
    const review = await Review.create({
      ...reviewData,
      user: user._id,
    });

    // Also append to embedded arrays for legacy views
    if (reviewData.tour) {
      try {
        const Tour = (await import('@/models/Tour')).default;
        await Tour.findByIdAndUpdate(
          reviewData.tour,
          {
            $push: {
              tourReviews: {
                userId: user._id,
                comment: typeof reviewData.comment === 'string' ? reviewData.comment : '',
                rating: reviewData.rating,
                createdAt: new Date(),
              },
            },
          },
          { new: true, runValidators: false }
        );
      } catch (e) {
        console.error('Failed to append embedded tour review', e);
      }
    }
    
    return NextResponse.json(
      { success: true, data: review },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
} 