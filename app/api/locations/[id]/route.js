import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';

// GET a single location by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to database
    await connectDB();
    
    // Find location by ID
    const location = await Location.findById(id);
    
    if (!location) {
      return NextResponse.json(
        { success: false, message: 'Location not found' },
        { status: 404 }
      );
    }
    
    // Convert MongoDB document to plain object
    const plainLocation = {
      _id: location._id.toString(),
      name: location.name,
      description: location.description,
      image: location.image,
      featured: location.featured,
      // Add other fields as needed
    };
    
    return NextResponse.json({
      success: true,
      data: plainLocation
    });
    
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

// UPDATE a location (admin only)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    // Get current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    
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
    
    // Update location
    const location = await Location.findByIdAndUpdate(
      id,
      locationData,
      { new: true, runValidators: true }
    );
    
    if (!location) {
      return NextResponse.json(
        { success: false, message: 'Location not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: location
    });
    
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE a location (admin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Get current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    
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
    
    // Delete location
    const location = await Location.findByIdAndDelete(id);
    
    if (!location) {
      return NextResponse.json(
        { success: false, message: 'Location not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {}
    });
    
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 