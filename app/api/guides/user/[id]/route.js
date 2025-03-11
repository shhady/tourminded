import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';

export async function GET(request, { params }) {
  try {
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get user ID from params
    const { id } = await params;
    
    // Find guide by user ID
    const guide = await Guide.findOne({ user: id });
    
    return NextResponse.json({
      success: true,
      guide: guide
    });
    
  } catch (error) {
    console.error('Error fetching guide status:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 