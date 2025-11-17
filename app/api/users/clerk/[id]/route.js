import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'No user ID provided' },
        { status: 400 }
      );
    }

    // Find user by MongoDB _id
    const user = await User.findById(id);
    
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
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 