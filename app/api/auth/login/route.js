import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user._id);

    // Create a response
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

    // Set the token cookie directly on the response
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Also use the helper function to set the cookie
    await setTokenCookie(token);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 