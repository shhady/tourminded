import { NextResponse } from 'next/server';
import { getTokenCookie, verifyToken } from './auth';
import connectDB from './mongodb';

// Middleware for authenticated routes
export async function withAuth(request) {
  try {
    // Get token from cookie
    const token = await getTokenCookie();
    
    if (!token) {
      return {
        success: false,
        message: 'Not authenticated',
        status: 401,
      };
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        success: false,
        message: 'Invalid token',
        status: 401,
      };
    }
    
    // Return success with user ID
    return {
      success: true,
      userId: decoded.id,
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      success: false,
      message: 'Server error',
      status: 500,
    };
  }
}

// Middleware for admin-only routes
export async function withAdminAuth(request) {
  try {
    // First check authentication
    const authResult = await withAuth(request);
    
    if (!authResult.success) {
      return authResult;
    }
    
    // Connect to database
    await connectDB();
    
    // Import User model dynamically to avoid circular dependencies
    const { default: User } = await import('@/models/User');
    
    // Check if user is admin
    const user = await User.findById(authResult.userId);
    
    if (!user || user.role !== 'admin') {
      return {
        success: false,
        message: 'Not authorized',
        status: 403,
      };
    }
    
    // Return success with user
    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return {
      success: false,
      message: 'Server error',
      status: 500,
    };
  }
}

// Middleware for guide-only routes
export async function withGuideAuth(request) {
  try {
    // First check authentication
    const authResult = await withAuth(request);
    
    if (!authResult.success) {
      return authResult;
    }
    
    // Connect to database
    await connectDB();
    
    // Import User model dynamically to avoid circular dependencies
    const { default: User } = await import('@/models/User');
    
    // Check if user is guide
    const user = await User.findById(authResult.userId);
    
    if (!user || user.role !== 'guide') {
      return {
        success: false,
        message: 'Not authorized',
        status: 403,
      };
    }
    
    // Return success with user
    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Guide auth middleware error:', error);
    return {
      success: false,
      message: 'Server error',
      status: 500,
    };
  }
} 