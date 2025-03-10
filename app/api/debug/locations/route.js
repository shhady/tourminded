import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    
    const Location = (await import('@/models/Location')).default;
    const locations = await Location.find({});
    
    return NextResponse.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Error checking locations:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
} 