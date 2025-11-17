import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';

// This route handles both fetching and creating/updating users
export async function GET() {
  try {
    // Get the current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Check if user already exists in MongoDB
    const existingUser =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
    if (existingUser) {
      // Update existing user with session data but preserve role
      existingUser.name = session.user.name || existingUser.name;
      existingUser.email = session.user.email || existingUser.email;
      if (session.user.image) existingUser.image = session.user.image;
      await existingUser.save();
      
      // If user is a guide, fetch guide data
      let guideData = null;
      if (existingUser.role === "guide") {
        guideData = await Guide.findOne({ user: existingUser._id });
      }
      
      return NextResponse.json({
        success: true,
        message: 'User updated in MongoDB',
        user: existingUser,
        guide: guideData
      });
    } else {
      // Create new user
      const newUser = new User({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || undefined,
        role: 'user',
        createdAt: new Date(),
      });
      
      await newUser.save();
      
      return NextResponse.json({
        success: true,
        message: 'User created in MongoDB',
        user: newUser,
        guide: null
      });
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'No authenticated user found' }, { status: 401 });
    }
    
    await connectDB();
    
    // Check if user already exists in MongoDB
    let user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
    
    if (user) {
      // Update existing user with latest session data
      user.email = session.user.email || user.email;
      user.name = session.user.name || user.name;
      user.image = session.user.image || user.image;
      
      await user.save();
      
      return NextResponse.json({ 
        message: 'User updated successfully',
        user 
      });
    } else {
      // Create new user
      const newUser = new User({
        email: session.user.email || '',
        name: session.user.name || '',
        image: session.user.image || undefined,
        role: 'user'
      });
      
      await newUser.save();
      
      return NextResponse.json({ 
        message: 'User created successfully',
        user: newUser 
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ 
      message: 'Failed to sync user',
      error: error.message 
    }, { status: 500 });
  }
}

// Update user role to guide
export async function PUT(request) {
  try {
    // Get the current user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find the user making the request
    const requestingUser =
      (await User.findById(session.user.id)) ||
      (await User.findOne({ email: session.user.email }));
    
    if (!requestingUser) {
      return NextResponse.json(
        { error: "User not found", message: "Your user account was not found in our database" },
        { status: 404 }
      );
    }
    
    const userData = await request.json();
    
    // Check if the user is trying to update their own account or is an admin
    if (userData.targetUserId && requestingUser.role !== 'admin') {
      return NextResponse.json(
        { error: "Forbidden", message: "You don't have permission to update other users" },
        { status: 403 }
      );
    }
    
    // Determine which user to update (self or target)
    const userIdToUpdate = userData.targetUserId || requestingUser._id;
    
    // Find and update the user
    const user = await User.findByIdAndUpdate(userIdToUpdate, { role: 'guide' }, { new: true });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "The user you're trying to update was not found" },
        { status: 404 }
      );
    }
    
    // Check if guide profile already exists
    let guide = await Guide.findOne({ user: user._id });
    
    if (!guide) {
      // Create new guide profile
      guide = new Guide({
        user: user._id,
        name: {
          en: user.name || "",
          ar: ""
        },
        email: user.email || "",
        // Initialize with data from request or empty values
        nickname: userData.nickname || "",
        address: userData.address || "",
        phone: userData.phone || "",
        languages: userData.languages || [],
        expertise: userData.expertise || [],
        about: {
          en: userData.about?.en || "",
          ar: userData.about?.ar || ""
        },
        profileImage: userData.profileImage || "",
        driverLicense: {
          date: userData.driverLicense?.date || null,
          number: userData.driverLicense?.number || "",
          image: userData.driverLicense?.image || ""
        },
        vehicle: userData.vehicle || {},
        reviews: [],
        rating: 0,
        active: false // New guides start as inactive until approved
      });
      
      await guide.save();
    }
    
    return NextResponse.json({ 
      success: true,
      message: "User role updated to guide",
      user,
      guide 
    });
    
  } catch (error) {
    console.error("Error updating user to guide:", error);
    return NextResponse.json(
      { error: "Failed to update user to guide", message: error.message },
      { status: 500 }
    );
  }
} 