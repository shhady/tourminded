import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Prefer finding by Mongo _id if present, otherwise by email
    const query = session.user.id ? { _id: session.user.id } : { email: session.user.email };
    // Fetch password to compute hasPassword, but don't return it
    const userDoc = await User.findOne(query).select('name email role image phone address createdAt password');

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...safeUser } = userDoc.toObject();
    const hasPassword = Boolean(userDoc.password);

    return NextResponse.json({ user: safeUser, hasPassword });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
} 