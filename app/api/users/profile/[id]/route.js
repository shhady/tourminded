import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET - Get user profile by MongoDB ID for chat functionality
export async function GET(request, { params }) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    // Find user by MongoDB ID
    const user = await User.findById(id).select('firstName lastName name clerkId').lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get Clerk user data for profile image
    let profileImage = null;
    if (user.clerkId) {
      try {
        const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${user.clerkId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (clerkResponse.ok) {
          const clerkUserData = await clerkResponse.json();
          profileImage = clerkUserData.image_url;
        }
      } catch (error) {
        console.log('Could not fetch Clerk user image:', error);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        profileImage: profileImage,
      },
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}