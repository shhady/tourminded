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
    
    // Find the guide profile for this user
    const guide = await Guide.findOne({ user: user._id });
    
    if (!guide) {
      return NextResponse.json(
        { success: false, message: 'Guide profile not found' },
        { status: 404 }
      );
    }
    
    // Get tour data from request body
    const tourData = await request.json();
    
    // Validate required fields
    if (!tourData.title || !tourData.title.en || !tourData.description || !tourData.description.en) {
      return NextResponse.json(
        { success: false, message: 'Title and description in English are required' },
        { status: 400 }
      );
    }
    
    if (!tourData.price || tourData.price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid price is required' },
        { status: 400 }
      );
    }
    
    if (!tourData.duration || tourData.duration <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid duration is required' },
        { status: 400 }
      );
    }
    
    // Validate includes field if provided
    if (tourData.includes !== undefined) {
      if (!Array.isArray(tourData.includes)) {
        return NextResponse.json(
          { success: false, message: 'Includes must be an array' },
          { status: 400 }
        );
      }
      
      // Validate that all items in includes are strings
      for (let i = 0; i < tourData.includes.length; i++) {
        if (typeof tourData.includes[i] !== 'string') {
          return NextResponse.json(
            { success: false, message: `Includes item at index ${i} must be a string` },
            { status: 400 }
          );
        }
      }
    }
    
    // Validate tour plan for multi-day tours
    if (tourData.durationUnit === 'days' && Math.floor(tourData.duration) > 0) {
      if (!tourData.tourPlan || !Array.isArray(tourData.tourPlan)) {
        return NextResponse.json(
          { success: false, message: 'Tour plan is required for multi-day tours' },
          { status: 400 }
        );
      }
      
      // Check if all days have content
      const expectedDays = Math.floor(tourData.duration);
      if (tourData.tourPlan.length !== expectedDays) {
        return NextResponse.json(
          { success: false, message: `Tour plan must have exactly ${expectedDays} days` },
          { status: 400 }
        );
      }
      
      // Validate each day's content
      for (let i = 0; i < tourData.tourPlan.length; i++) {
        const day = tourData.tourPlan[i];
        if (!day.content || !day.content.en || !day.content.ar) {
          return NextResponse.json(
            { success: false, message: `Day ${i + 1} content in both English and Arabic is required` },
            { status: 400 }
          );
        }
        if (!day.day || day.day !== (i + 1)) {
          return NextResponse.json(
            { success: false, message: `Invalid day number for day ${i + 1}` },
            { status: 400 }
          );
        }
      }
    }
    
    // Create tour with guide ID
    const tour = await Tour.create({
      ...tourData,
      guide: guide._id, // Use guide profile ID
      rating: 5, // Default rating
      reviewCount: 0
    });
    
    return NextResponse.json(
      { success: true, data: tour },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tour:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 