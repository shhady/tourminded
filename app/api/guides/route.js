import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendAdminGuideRegistrationEmail } from '@/lib/mailer';

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
    // Get the current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Find the MongoDB user with session id/email
    const user =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Check if user is already a guide
    const existingGuide = await Guide.findOne({ user: user._id });
    
    if (existingGuide) {
      return NextResponse.json({ message: 'User is already registered as a guide' }, { status: 400 });
    }
    
    const data = await request.json();

    // Validate licenseIssueDate (now top-level in the model)
    if (!data.licenseIssueDate) {
      return NextResponse.json(
        { message: 'licenseIssueDate is required' },
        { status: 400 }
      );
    }
    const licenseIssueDate = new Date(data.licenseIssueDate);
    if (isNaN(licenseIssueDate.getTime())) {
      return NextResponse.json(
        { message: 'licenseIssueDate must be a valid date' },
        { status: 400 }
      );
    }

    // Normalize languages to expected shape: accept array of strings or objects
    const normalizedLanguages = Array.isArray(data.languages)
      ? data.languages.map((lang) => {
          if (typeof lang === 'string') return { language: lang };
          if (lang && typeof lang === 'object' && lang.language) return { language: lang.language };
          return null;
        }).filter(Boolean)
      : [];

    // Normalize expertise: require area and at least one description (en or ar)
    const normalizedExpertise = Array.isArray(data.expertise)
      ? data.expertise.map((item, idx) => {
          const area = item?.area;
          const descEn = item?.expertiseAreaDescriptionEn ?? item?.descriptionEn ?? '';
          const descAr = item?.expertiseAreaDescriptionAr ?? item?.descriptionAr ?? '';
          if (!area) {
            throw new Error(`Expertise item #${idx + 1} missing area`);
          }
          // Descriptions are optional; allow empty strings
          return {
            area,
            expertiseAreaDescriptionEn: descEn,
            expertiseAreaDescriptionAr: descAr,
          };
        })
      : [];

    // Create guide data with user reference
    const guideData = {
      user: user._id,
      names: data.names,
      nickname: data.nickname,
      address: data.address,
      phone: data.phone,
      languages: normalizedLanguages,
      licenseIssueDate,
      expertise: normalizedExpertise,
      aboutSections: data.aboutSections,
      profileImage: data.profileImage,
      coverImage: data.coverImage,
      vehicle: data.vehicle,
    };
    
    // Create new guide
    const guide = await Guide.create(guideData);
    
    // Update user role to guide
    await User.findByIdAndUpdate(user._id, { role: 'guide' });

    // Send admin notification email (non-blocking)
    try {
      const plainUser = { _id: user._id, email: user.email, name: user.name };
      await sendAdminGuideRegistrationEmail({ guide, user: plainUser, data });
    } catch (e) {
      console.error('Guide registration email error:', e);
    }
    
    return NextResponse.json({ 
      message: 'Guide registered successfully',
      guide
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating guide:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return NextResponse.json({ 
        message: 'Validation error', 
        errors 
      }, { status: 400 });
    }
    if (error.message && /Expertise item/.test(error.message)) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ 
      message: 'Failed to register as guide', 
      error: error.message 
    }, { status: 500 });
  }
} 