import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function AdminDashboardLayout({ children, params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect(`/${locale}/sign-in`);
    return null;
  }

  await connectDB();
  const user = await User.findOne({ clerkId: clerkUser.id });
  if (!user) {
    redirect(`/${locale}/sign-in`);
    return null;
  }

  if (user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
    return null;
  }

  return children;
}


