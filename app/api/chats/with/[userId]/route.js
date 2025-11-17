import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

// GET - Find or create a chat with a specific user
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    await connectDB();

    // Find the current MongoDB user by session id/email
    const currentUserData = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    if (!currentUserData) {
      return NextResponse.json(
        { success: false, message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Validate that the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return NextResponse.json(
        { success: false, message: 'Other user not found' },
        { status: 404 }
      );
    }

    // Prevent chatting with yourself
    if (currentUserData._id.toString() === userId) {
      return NextResponse.json(
        { success: false, message: 'Cannot create chat with yourself' },
        { status: 400 }
      );
    }

    // Find existing chat between these users (don't create new one)
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserData._id, userId] }
    }).populate('participants', 'firstName lastName name');

    if (!existingChat) {
      return NextResponse.json({
        success: false,
        message: 'No existing chat found',
      }, { status: 404 });
    }

    // Get the other participant information
    const otherParticipant = existingChat.participants.find(
      participant => participant._id.toString() !== currentUserData._id.toString()
    );

    return NextResponse.json({
      success: true,
      message: 'Chat found successfully',
      chat: {
        _id: existingChat._id,
        otherParticipant: {
          _id: otherParticipant._id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          name: otherParticipant.name,
          fullName: otherParticipant.firstName && otherParticipant.lastName 
            ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
            : otherParticipant.name || 'User'
        },
        messagesCount: existingChat.messages.length,
        lastMessageAt: existingChat.lastMessageAt,
        createdAt: existingChat.createdAt,
      }
    });

  } catch (error) {
    console.error('Error finding chat:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to find chat' },
      { status: 500 }
    );
  }
}