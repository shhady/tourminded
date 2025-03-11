import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from './mongodb';

// Middleware for authenticated routes
export async function withAuth() {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return {
        success: false,
        message: 'Not authenticated',
        status: 401,
      };
    }
    
    // Connect to database
    await connectDB();
    
    // Import User model dynamically to avoid circular dependencies
    const { default: User } = await import('@/models/User');
    
    // Find user in our database
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        status: 404,
      };
    }
    
    // Return success with user
    return {
      success: true,
      user,
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
export async function withAdminAuth() {
  try {
    // First check authentication
    const authResult = await withAuth();
    
    if (!authResult.success) {
      return authResult;
    }
    
    // Check if user is admin
    if (authResult.user.role !== 'admin') {
      return {
        success: false,
        message: 'Not authorized',
        status: 403,
      };
    }
    
    // Return success with user
    return {
      success: true,
      user: authResult.user,
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
export async function withGuideAuth() {
  try {
    // First check authentication
    const authResult = await withAuth();
    
    if (!authResult.success) {
      return authResult;
    }
    
    // Check if user is guide
    if (authResult.user.role !== 'guide') {
      return {
        success: false,
        message: 'Not authorized',
        status: 403,
      };
    }
    
    // Return success with user
    return {
      success: true,
      user: authResult.user,
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