import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, becomeGuide } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'user',
    });

    return NextResponse.json({
      message: 'Registered successfully',
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      becomeGuide: !!becomeGuide,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}


