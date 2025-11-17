import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';

export async function GET(request, { params }) {
  try {
    // Ensure authenticated via NextAuth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
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