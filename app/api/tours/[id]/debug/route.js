import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';

// GET debug endpoint for a single tour by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to database
    await connectDB();
    
    // Find tour by ID with all fields
    const tour = await Tour.findById(id).lean();
    
    if (!tour) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug tour data',
      data: tour,
      hasTourPlan: !!tour.tourPlan,
      tourPlanLength: tour.tourPlan ? tour.tourPlan.length : 0,
      tourPlanData: tour.tourPlan || null
    });
    
  } catch (error) {
    console.error('Error fetching tour for debug:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 