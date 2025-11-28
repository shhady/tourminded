import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Faq from '@/models/Faq';

// PUT: update an FAQ entry (admin only)
export async function PUT(request, { params }) {
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

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const question = body.question !== undefined ? body.question.toString().trim() : undefined;
    const answer = body.answer !== undefined ? body.answer.toString().trim() : undefined;
    const order = typeof body.order === 'number' ? body.order : undefined;

    const update = {};
    if (question !== undefined) update.question = question;
    if (answer !== undefined) update.answer = answer;
    if (order !== undefined) update.order = order;

    const faq = await Faq.findByIdAndUpdate(id, update, { new: true });
    if (!faq) {
      return NextResponse.json({ success: false, message: 'FAQ not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: faq });
  } catch (err) {
    console.error('Error updating FAQ:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE: remove an FAQ entry (admin only)
export async function DELETE(request, { params }) {
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

    const { id } = await params;

    const faq = await Faq.findByIdAndDelete(id);
    if (!faq) {
      return NextResponse.json({ success: false, message: 'FAQ not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    console.error('Error deleting FAQ:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}


