import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import connectDB from './mongodb';
import User from '@/models/User';

// Get auth options for NextAuth
const getAuthOptions = async () => {
  try {
    const { default: authOptions } = await import('@/pages/api/auth/[...nextauth]');
    return authOptions;
  } catch (error) {
    console.error('Error importing auth options:', error);
    return null;
  }
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Set JWT token in cookie
export const setTokenCookie = async (token) => {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
  } catch (error) {
    console.error('Error setting token cookie:', error);
  }
};

// Remove JWT token from cookie
export const removeTokenCookie = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
  } catch (error) {
    console.error('Error removing token cookie:', error);
  }
};

// Get JWT token from cookie
export const getTokenCookie = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    return token?.value;
  } catch (error) {
    console.error('Error getting token cookie:', error);
    return null;
  }
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Get current user from token
export const getCurrentUser = async () => {
  try {
    // ✅ Set a timeout to avoid long-running database requests
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.warn("⚠️ User authentication timed out, continuing as guest.");
        resolve(null);
      }, 2000);
    });

    // ✅ Connect to MongoDB once
    await connectDB();

    let user = null;

    // ✅ Try to get user from NextAuth session
    try {
      const authOptions = await getAuthOptions();
      if (authOptions) {
        const session = await getServerSession(authOptions);
        if (session?.user) {
          console.log("✅ User found via NextAuth session:", session.user.email);
          user = await Promise.race([
            User.findById(session.user.id).select("-password").lean(),
            timeoutPromise,
          ]);
        }
      }
    } catch (error) {
      console.warn("⚠️ Error retrieving user from NextAuth session:", error);
    }

    // ✅ Try to get user from JWT token if NextAuth session fails
    if (!user) {
      const token = await getTokenCookie();
      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          console.log("✅ User found via JWT authentication:", decoded.email);
          user = await Promise.race([
            User.findById(decoded.id).select("-password").lean(),
            timeoutPromise,
          ]);
        }
      }
    }

    // ✅ If no user found, return null
    if (!user) return null;

    // 🔥 Convert MongoDB fields to plain JavaScript values (Fix the error!)
    return {
      _id: user._id.toString(), // Convert ObjectId to string
      name: user.name,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist || [],
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
  } catch (error) {
    console.error("❌ Error in getCurrentUser:", error);
    return null;
  }
};