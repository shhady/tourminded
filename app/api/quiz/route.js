import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';

// POST process quiz answers and return recommended tours
export async function POST(request) {
  try {
    // Parse request body
    const quizData = await request.json();
    
    // Connect to database
    await connectDB();
    
    // Extract quiz answers
    const {
      interests = [],
      languages = [],
      duration = '',
      groupSize = 1,
      activityLevel = '',
      specialRequirements = {
        kidFriendly: false,
        handicappedFriendly: false,
      },
    } = quizData;
    
    // Build filter object
    const filter = {};
    
    // Match interests to expertise
    if (interests.length > 0) {
      filter.expertise = { $in: interests };
    }
    
    // Match languages
    if (languages.length > 0) {
      filter.languages = { $in: languages };
    }
    
    // Match duration
    if (duration === 'short') {
      // Short tours (less than 4 hours)
      filter.duration = { $lte: 4 };
      filter.durationUnit = 'hours';
    } else if (duration === 'medium') {
      // Medium tours (4-8 hours or 1 day)
      filter.$or = [
        { duration: { $gte: 4, $lte: 8 }, durationUnit: 'hours' },
        { duration: 1, durationUnit: 'days' },
      ];
    } else if (duration === 'long') {
      // Long tours (more than 1 day)
      filter.duration = { $gt: 1 };
      filter.durationUnit = 'days';
    }
    
    // Match group size
    filter.maxGroupSize = { $gte: parseInt(groupSize) };
    
    // Match activity level
    if (activityLevel) {
      filter.activityLevel = activityLevel;
    }
    
    // Match special requirements
    if (specialRequirements.kidFriendly) {
      filter.kidFriendly = true;
    }
    
    if (specialRequirements.handicappedFriendly) {
      filter.handicappedFriendly = true;
    }
    
    // Find matching tours
    const tours = await Tour.find(filter)
      .populate('guide', 'name profileImage rating reviewCount languages expertise')
      .populate('locations', 'name')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(5);
    
    // If no exact matches, find tours with partial matches
    if (tours.length === 0) {
      // Remove some filters for broader search
      delete filter.activityLevel;
      delete filter.kidFriendly;
      delete filter.handicappedFriendly;
      
      if (filter.$or) {
        delete filter.$or;
      }
      
      const fallbackTours = await Tour.find(filter)
        .populate('guide', 'name profileImage rating reviewCount languages expertise')
        .populate('locations', 'name')
        .sort({ rating: -1, reviewCount: -1 })
        .limit(5);
      
      return NextResponse.json({
        success: true,
        count: fallbackTours.length,
        exactMatch: false,
        data: fallbackTours,
      });
    }
    
    return NextResponse.json({
      success: true,
      count: tours.length,
      exactMatch: true,
      data: tours,
    });
  } catch (error) {
    console.error('Error processing quiz:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
} 