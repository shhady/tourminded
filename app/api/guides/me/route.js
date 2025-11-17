import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the user by session id or email
    const user =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find guide by user ID and populate user data
    const guide = await Guide.findOne({ user: user._id }).populate('user').lean();

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Ensure serialization safety for client usage
    const safeGuide = {
      ...guide,
      _id: guide._id?.toString?.() || guide._id,
      user: guide.user
        ? {
            _id: guide.user._id?.toString?.() || guide.user._id,
            email: guide.user.email || null,
            name: guide.user.name || null,
          }
        : null,
    };

    return NextResponse.json({ guide: safeGuide });
  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 });
  }
} 