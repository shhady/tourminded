import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';
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
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Find the MongoDB user with the Clerk ID
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Check if user is already a guide
    const existingGuide = await Guide.findOne({ user: user._id });
    
    if (existingGuide) {
      return NextResponse.json({ message: 'User is already registered as a guide' }, { status: 400 });
    }
    
    const data = await request.json();
    
    // Create guide data with user reference
    const guideData = {
      user: user._id,
      names: data.names,
      nickname: data.nickname,
      address: data.address,
      phone: data.phone,
      languages: data.languages,
      expertise: data.expertise,
      aboutSections: data.aboutSections,
      profileImage: data.profileImage,
      coverImage: data.coverImage,
      vehicle: data.vehicle,
    };
    
    // Create new guide
    const guide = await Guide.create(guideData);
    
    // Update user role to guide
    await User.findByIdAndUpdate(user._id, { role: 'guide' });
    
    return NextResponse.json({ 
      message: 'Guide registered successfully',
      guide
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating guide:', error);
    return NextResponse.json({ 
      message: 'Failed to register as guide', 
      error: error.message 
    }, { status: 500 });
  }
} 