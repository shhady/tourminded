import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';
import { getTokenCookie, verifyToken, withAuth, withAdminAuth } from '@/lib/auth';

// GET a single guide by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to database
    await connectDB();
    
    // Find guide by ID
    const guide = await Guide.findById(id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name',
        },
      })
      .populate('tours');
    
    if (!guide) {
      return NextResponse.json(
        { success: false, message: 'Guide not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: guide,
    });
  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT update a guide profile (requires authentication as the guide or admin)
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