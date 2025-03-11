import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';

export async function GET() {
  try {
    const userClerk = await currentUser();
    
    if (!userClerk) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Find the user by Clerk ID
    const user = await User.findOne({ clerkId: userClerk.id });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find guide by user ID and populate user data
    const guide = await Guide.findOne({ user: user._id }).populate('user');
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    
    return NextResponse.json({ guide });
  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 });
  }
} 