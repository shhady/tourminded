import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';

export async function GET(request, { params }) {
  try {
    // Connect to database
    await connectDB();
    const {id} = await params;
    // Get the Clerk user ID from the URL parameter
    const clerkId = id;
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: 'No user ID provided' },
        { status: 400 }
      );
    }

    // Find user by Clerk ID (not MongoDB _id)
    const user = await User.findOne({ clerkId: clerkId });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // If user is a guide, fetch guide data
    let guideData = null;
    if (user.role === "guide") {
      guideData = await Guide.findOne({ user: user._id });
    }
    
    return NextResponse.json({
      success: true,
      user,
      guide: guideData
    });
    
  } catch (error) {
    console.error('Error fetching user by Clerk ID:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 