import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();

    // Map incoming fields to schema fields
    const update = {
      name: data.firstName || data.lastName ? `${data.firstName || ''} ${data.lastName || ''}`.trim() : undefined,
      phone: data.phone,
      address: data.address,
    };

    // Remove undefined fields
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const updatedUser = await User.findOneAndUpdate(
      { _id: session.user.id },
      update,
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
} 