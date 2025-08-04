import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

// GET - Get total unread message count for the current user
export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the MongoDB user by Clerk ID
    const user = await User.findOne({ clerkId: clerkUser.id });
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