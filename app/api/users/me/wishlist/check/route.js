import { NextResponse } from 'next/server';
import  connectToDB  from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - Check if an item is in the user's wishlist
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'tours' or 'guides'
    const id = searchParams.get('id'); // item id
    
    if (!type || !id || (type !== 'tours' && type !== 'guides')) {
      return NextResponse.json({ message: 'Invalid request parameters' }, { status: 400 });
    }
    
    await connectToDB();
    
        const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Check if item exists in wishlist
    const isInWishlist = user.wishlist && 
                         user.wishlist[type] && 
                         user.wishlist[type].some(itemId => itemId.toString() === id);
    
    return NextResponse.json({ 
      success: true, 
      isInWishlist
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return NextResponse.json({ message: 'Error checking wishlist' }, { status: 500 });
  }
} 