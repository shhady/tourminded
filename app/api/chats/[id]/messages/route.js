import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

// POST - Send a new message to a chat
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
    const { message } = await request.json();

    // Validate input
    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message content is required' },
        { status: 400 }
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

    // Add the message to the chat
    await chat.addMessage(message.trim(), user._id);

    // Populate the sender information for the response
    const updatedChat = await Chat.findById(id)
      .populate('messages.senderId', 'firstName lastName name clerkId');

    // Get the last message (the one we just added)
    const lastMessage = updatedChat.messages[updatedChat.messages.length - 1];
    
    const formattedMessage = {
      _id: lastMessage._id,
      message: lastMessage.message,
      senderId: lastMessage.senderId._id,
      senderName: lastMessage.senderId.firstName && lastMessage.senderId.lastName
        ? `${lastMessage.senderId.firstName} ${lastMessage.senderId.lastName}`
        : lastMessage.senderId.name || 'User',
      isCurrentUser: lastMessage.senderId._id.toString() === user._id.toString(),
      createdAt: lastMessage.createdAt,
      status: lastMessage.status,
    };

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      newMessage: formattedMessage,
      chatId: chat._id,
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}