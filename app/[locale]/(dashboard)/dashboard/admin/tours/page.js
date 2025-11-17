import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Tour from '@/models/Tour';
import AdminToursTable from '@/components/admin/AdminToursTable';

export const metadata = {
  title: 'Admin Tours | Watermelon Tours',
  description: 'Manage all tours',
};

export default async function AdminToursPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
    return null;
  }

  await connectDB();
  const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
  if (!user || user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
    return null;
  }

  const tours = await Tour.find()
    .populate('guide', 'nickname names')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <AdminToursTable tours={JSON.parse(JSON.stringify(tours))} />
  );
}


