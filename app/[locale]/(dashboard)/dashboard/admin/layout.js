import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function AdminDashboardLayout({ children, params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
    return null;
  }

  await connectDB();
  const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
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


