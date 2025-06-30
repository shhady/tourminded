import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';
import AdminGuidesTable from '@/components/admin/AdminGuidesTable';

export const metadata = {
  title: 'Admin Dashboard | Watermelon Tours',
  description: 'Admin panel for managing the platform',
};

export default async function AdminDashboardPage({ params }) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    const localeParams = await params;
    const locale = localeParams?.locale || 'en';
    redirect(`/${locale}/sign-in`);
    return;
  }

  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  await connectDB();
  const user = await User.findOne({ clerkId: clerkUser.id });
  if (!user || user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
    return;
  }

  // Fetch all guides
  const guides = await Guide.find().populate('user');

  // Pass guides and adminName to the client component
  return <AdminGuidesTable guides={JSON.parse(JSON.stringify(guides))} adminName={user.name} />;
} 