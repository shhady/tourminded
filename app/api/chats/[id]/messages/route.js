import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';
import { sendChatMessageNotificationEmail } from '@/lib/mailer';

// POST - Send a new message to a chat
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
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

    // Find the MongoDB user by session id/email
    const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
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

    const trimmedMessage = message.trim();

    // Add the message to the chat
    await chat.addMessage(trimmedMessage, user._id);

    // Populate the sender information for the response
    const updatedChat = await Chat.findById(id)
      .populate('messages.senderId', 'firstName lastName name email');

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

    // Send notification email to the other participant (guide or user)
    try {
      const recipientId = chat.participants.find(
        (participantId) => participantId.toString() !== user._id.toString()
      );
      if (recipientId) {
        const recipient = await User.findById(recipientId).select('email name firstName lastName');
        const baseUrl =
          process.env.NEXTAUTH_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin);

        await sendChatMessageNotificationEmail({
          fromUser: user,
          toUser: recipient,
          chatId: chat._id,
          message: trimmedMessage,
          baseUrl,
        });
      }
    } catch (notifyErr) {
      console.error('Failed to send chat notification email:', notifyErr);
    }

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