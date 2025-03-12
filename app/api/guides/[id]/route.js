import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';
import { currentUser } from '@clerk/nextjs/server';

// GET a single guide by ID
export async function GET(request, { params }) {
  const { id } = await params;
  
  try {
    await connectDB();
    
    // Find guide by ID and populate user data
    const guide = await Guide.findById(id).populate('user');
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    
    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 });
  }
}

// PUT update a guide profile (requires authentication as the guide or admin)
export async function PUT(request, { params }) {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const updateData = await request.json();
    
    const guide = await Guide.findById(id);
    
    if (!guide) {
      return NextResponse.json(
        { success: false, message: 'Guide not found' },
        { status: 404 }
      );
    }
    
    // Update guide
    const updatedGuide = await Guide.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, guide: updatedGuide });
  } catch (error) {
    console.error('Error updating guide:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE a guide profile (requires authentication as admin)
export async function DELETE(request, { params }) {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    const guide = await Guide.findById(id);
    
    if (!guide) {
      return NextResponse.json(
        { success: false, message: 'Guide not found' },
        { status: 404 }
      );
    }
    
    // Delete guide
    await Guide.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: 'Guide deleted successfully' });
  } catch (error) {
    console.error('Error deleting guide:', error);
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
    
    // Get guide ID from params
    const { id } = params;
    
    // Find the user making the request
    const requestingUser = await User.findOne({ clerkId: clerkUser.id });
    
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the guide
    const guide = await Guide.findById(id);
    
    if (!guide) {
      return NextResponse.json(
        { success: false, message: 'Guide not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the guide owner or an admin
    const isOwner = guide.user.toString() === requestingUser._id.toString();
    const isAdmin = requestingUser.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this guide' },
        { status: 403 }
      );
    }
    
    // Get update data from request body
    const updateData = await request.json();
    
    // Determine which fields can be updated based on user role
    let allowedFields = ['nickname', 'about', 'profileImage', 'languages', 'expertise', 'phone', 'address'];
    
    // Admins can update additional fields
    if (isAdmin) {
      allowedFields = [...allowedFields, 'active', 'rating'];
    }
    
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});
    
    // Update the guide
    const updatedGuide = await Guide.findByIdAndUpdate(
      id,
      filteredData,
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Guide updated successfully',
      guide: updatedGuide
    });
    
  } catch (error) {
    console.error('Error updating guide:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 