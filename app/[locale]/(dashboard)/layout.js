import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';

export default async function DashboardLayout({ children, params }) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    const localeParams = await params;
    const locale = localeParams?.locale || 'en';
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/dashboard`);
  }
  
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Connect to database
  await connectDB();
  
  // Find user in our database
  const user = await User.findOne({ clerkId: clerkUser.id });
  
  if (!user) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  return (
    <DashboardWrapper locale={locale} userRole={user.role || 'guide'}>
      {children}
    </DashboardWrapper>
  );
} 