import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Link from 'next/link';

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
    <div className="flex flex-col md:flex-row gap-6 container mx-auto px-4 py-8">
      <div className="md:w-64 flex-shrink-0">
        <DashboardSidebar locale={locale} userRole="guide" />
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
} 