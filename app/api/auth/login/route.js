import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 🚨 Validate Input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ✅ Connect to MongoDB (prevents unnecessary connections)
    await connectDB();

    // ✅ Find user by email & return hashed password only
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 🔐 Compare passwords securely
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ✅ Remove password from response for security
    user.password = undefined;

    // 🔑 Generate Auth Token
    const token = generateToken(user._id);

    // ✅ Create Response Object
    const response = NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // ✅ Fix: Set Token Cookie in Response Headers (Vercel-compatible)
    response.headers.set(
      'Set-Cookie',
      `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Path=/`
    );

    // ✅ Helper function to set the cookie
    await setTokenCookie(token);

    return response;
  } catch (error) {
    console.error('❌ Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error, please try again' },
      { status: 500 }
    );
  }
}
