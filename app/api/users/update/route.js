import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request) {
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
    
    // Get update data from request
    const data = await request.json();
    console.log(data);
    // Update user data
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.address !== undefined) user.address = data.address;
    
    // Save updated user
    await user.save();
    
    // Also update Clerk user data
    await fetch(`https://api.clerk.dev/v1/users/${userClerk.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
      }),
    });
    
    return NextResponse.json({ 
      message: 'User updated successfully',
      user
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
} 