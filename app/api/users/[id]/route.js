import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';
import { withAdminAuth } from '@/lib/authMiddleware';

// Get a user by ID (admin only)
export async function GET(request, { params }) {
  try {
    // Authenticate admin
    const authResult = await withAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }
    
    const { id } = params;
    
    await connectDB();
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Update a user (admin only)
export async function PUT(request, { params }) {
  try {
    // Authenticate admin
    const authResult = await withAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }
    
    const { id } = params;
    const updateData = await request.json();
    
    await connectDB();
    
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Delete a user (admin only)
export async function DELETE(request, { params }) {
  try {
    // Authenticate admin
    const authResult = await withAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }
    
    const { id } = params;
    
    await connectDB();
    
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // If user is a guide, delete guide profile
    if (user.role === 'guide') {
      await Guide.findOneAndDelete({ user: id });
    }
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 