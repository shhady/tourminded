import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';
import { getTokenCookie, verifyToken } from '@/lib/auth';

// GET all locations with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const all = searchParams.get('all') === 'true';
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.ar': { $regex: search, $options: 'i' } },
      ];
    }
    
    // Connect to database
    await connectDB();
    
    // If all parameter is true, return all locations without pagination
    if (all) {
      const allLocations = await Location.find(filter)
        .sort({ 'name.en': 1 })
        .lean();
      
      return NextResponse.json({
        success: true,
        count: allLocations.length,
        data: allLocations,
      });
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Find locations with filters
    const locations = await Location.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ 'name.en': 1 });
    
    // Count total locations for pagination
    const total = await Location.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      count: locations.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: locations,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST create a new location (requires authentication as admin)
export async function POST(request) {
  try {
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
    const locationData = await request.json();
    
    // Connect to database
    await connectDB();
    
    // Check if user is admin
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create locations' },
        { status: 403 }
      );
    }
    
    // Create location
    const location = await Location.create(locationData);
    
    return NextResponse.json(
      { success: true, data: location },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function GETAll() {
  try {
    await connectDB();
    
    // Fetch all locations sorted by name
    const locations = await Location.find({})
      .sort({ 'name.en': 1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
} 