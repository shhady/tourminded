import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';
import { getTokenCookie, verifyToken } from '@/lib/auth';

// GET a single location by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to database
    await connectDB();
    
    // Find location by ID
    const location = await Location.findById(id).populate('tours');
    
    if (!location) {
      return NextResponse.json(
        { success: false, message: 'Location not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT update a location (requires authentication as admin)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
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
        { success: false, message: 'Not authorized to update locations' },
        { status: 403 }
      );
    }
    
    // Find location
    const location = await Location.findById(id);
    
    if (!location) {
      return NextResponse.json(
        { success: false, message: 'Location not found' },
        { status: 404 }
      );
    }
    
    // Update location
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      locationData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedLocation,
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE a location (requires authentication as admin)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
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
    
    // Connect to database
    await connectDB();
    
    // Check if user is admin
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete locations' },
        { status: 403 }
      );
    }
    
    // Find location
    const location = await Location.findById(id);
    
    if (!location) {
      return NextResponse.json(
        { success: false, message: 'Location not found' },
        { status: 404 }
      );
    }
    
    // Delete location
    await location.deleteOne();
    
    return NextResponse.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 