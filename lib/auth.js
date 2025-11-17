import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from './mongodb';
import User from '@/models/User';

/**
 * Get the current user from NextAuth and find the corresponding user in our database
 * @returns {Promise<Object|null>} The user object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    // Get current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }
    
    // Connect to database
    await connectDB();
    
    // Find user in our database
    const user =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
    if (!user) {
      return null;
    }
    
    // Convert Mongoose document to plain object
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
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