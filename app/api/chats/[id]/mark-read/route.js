import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

// POST - Mark all messages in a chat as read for the current user
export async function POST(request, { params }) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    // Find the MongoDB user by Clerk ID
    const user = await User.findOne({ clerkId: clerkUser.id });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Find the chat and ensure user is a participant
    const chat = await Chat.findOne({
      _id: id,
      participants: user._id
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, message: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    // Mark messages as read for this user
    await chat.markAsRead(user._id);

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read',
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}