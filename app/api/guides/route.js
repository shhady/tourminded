import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';
import { withAuth, withAdminAuth } from '@/lib/authMiddleware';
import { currentUser } from '@clerk/nextjs/server';

// Get all guides (public)
export async function GET(request) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    // Build query
    const query = {};
    if (active !== null) {
      query.active = active === 'true';
    }
    
    // Get guides
    const guides = await Guide.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, guides });
  } catch (error) {
    console.error('Error getting guides:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Create a new guide (authenticated)
export async function POST(request) {
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
    
    // Find the user in our database
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found in our database' },
        { status: 404 }
      );
    }
    
    // Get guide data from request
    const guideData = await request.json();
    
    // Check if guide profile already exists
    let existingGuide = await Guide.findOne({ user: user._id });
    
    if (existingGuide) {
      return NextResponse.json(
        { success: false, message: 'Guide profile already exists for this user' },
        { status: 400 }
      );
    }
    
    // Update user role to guide
    await User.findByIdAndUpdate(user._id, { role: 'guide' });
    
    // Create new guide profile with default values for required fields
    const newGuide = new Guide({
      user: user._id,
      name: {
        en: guideData.name?.en || user.name || guideData.nickname,
        ar: guideData.name?.ar || guideData.aboutAr ? guideData.aboutAr.substring(0, 30) : "مرشد سياحي" // Default Arabic name if not provided
      },
      email: user.email,
      nickname: guideData.nickname || "",
      address: guideData.address || "",
      phone: guideData.phone || "",
      languages: guideData.languages || [],
      expertise: guideData.expertise || [],
      about: {
        en: guideData.about?.en || guideData.about || "",
        ar: guideData.about?.ar || guideData.aboutAr || "نبذة عن المرشد" // Default Arabic description
      },
      profileImage: guideData.profileImage || "",
      driverLicense: {
        date: guideData.driverLicense?.date || null,
        number: guideData.driverLicense?.number || "",
        image: guideData.driverLicense?.image || ""
      },
      vehicle: guideData.vehicle || {},
      reviews: [],
      rating: 5, // Default rating to pass validation
      active: false // New guides start as inactive until approved
    });
    
    try {
      await newGuide.save();
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json({
        success: false,
        message: 'Validation error: ' + validationError.message,
        details: validationError.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Guide profile created successfully',
      guide: newGuide
    });
    
  } catch (error) {
    console.error('Error creating guide profile:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 