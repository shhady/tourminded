import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Set or change a user's password (admin only)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    const admin = (await User.findById(session.user.id)) || (await User.findOne({ email: session.user.email }));
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const newPassword = (body?.password || '').toString();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password is required and must be at least 8 characters' },
        { status: 400 }
      );
    }

    const target = await User.findById(id);
    if (!target) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const salt = await bcrypt.genSalt(12);
    target.password = await bcrypt.hash(newPassword, salt);
    await target.save();

    return NextResponse.json({
      success: true,
      message: target.password ? 'Password updated successfully' : 'Password set successfully',
      userId: target._id.toString(),
    });
  } catch (err) {
    console.error('Error setting/changing password:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}


