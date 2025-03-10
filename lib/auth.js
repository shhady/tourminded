import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';

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
    // Try to get user from NextAuth session first
    try {
      const authOptions = await getAuthOptions();
      if (authOptions) {
        const session = await getServerSession(authOptions);
        
        if (session?.user) {
          const { default: User } = await import('@/models/User');
          const userDoc = await User.findById(session.user.id).select('-password');
          if (userDoc) {
            // Serialize the user object
            const user = {
              _id: userDoc._id.toString(),
              name: userDoc.name,
              email: userDoc.email,
              role: userDoc.role,
              createdAt: userDoc.createdAt?.toISOString(),
              updatedAt: userDoc.updatedAt?.toISOString(),
            };
            return user;
          }
        }
      }
    } catch (error) {
      console.error('Error getting user from NextAuth session:', error);
    }
    
    // Fall back to JWT token if NextAuth session is not available
    const token = await getTokenCookie();
    
    if (!token) {
      return null;
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return null;
    }
    
    const { default: User } = await import('@/models/User');
    const userDoc = await User.findById(decoded.id).select('-password');
    
    if (!userDoc) {
      return null;
    }
    
    // Serialize the user object
    const user = {
      _id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt?.toISOString(),
      updatedAt: userDoc.updatedAt?.toISOString(),
    };
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}; 