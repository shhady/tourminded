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
    
    // Get guide ID from request body
    const data = await request.json();
    const { guideId, languageIndex, proficiency } = data;
    
    // Find the user in our database
    const user =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find the guide by guide ID
    const guide = await Guide.findById(guideId);
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    
    // Validate input
    if (languageIndex === undefined || proficiency === undefined) {
      return NextResponse.json({ 
        error: 'Language index and proficiency are required' 
      }, { status: 400 });
    }
    
    if (proficiency < 1 || proficiency > 5) {
      return NextResponse.json({ 
        error: 'Proficiency must be between 1 and 5' 
      }, { status: 400 });
    }
    
    // Validate that proficiency is a number
    if (typeof proficiency !== 'number') {
      return NextResponse.json({ 
        error: 'Proficiency must be a number' 
      }, { status: 400 });
    }
    
    if (languageIndex < 0 || languageIndex >= guide.languages.length) {
      return NextResponse.json({ 
        error: 'Invalid language index' 
      }, { status: 400 });
    }
    
    // Clean up ALL language proficiency arrays to prevent validation errors
    guide.languages.forEach((lang, index) => {
      if (!lang.proficiency) {
        lang.proficiency = [];
      } else if (!Array.isArray(lang.proficiency)) {
        lang.proficiency = [];
      } else if (lang.proficiency.length > 0 && typeof lang.proficiency[0] === 'number') {
        // Clear old format data (numbers)
        lang.proficiency = [];
      } else {
        // Clean up any invalid entries (missing userId or rating)
        lang.proficiency = lang.proficiency.filter(
          rating => rating && rating.userId && rating.rating !== undefined
        );
      }
    });
    
    let currentProficiency = guide.languages[languageIndex].proficiency;
    
    // Check if user has already rated this language
    const existingRatingIndex = currentProficiency.findIndex(
      rating => rating && rating.userId && rating.userId.toString() === user._id.toString()
    );
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      guide.languages[languageIndex].proficiency[existingRatingIndex] = {
        userId: user._id,
        rating: proficiency,
        createdAt: new Date()
      };
    } else {
      // Add new rating
      guide.languages[languageIndex].proficiency.push({
        userId: user._id,
        rating: proficiency,
        createdAt: new Date()
      });
    }
    
    // Debug: Log the proficiency array before saving
    console.log('Proficiency array before saving:', JSON.stringify(guide.languages[languageIndex].proficiency, null, 2));
    
    // Mark all language fields as modified for Mongoose since we cleaned them all
    guide.languages.forEach((_, index) => {
      guide.markModified(`languages.${index}.proficiency`);
    });
    
    // Save updated guide
    await guide.save();
    
    return NextResponse.json({ 
      message: 'Language proficiency updated successfully',
      userRating: proficiency,
      guide: {
        languages: guide.languages
      }
    });
    
  } catch (error) {
    console.error('Error updating language proficiency:', error);
    return NextResponse.json({ error: 'Failed to update language proficiency' }, { status: 500 });
  }
}