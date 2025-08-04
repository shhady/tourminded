import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

// GET - Get a specific chat with all messages
export async function GET(request, { params }) {
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

    // Find the chat by ID and ensure user is a participant
    const chat = await Chat.findOne({
      _id: id,
      participants: user._id
    }).populate('participants', 'firstName lastName name clerkId')
      .populate('messages.senderId', 'firstName lastName name clerkId');

    if (!chat) {
      return NextResponse.json(
        { success: false, message: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    // Get the other participant
    const otherParticipant = chat.participants.find(
      participant => participant._id.toString() !== user._id.toString()
    );

    // Format messages with sender information
    const formattedMessages = chat.messages.map(message => ({
      _id: message._id,
      message: message.message,
      senderId: message.senderId._id,
      senderName: message.senderId.firstName && message.senderId.lastName
        ? `${message.senderId.firstName} ${message.senderId.lastName}`
        : message.senderId.name || 'User',
      isCurrentUser: message.senderId._id.toString() === user._id.toString(),
      createdAt: message.createdAt,
      status: message.status,
    }));

    return NextResponse.json({
      success: true,
      chat: {
        _id: chat._id,
        otherParticipant: {
          _id: otherParticipant._id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          name: otherParticipant.name,
          fullName: otherParticipant.firstName && otherParticipant.lastName 
            ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
            : otherParticipant.name || 'User'
        },
        messages: formattedMessages,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
      }
    });

  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}