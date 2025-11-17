import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';
import AdminGuidesTable from '@/components/admin/AdminGuidesTable';

export const metadata = {
  title: 'Admin Dashboard | Watermelon Tours',
  description: 'Admin panel for managing the platform',
};

export default async function AdminDashboardPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const localeParams = await params;
    const locale = localeParams?.locale || 'en';
    redirect(`/${locale}/sign-in`);
    return;
  }

  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  await connectDB();
  const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
  if (!user || user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
    return;
  }

  // Fetch all guides
  const guides = await Guide.find().populate('user');

  // Pass guides and adminName to the client component
  return <AdminGuidesTable guides={JSON.parse(JSON.stringify(guides))} adminName={user.name} />;
} 