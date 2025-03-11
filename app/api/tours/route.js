import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import Guide from '@/models/Guide';
import User from '@/models/User';
import { currentUser } from '@clerk/nextjs/server';

// GET all tours with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const expertise = searchParams.get('expertise');
    const language = searchParams.get('language');
    const date = searchParams.get('date');
    const travelers = searchParams.get('travelers');
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    // Build filter object
    const filter = {};
    
    if (expertise) {
      filter.expertise = expertise;
    }
    
    if (language) {
      filter.languages = { $in: [language] };
    }
    
    if (travelers) {
      filter.maxGroupSize = { $gte: parseInt(travelers) };
    }
    
    if (location) {
      filter.locations = location;
    }
    
    // Connect to database
    await connectDB();
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Find tours with filters
    const tours = await Tour.find(filter)
      .populate('guide', 'name profileImage rating reviewCount')
      .populate('locations', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Count total tours for pagination
    const total = await Tour.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      count: tours.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: tours,
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST create a new tour (requires authentication as a guide)
export async function POST(request) {
  try {
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
    
    // Check if user is a guide
    if (user.role !== 'guide') {
      return NextResponse.json(
        { success: false, message: 'Only guides can create tours' },
        { status: 403 }
      );
    }
    
    // Get tour data from request body
    const tourData = await request.json();
    
    // Create tour with user ID as guide
    const tour = await Tour.create({
      ...tourData,
      guide: user._id, // Use user ID directly
      rating: 5, // Default rating
      reviewCount: 0
    });
    
    return NextResponse.json(
      { success: true, data: tour },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tour:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 