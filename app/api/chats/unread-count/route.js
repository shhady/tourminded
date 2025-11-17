import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

// GET - Get total unread message count for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the MongoDB user by session id/email
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Find all chats where user is a participant and sum unread counts
    const chats = await Chat.find({
      participants: user._id
    });

    let totalUnreadCount = 0;
    chats.forEach(chat => {
      const unreadEntry = chat.unreadCount.find(entry => entry.userId.toString() === user._id.toString());
      if (unreadEntry) {
        totalUnreadCount += unreadEntry.count;
      }
    });

    return NextResponse.json({
      success: true,
      unreadCount: totalUnreadCount,
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}