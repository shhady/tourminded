import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

// GET - Get all chats for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the MongoDB user by NextAuth session id or email
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Get all chats for this user
    const chats = await Chat.getUserChats(user._id);

    // Format the response with additional user information
    const formattedChats = await Promise.all(chats.map(async (chat) => {
      // Get the other participant (not the current user)
      const otherParticipant = chat.participants.find(
        participant => participant._id.toString() !== user._id.toString()
      );

      // Use stored image from our User model if available
      const profileImage = otherParticipant?.image || null;

      return {
        _id: chat._id,
        otherParticipant: {
          _id: otherParticipant._id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          name: otherParticipant.name,
          fullName: otherParticipant.firstName && otherParticipant.lastName 
            ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
            : otherParticipant.name || 'User',
          profileImage: profileImage
        },
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        messagesCount: chat.messages.length,
        unreadCount: chat.unreadCount.find(entry => entry.userId.toString() === user._id.toString())?.count || 0,
        createdAt: chat.createdAt,
      };
    }));

    return NextResponse.json({
      success: true,
      chats: formattedChats,
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST - Create a new chat or get existing one
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { otherUserId } = await request.json();

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, message: 'Other user ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the MongoDB user by NextAuth session id or email
    const currentUserData = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    if (!currentUserData) {
      return NextResponse.json(
        { success: false, message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Validate that the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return NextResponse.json(
        { success: false, message: 'Other user not found' },
        { status: 404 }
      );
    }

    // Find or create chat between these users
    const chat = await Chat.findOrCreateChat(currentUserData._id, otherUserId);

    return NextResponse.json({
      success: true,
      message: 'Chat created/found successfully',
      chat: {
        _id: chat._id,
        participants: chat.participants,
        messagesCount: chat.messages.length,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
      }
    });

  } catch (error) {
    console.error('Error creating/finding chat:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create/find chat' },
      { status: 500 }
    );
  }
}