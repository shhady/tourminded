import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password, becomeGuide } = await request.json();

    // 🚨 Validate input fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // ✅ Connect to MongoDB (prevents unnecessary reconnections)
    await connectDB();

    // ✅ Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }

    // 🔐 Secure Password Hashing (prevents saving raw password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user (using hashed password)
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Ensure only hashed password is stored
      role: becomeGuide ? 'guide' : 'user',
    });

    // 🔑 Generate Token
    const token = generateToken(user._id);

    // ✅ Create response with user details
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
      { status: 201 }
    );

    // ✅ Fix: Proper Cookie Handling (Compatible with Next.js App Router)
    response.headers.set(
      'Set-Cookie',
      `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Path=/`
    );

    // ✅ Use Helper Function (Ensures consistency)
    await setTokenCookie(token);

    return response;
  } catch (error) {
    console.error('❌ Registration Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
