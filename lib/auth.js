import { currentUser } from '@clerk/nextjs/server';
import connectDB from './mongodb';
import User from '@/models/User';

/**
 * Get the current user from Clerk and find the corresponding user in our database
 * @returns {Promise<Object|null>} The user object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      return null;
    }
    
    // Convert Mongoose document to plain object
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      clerkId: user.clerkId,
      // Add other fields as needed
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>} True if the user is an admin, false otherwise
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Check if the current user is a guide
 * @returns {Promise<boolean>} True if the user is a guide, false otherwise
 */
export async function isGuide() {
  const user = await getCurrentUser();
  return user?.role === 'guide';
} 