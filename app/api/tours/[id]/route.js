import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import { currentUser } from '@clerk/nextjs/server';
import User from '@/models/User';
import Guide from '@/models/Guide';

// GET a single tour by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Connect to database
    await connectDB();
    
    // Find tour by ID
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: tour
    });
    
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT update a tour (requires authentication as the guide who created it or admin)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const tourData = await request.json();
    
    console.log('API received tourData:', JSON.stringify(tourData, null, 2));

  // Validate pricePer if provided
  if (tourData.pricePer !== undefined) {
    const allowed = ['person', 'group'];
    if (typeof tourData.pricePer !== 'string' || !allowed.includes(tourData.pricePer)) {
      return NextResponse.json(
        { success: false, message: 'pricePer must be either "person" or "group"' },
        { status: 400 }
      );
    }
  }
  
  // Normalize and validate expertise (array) if provided
  if (tourData.expertise !== undefined) {
    const allowedExpertise = [
      'Religious',
      'Christian',
      'Jewish',
      'Muslim',
      'Political',
      'Historical',
      'Cultural',
      'Food',
      'Adventure',
      'Nature',
      'Photography',
      'Culinary',
      'All-inclusive',
    ];
    const canonMap = {
      religious: 'Religious',
      christian: 'Christian',
      jewish: 'Jewish',
      muslim: 'Muslim',
      political: 'Political',
      historical: 'Historical',
      cultural: 'Cultural',
      food: 'Food',
      adventure: 'Adventure',
      nature: 'Nature',
      photography: 'Photography',
      culinary: 'Culinary',
      'all-inclusive': 'All-inclusive',
      allinclusive: 'All-inclusive',
    };
    let expertiseArray = tourData.expertise;
    if (typeof expertiseArray === 'string') {
      expertiseArray = expertiseArray.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(expertiseArray) || expertiseArray.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one expertise is required' },
        { status: 400 }
      );
    }
    const normalizedExpertise = expertiseArray.map((val) => {
      const key = String(val).toLowerCase();
      return canonMap[key] || val;
    });
    const invalid = normalizedExpertise.filter((v) => !allowedExpertise.includes(v));
    if (invalid.length > 0) {
      return NextResponse.json(
        { success: false, message: `Invalid expertise values: ${invalid.join(', ')}` },
        { status: 400 }
      );
    }
    tourData.expertise = normalizedExpertise;
  }

  // Validate FAQs if provided (optional)
  if (tourData.faqs !== undefined) {
    if (!Array.isArray(tourData.faqs)) {
      return NextResponse.json(
        { success: false, message: 'FAQs must be an array' },
        { status: 400 }
      );
    }
    for (let i = 0; i < tourData.faqs.length; i++) {
      const item = tourData.faqs[i] || {};
      const hasQuestion = item.question && (item.question.en || item.question.ar);
      const hasAnswer = item.answer && (item.answer.en || item.answer.ar);
      if (!hasQuestion || !hasAnswer) {
        return NextResponse.json(
          { success: false, message: `FAQ at index ${i} must include question and answer (en and/or ar)` },
          { status: 400 }
        );
      }
    }
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
    
    // Find tour
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized (admin or the guide who created the tour)
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: user._id });
    const isAdmin = user.role === 'admin';
    const isOwnerByGuide = !!guide && tour.guide?.toString() === guide._id.toString();
    const isOwnerByLegacyUserId = tour.guide?.toString() === user._id.toString();

    if (!(isAdmin || isOwnerByGuide || isOwnerByLegacyUserId)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this tour' },
        { status: 403 }
      );
    }
    
    // Validate required fields if they are being updated
    if (tourData.title && (!tourData.title.en)) {
      return NextResponse.json(
        { success: false, message: 'Title in English is required' },
        { status: 400 }
      );
    }
    
    if (tourData.description && (!tourData.description.en)) {
      return NextResponse.json(
        { success: false, message: 'Description in English is required' },
        { status: 400 }
      );
    }
    
    if (tourData.price !== undefined && tourData.price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid price is required' },
        { status: 400 }
      );
    }
    
    if (tourData.duration !== undefined && tourData.duration <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid duration is required' },
        { status: 400 }
      );
    }
    
    // Validate includes field if provided
    if (tourData.includes !== undefined) {
      if (!Array.isArray(tourData.includes)) {
        return NextResponse.json(
          { success: false, message: 'Includes must be an array' },
          { status: 400 }
        );
      }
      
      // Validate that all items in includes are strings
      for (let i = 0; i < tourData.includes.length; i++) {
        if (typeof tourData.includes[i] !== 'string') {
          return NextResponse.json(
            { success: false, message: `Includes item at index ${i} must be a string` },
            { status: 400 }
          );
        }
      }
    }
    
    // Validate tour plan for multi-day tours
    if (tourData.durationUnit === 'days' && tourData.duration && Math.floor(tourData.duration) > 0) {
      if (!tourData.tourPlan || !Array.isArray(tourData.tourPlan)) {
        return NextResponse.json(
          { success: false, message: 'Tour plan is required for multi-day tours' },
          { status: 400 }
        );
      }
      
      // Check if all days have content
      const expectedDays = Math.floor(tourData.duration);
      if (tourData.tourPlan.length !== expectedDays) {
        return NextResponse.json(
          { success: false, message: `Tour plan must have exactly ${expectedDays} days` },
          { status: 400 }
        );
      }
      
      // Validate each day's content
      for (let i = 0; i < tourData.tourPlan.length; i++) {
        const day = tourData.tourPlan[i];
        if (!day.content || !day.content.en || !day.content.ar) {
          return NextResponse.json(
            { success: false, message: `Day ${i + 1} content in both English and Arabic is required` },
            { status: 400 }
          );
        }
        if (!day.day || day.day !== (i + 1)) {
          return NextResponse.json(
            { success: false, message: `Invalid day number for day ${i + 1}` },
            { status: 400 }
          );
        }
      }
    } else if (tourData.durationUnit === 'hours') {
      // For hourly tours, clear any existing tour plan
      tourData.tourPlan = [];
    }
    
    // Update tour
    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      tourData,
      { new: true, runValidators: true, overwrite: false }
    );
    
    console.log('Updated tour title:', updatedTour.title);
    console.log('Updated tour description:', updatedTour.description);
    
    return NextResponse.json({
      success: true,
      data: updatedTour,
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE a tour (requires authentication as the tour owner or admin)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
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
    
    // Find the tour
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Find the guide profile for this user
    const guide = await Guide.findOne({ user: user._id });
    
    // Check if user is the tour owner or an admin
    // Allow if: user is admin, OR guide exists and tour.guide matches guide._id, OR tour.guide matches user._id (legacy)
    const isAdmin = user.role === 'admin';
    const isGuideOwner = guide && tour.guide.toString() === guide._id.toString();
    const isLegacyOwner = tour.guide.toString() === user._id.toString();
    
    if (!isAdmin && !isGuideOwner && !isLegacyOwner) {
      console.log('Delete authorization failed:', {
        userId: user._id.toString(),
        guideId: guide?._id?.toString(),
        tourGuideId: tour.guide.toString(),
        isAdmin,
        isGuideOwner,
        isLegacyOwner
      });
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this tour' },
        { status: 403 }
      );
    }
    
    // Delete the tour
    await Tour.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Tour deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 