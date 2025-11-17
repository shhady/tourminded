import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';

// Update guide activation status (admin only)
export async function PATCH(request, { params }) {
  try {
    // Get the current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Check if user is admin
    const adminUser =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    // Get guide ID from params
    const { id } = params;
    
    // Get activation status from request body
    const { active } = await request.json();
    
    // Find guide by ID
    const guide = await Guide.findById(id);
    
    if (!guide) {
      return NextResponse.json(
        { success: false, message: 'Guide not found' },
        { status: 404 }
      );
    }
    
    // Update guide activation status
    guide.active = active;
    await guide.save();
    
    // Update user role based on guide activation status
    await User.findByIdAndUpdate(
      guide.user,
      { role: active ? 'guide' : 'user' },
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      message: `Guide ${active ? 'activated' : 'deactivated'} successfully`,
      guide
    });
    
  } catch (error) {
    console.error('Error updating guide activation status:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 