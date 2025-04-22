import { NextResponse } from 'next/server';
import  connectToDB from '@/lib/mongodb';
import User from '@/models/User';
import { currentUser } from '@clerk/nextjs/server';

// GET - Get the user's wishlist
export async function GET() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDB();
    
    const user = await User.findOne({ clerkId: clerkUser.id })
      .populate({
        path: 'wishlist.tours',
        populate: {
          path: 'guide',
          select: 'names profileImage nickname'
        }
      })
      .populate('wishlist.guides');
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ message: 'Error fetching wishlist' }, { status: 500 });
  }
}

// PUT - Add or remove an item from wishlist
export async function PUT(request) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { type, id, action } = await request.json();
    
    if (!type || !id || !action || (type !== 'tours' && type !== 'guides') || (action !== 'add' && action !== 'remove')) {
      return NextResponse.json({ message: 'Invalid request parameters' }, { status: 400 });
    }
    
    await connectToDB();
    
    const user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Initialize wishlist if it doesn't exist
    if (!user.wishlist) {
      user.wishlist = { tours: [], guides: [] };
    }
    
    // Ensure the arrays exist
    if (!user.wishlist.tours) user.wishlist.tours = [];
    if (!user.wishlist.guides) user.wishlist.guides = [];
    
    let message = '';
    const itemExists = user.wishlist[type].some(itemId => itemId.toString() === id);
    
    if (action === 'add' && !itemExists) {
      user.wishlist[type].push(id);
      message = type === 'tours' ? 'Tour added to wishlist' : 'Guide added to wishlist';
    } else if (action === 'remove' && itemExists) {
      user.wishlist[type] = user.wishlist[type].filter(itemId => itemId.toString() !== id);
      message = type === 'tours' ? 'Tour removed from wishlist' : 'Guide removed from wishlist';
    } else {
      // Item already exists or doesn't exist when expected
      message = action === 'add' 
        ? `${type === 'tours' ? 'Tour' : 'Guide'} already in wishlist` 
        : `${type === 'tours' ? 'Tour' : 'Guide'} not in wishlist`;
    }
    
    await user.save();
    
    // Get the updated user with populated wishlist
    const updatedUser = await User.findOne({ clerkId: clerkUser.id })
      .populate({
        path: 'wishlist.tours',
        populate: {
          path: 'guide',
          select: 'names profileImage nickname'
        }
      })
      .populate('wishlist.guides');
    
    return NextResponse.json({ 
      success: true, 
      message,
      wishlist: updatedUser.wishlist
    });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json({ message: 'Error updating wishlist' }, { status: 500 });
  }
} 