import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';

export default async function GuideDashboardLayout({ children, params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user with Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  // Connect to database
  await connectDB();
  
  // Find user in our database
  const user = await User.findOne({ clerkId: clerkUser.id });
  
  if (!user) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  // Redirect if not a guide
  if (user.role !== 'guide') {
    redirect(`/${locale}/dashboard`);
    return;
  }
  
  // Get guide data
  const guide = await Guide.findOne({ user: user._id });
  
  // Redirect if guide profile doesn't exist
  if (!guide) {
    redirect(`/${locale}/dashboard/guide/profile`);
    return;
  }
  
  return children;
} 