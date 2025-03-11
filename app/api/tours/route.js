import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import Guide from '@/models/Guide';
import User from '@/models/User';
import { currentUser } from '@clerk/nextjs/server';
import Location from '@/models/Location';

// GET all tours with optional filtering
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const guideId = searchParams.get('guideId');
    const locationId = searchParams.get('locationId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const duration = searchParams.get('duration');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    
    // Build filter object
    const filter = {};
    
    if (guideId) filter.guide = guideId;
    if (locationId) filter.locations = locationId;
    if (minPrice) filter.price = { $gte: parseInt(minPrice) };
    if (maxPrice) {
      if (filter.price) {
        filter.price.$lte = parseInt(maxPrice);
      } else {
        filter.price = { $lte: parseInt(maxPrice) };
      }
    }
    if (duration) filter.duration = parseInt(duration);
    if (date) {
      const searchDate = new Date(date);
      filter.availableDates = {
        $elemMatch: {
          date: {
            $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
            $lte: new Date(searchDate.setHours(23, 59, 59, 999))
          }
        }
      };
    }
    if (search) {
      filter.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.ar': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.ar': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Find tours with filters
    const tours = await Tour.find(filter)
      .populate('guide', 'names profileImage rating reviewCount')
      .populate('locations', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
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