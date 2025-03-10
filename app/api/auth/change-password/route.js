import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';

export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await withAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get request body
    const { userId, currentPassword, newPassword } = await request.json();
    
    // Validate input
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate that the authenticated user is changing their own password
    if (authResult.user._id.toString() !== userId) {
      return NextResponse.json(
        { message: 'Unauthorized to change this password' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get user model
    const User = (await import('@/models/User')).default;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
} 