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
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm py-4 px-6 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={`/${locale}`} className="text-2xl font-bold text-primary-600">
            Tourminded
          </Link>
          <div className="flex items-center space-x-4">
            {/* Add user menu or other header elements here */}
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-64 flex-shrink-0">
            <DashboardSidebar locale={locale} userRole={user.role} />
          </aside>
          <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 