import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import Chat from '@/models/Chat';
import User from '@/models/User';
import { sendChatMessageNotificationEmail } from '@/lib/mailer';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { id: guideId } = await params;

    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'You must be logged in to contact the guide' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, name } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the guide and their user ID
    const guide = await Guide.findById(guideId).populate('user');
    if (!guide || !guide.user) {
      return NextResponse.json(
        { success: false, message: 'Guide not found' },
        { status: 404 }
      );
    }

    const guideUserId = guide.user._id;
    const senderId = session.user.id;

    // Check if sending to self
    if (guideUserId.toString() === senderId.toString()) {
      return NextResponse.json(
        { success: false, message: 'You cannot message yourself' },
        { status: 400 }
      );
    }

    // Find or create chat
    const chat = await Chat.findOrCreateChat(senderId, guideUserId);

    // Add message to chat
    await chat.addMessage(message, senderId);

    // Get baseUrl for email links
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Send email notification
    // We pass fromUser explicitly in case session name is outdated or specific name provided
    const fromUser = {
      ...session.user,
      firstName: name?.split(' ')[0] || session.user.name?.split(' ')[0] || 'User', // approximate
      lastName: name?.split(' ').slice(1).join(' ') || '',
      name: name || session.user.name 
    };

    await sendChatMessageNotificationEmail({
      fromUser,
      toUser: guide.user,
      otherUserId: senderId, // The ID the guide should click to chat with
      message,
      baseUrl
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending contact message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
