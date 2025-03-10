import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';
import { withAuth, withAdminAuth } from '@/lib/authMiddleware';
import { currentUser } from '@clerk/nextjs/server';

// Get all guides (public)
export async function GET(request) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    // Build query
    const query = {};
    if (active !== null) {
      query.active = active === 'true';
    }
    
    // Get guides
    const guides = await Guide.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, guides });
  } catch (error) {
    console.error('Error getting guides:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Create a new guide (authenticated)
export async function POST(request) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await currentUser();  
    
    if (!userId) {
      console.error('Guide creation failed: User not authenticated');
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { name, about, address, phone, languages, expertise, profileImage, driverLicense } = await request.json();
    
    // Validate input
    if (!name || !about || !address || !phone || !languages || !expertise || !profileImage) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Check if user exists
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify that the authenticated user matches the MongoDB user
    if (user.clerkId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create guide profile for this user' },
        { status: 403 }
      );
    }
    
    // Check if guide already exists for this user
    const guideExists = await Guide.findOne({ user: user._id });
    if (guideExists) {
      return NextResponse.json(
        { success: false, message: 'Guide profile already exists for this user' },
        { status: 400 }
      );
    }
    
    // Create new guide
    const guide = await Guide.create({
        user: user._id,
      name,
      about,
      address,
      phone,
      languages,
      expertise,
      profileImage,
      driverLicense,
      active: false, // Guides start as inactive until approved by admin
    });
    
    // Update user role if not already a guide
    if (user.role !== 'guide') {
        await User.findOneAndUpdate({ clerkId: userId }, { role: 'guide' });
    }
    
    return NextResponse.json(
      {
        success: true,
        guide: {
          _id: guide._id,
          name: guide.name,
          active: guide.active,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Guide creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 