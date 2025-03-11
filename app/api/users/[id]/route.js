import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
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

export async function PATCH(request, { params }) {
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
    const { id } = params;
    
    // Find the user making the request
    const requestingUser = await User.findOne({ clerkId: clerkUser.id });
    
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is trying to update their own account or is an admin
    if (requestingUser._id.toString() !== id && requestingUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this user' },
        { status: 403 }
      );
    }
    
    // Get update data from request body
    const updateData = await request.json();
    
    // Only allow certain fields to be updated
    const allowedFields = ['name', 'phone', 'address'];
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});
    
    // Add this before the findByIdAndUpdate call
    console.log('Updating user with data:', filteredData);

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      filteredData,
      { new: true, runValidators: true }
    );

    console.log('Updated user:', updatedUser);
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 