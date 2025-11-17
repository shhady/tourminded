import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';

export default async function GuideDashboardLayout({ children, params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  // Connect to database
  await connectDB();
  
  // Find user in our database
  const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
  
  if (!user) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  // Restrict to guides only
  if (user.role !== 'guide') {
    redirect(`/${locale}/dashboard`);
    return;
  }
  
  // Ensure guide profile exists
  const guide = await Guide.findOne({ user: user._id });
  if (!guide) {
    redirect(`/${locale}/dashboard/guide/profile`);
    return;
  }
  
  return children;
} 