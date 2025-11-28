import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Faq from '@/models/Faq';

// GET: list all FAQ entries (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    const admin =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const faqs = await Faq.find().sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: faqs,
    });
  } catch (err) {
    console.error('Error fetching FAQ list:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch FAQ list' },
      { status: 500 }
    );
  }
}

// POST: create a new FAQ entry (admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    const admin =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const question = (body.question || '').toString().trim();
    const answer = (body.answer || '').toString().trim();
    const order = typeof body.order === 'number' ? body.order : 0;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, message: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const faq = await Faq.create({ question, answer, order });

    return NextResponse.json({
      success: true,
      data: faq,
    });
  } catch (err) {
    console.error('Error creating FAQ:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}


