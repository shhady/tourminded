import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    // Await params to get the id
    const localeParams = await params;
    const id = await localeParams.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Location ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Import models
    const Tour = (await import('@/models/Tour')).default;
    const Location = (await import('@/models/Location')).default;
    
    // Make sure Guide model is imported before using populate
    await import('@/models/Guide');
    
    // First try to find the location by ID or name
    let location;
    try {
      // Try to find by ObjectId
      location = await Location.findById(id);
    } catch (error) {
      console.log('Not a valid ObjectId, trying to find by name');
    }
    
    // If not found by ID, try to find by name
    if (!location) {
      location = await Location.findOne({
        $or: [
          { 'name.en': { $regex: new RegExp(`^${id}$`, 'i') } },
          { 'name.ar': { $regex: new RegExp(`^${id}$`, 'i') } }
        ]
      });
    }
    
    let tours = [];
    
    // If location found, find tours by location ID
    if (location) {
      try {
        tours = await Tour.find({
          locations: location._id,
          isActive: true
        })
        .populate('guide', 'name profileImage rating reviewCount')
        .sort({ createdAt: -1 });
      } catch (error) {
        console.error('Error finding tours by location ID:', error);
      }
      
      // If no tours found by ID, try to find by location name
      if (tours.length === 0) {
        try {
          const locationName = location.name.en;
          tours = await Tour.find({
            locationNames: { $regex: new RegExp(locationName, 'i') },
            isActive: true
          })
          .populate('guide', 'name profileImage rating reviewCount')
          .sort({ createdAt: -1 });
        } catch (error) {
          console.error('Error finding tours by location name:', error);
        }
      }
    } else {
      // If location not found, try to find tours by the ID as a location name
      try {
        tours = await Tour.find({
          locationNames: { $regex: new RegExp(id, 'i') },
          isActive: true
        })
        .populate('guide', 'name profileImage rating reviewCount')
        .sort({ createdAt: -1 });
      } catch (error) {
        console.error('Error finding tours by location name string:', error);
      }
    }
    
    // Return the tours
    return NextResponse.json({
      success: true,
      count: tours.length,
      data: tours
    });
  } catch (error) {
    console.error('Error finding tours by location:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 