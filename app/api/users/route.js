import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAdminAuth } from '@/lib/authMiddleware';

// Get all users (admin only)
export async function GET(request) {
  try {
    // Authenticate admin
    const authResult = await withAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get users
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 