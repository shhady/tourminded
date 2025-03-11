import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';
import { currentUser } from '@clerk/nextjs/server';
import User from '@/models/User';

// GET all locations
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit')) || 100;
    
    // Build query
    const query = {};
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Get locations
    const locations = await Location.find(query)
      .sort({ name: 1 })
      .limit(limit);
    
    // Convert MongoDB documents to plain objects
    const plainLocations = locations.map(location => ({
      _id: location._id.toString(),
      name: location.name,
      description: location.description,
      image: location.image,
      featured: location.featured,
      // Add other fields as needed
    }));
    
    return NextResponse.json({
      success: true,
      count: plainLocations.length,
      data: plainLocations
    });
    
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

// POST a new location (admin only)
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
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Get location data from request body
    const locationData = await request.json();
    
    // Create location
    const location = await Location.create(locationData);
    
    return NextResponse.json(
      { success: true, data: location },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 