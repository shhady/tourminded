import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Find the user by session id/email
    const user =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user is a guide
    if (user.role !== 'guide') {
      return NextResponse.json({ error: 'User is not a guide' }, { status: 403 });
    }
    
    // Find guide by user ID
    const guide = await Guide.findOne({ user: user._id });
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    
    // Get update data from request
    const data = await request.json();
    
    // Normalize and update fields to match schema
    if (data.names !== undefined) guide.names = data.names;
    if (data.nickname !== undefined) guide.nickname = data.nickname;
    if (data.address !== undefined) guide.address = data.address;
    if (data.phone !== undefined) guide.phone = data.phone;
    if (data.licenseIssueDate !== undefined) {
      const d = new Date(data.licenseIssueDate);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: 'licenseIssueDate must be a valid date' }, { status: 400 });
      }
      guide.licenseIssueDate = d;
    }
    if (data.languages !== undefined) {
      guide.languages = Array.isArray(data.languages)
        ? data.languages
            .map((lang) => (typeof lang === 'string' ? { language: lang } : (lang && lang.language ? { language: lang.language } : null)))
            .filter(Boolean)
        : [];
    }
    if (data.expertise !== undefined) {
      if (!Array.isArray(data.expertise)) {
        return NextResponse.json({ error: 'expertise must be an array' }, { status: 400 });
      }
      const normalizedExpertise = data.expertise.map((item, idx) => {
        const area = item?.area;
        const descEn = item?.expertiseAreaDescriptionEn ?? item?.descriptionEn ?? '';
        const descAr = item?.expertiseAreaDescriptionAr ?? item?.descriptionAr ?? '';
        if (!area) throw new Error(`Expertise item #${idx + 1} missing area`);
        return { area, expertiseAreaDescriptionEn: descEn, expertiseAreaDescriptionAr: descAr };
      });
      guide.expertise = normalizedExpertise;
    }
    if (data.aboutSections !== undefined) guide.aboutSections = data.aboutSections;
    
    // Update profile image
    if (data.profileImage) {
      guide.profileImage = data.profileImage;
    }
    
    // Update cover image
    if (data.coverImage) {
      guide.coverImage = data.coverImage;
    }
    
    // Update vehicle
    if (data.vehicle) {
      guide.vehicle = data.vehicle;
    }
    
    // Save updated guide
    await guide.save();
    
    return NextResponse.json({ 
      message: 'Guide profile updated successfully',
      guide
    });
    
  } catch (error) {
    console.error('Error updating guide profile:', error);
    if (error.message && /Expertise item/.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update guide profile' }, { status: 500 });
  }
} 