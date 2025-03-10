import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import { getTokenCookie, verifyToken } from '@/lib/auth';

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
    // Get token from cookie
    const token = await getTokenCookie();
    
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
    
    // Check if user exists and is a guide
    const { default: User } = await import('@/models/User');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (user.role !== 'guide' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create tours' },
        { status: 403 }
      );
    }
    
    // If guide ID is not provided, use the authenticated user's ID
    if (!tourData.guide) {
      tourData.guide = user._id;
    }
    
    // Log the guide ID for debugging
    console.log('Using guide ID for tour:', tourData.guide);
    
    // Handle locations - for now, we'll just use the location names as strings
    // In a production app, you would create or look up location IDs
    if (tourData.locationsText && tourData.locationsText.length > 0) {
      // Store the location names directly in the tour document
      // This is a temporary solution until we implement proper location references
      tourData.locationNames = tourData.locationsText;
      delete tourData.locations; // Remove the empty locations array
      delete tourData.locationsText; // Remove the temporary field
    }
    
    // Create tour
    const tour = await Tour.create(tourData);
    
    return NextResponse.json(
      { success: true, data: tour },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create tour error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
} 