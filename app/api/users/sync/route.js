import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';

// This route handles both fetching and creating/updating users
export async function GET() {
  try {
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ clerkId: clerkUser.id });
    
    if (existingUser) {
      // Update existing user but preserve their role
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: clerkUser.id },
        {
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          // Don't update role here - keep the existing role
          updatedAt: new Date(),
        },
        { new: true }
      );
      
      // If user is a guide, fetch guide data
      let guideData = null;
      if (updatedUser.role === "guide") {
        guideData = await Guide.findOne({ user: updatedUser._id });
      }
      
      return NextResponse.json({
        success: true,
        message: 'User updated in MongoDB',
        user: updatedUser,
        guide: guideData
      });
    } else {
      // Create new user
      const newUser = new User({
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        role: 'user', // Default role for new users
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
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();
    
    // Get user data from request body
    const userData = await request.json();
    
    // Check if user already exists in our database
    let user = await User.findOne({ clerkId: clerkUser.id });
    
    if (user) {
      // User exists, return the user
      return NextResponse.json({ user });
    } else {
      // Create new user with data from Clerk
      const newUser = new User({
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        role: userData.role || "user", // Default role is user
        // Add other fields as needed
      });
      
      user = await newUser.save();
      
      // If user is registering as a guide, create a guide profile
      if (userData.role === "guide") {
        const newGuide = new Guide({
          user: user._id,
          name: {
            en: user.name || "",
            ar: ""
          },
          email: user.email || "",
          // Initialize other guide fields with empty values
          nickname: "",
          address: "",
          phone: "",
          languages: [],
          expertise: [],
          about: {
            en: "",
            ar: ""
          },
          profileImage: "",
          driverLicense: {
            date: null,
            number: "",
            image: ""
          },
          vehicle: {},
          reviews: [],
          rating: 0,
          active: false // New guides start as inactive until approved
        });
        
        await newGuide.save();
      }
      
      return NextResponse.json({ user });
    }
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}

// Update user role to guide
export async function PUT(request) {
  try {
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find the user making the request
    const requestingUser = await User.findOne({ clerkId: clerkUser.id });
    
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
    const clerkIdToUpdate = userData.targetClerkId || clerkUser.id;
    
    // Find and update the user
    const user = await User.findOneAndUpdate(
      { clerkId: clerkIdToUpdate },
      { role: "guide" },
      { new: true }
    );
    
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