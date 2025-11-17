import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    // Get current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
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
    
    const { id } = await params;
    const updateData = await request.json();

    // Normalize incoming fields to match Guide model
    const normalized = { ...updateData };

    // licenseIssueDate: parse if provided
    if (normalized.licenseIssueDate !== undefined) {
      const d = new Date(normalized.licenseIssueDate);
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { success: false, message: 'licenseIssueDate must be a valid date' },
          { status: 400 }
        );
      }
      normalized.licenseIssueDate = d;
    }

    // languages: accept strings or objects -> { language }
    if (normalized.languages !== undefined) {
      if (!Array.isArray(normalized.languages)) normalized.languages = [];
      normalized.languages = normalized.languages
        .map((lang) => {
          if (typeof lang === 'string') return { language: lang };
          if (lang && typeof lang === 'object' && lang.language) return { language: lang.language };
          return null;
        })
        .filter(Boolean);
    }

    // expertise: ensure area and at least one description
    if (normalized.expertise !== undefined) {
      if (!Array.isArray(normalized.expertise)) normalized.expertise = [];
      try {
        normalized.expertise = normalized.expertise.map((item, idx) => {
          const area = item?.area;
          const descEn = item?.expertiseAreaDescriptionEn ?? item?.descriptionEn ?? '';
          const descAr = item?.expertiseAreaDescriptionAr ?? item?.descriptionAr ?? '';
          if (!area) throw new Error(`Expertise item #${idx + 1} missing area`);
          // Descriptions optional
          return {
            area,
            expertiseAreaDescriptionEn: descEn,
            expertiseAreaDescriptionAr: descAr,
          };
        });
      } catch (e) {
        return NextResponse.json({ success: false, message: e.message }, { status: 400 });
      }
    }
    
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
      normalized,
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
    // Get current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
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
    
    // Get guide ID from params
    const { id } = params;
    
    // Find the user making the request
    const requestingUser =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
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