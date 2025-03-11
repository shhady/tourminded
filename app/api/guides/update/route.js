import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';

export async function PUT(request) {
  try {
    const userClerk = await currentUser();
    
    if (!userClerk) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Find the user by Clerk ID
    const user = await User.findOne({ clerkId: userClerk.id });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user is a guide
    if (user.role !== 'guide') {
      return NextResponse.json({ error: 'User is not a guide' }, { status: 403 });
    }
    
    // Find guide by user ID
    const guide = await Guide.findOne({ user: user._id });
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    
    // Get update data from request
    const data = await request.json();
    
    // Update guide data
    if (data.names) guide.names = data.names;
    if (data.nickname) guide.nickname = data.nickname;
    if (data.address) guide.address = data.address;
    if (data.phone) guide.phone = data.phone;
    if (data.languages) guide.languages = data.languages;
    if (data.expertise) guide.expertise = data.expertise;
    if (data.aboutSections) guide.aboutSections = data.aboutSections;
    
    // Update profile image
    if (data.profileImage) {
      guide.profileImage = data.profileImage;
    }
    
    // Update cover image
    if (data.coverImage) {
      guide.coverImage = data.coverImage;
    }
    
    // Update vehicle
    if (data.vehicle) {
      guide.vehicle = data.vehicle;
    }
    
    // Save updated guide
    await guide.save();
    
    return NextResponse.json({ 
      message: 'Guide profile updated successfully',
      guide
    });
    
  } catch (error) {
    console.error('Error updating guide profile:', error);
    return NextResponse.json({ error: 'Failed to update guide profile' }, { status: 500 });
  }
} 