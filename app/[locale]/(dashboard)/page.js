import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard | Tourminded',
  description: 'Manage your tours, bookings, and profile',
};

export default async function DashboardPage({ params }) {
  const { locale } = params;
  
  // Get current user with Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect(`/${locale}/sign-in`);
  }
  
  // Connect to database
  await connectDB();
  
  // Find user in our database
  const user = await User.findOne({ clerkId: clerkUser.id });
  
  if (!user) {
    redirect(`/${locale}/sign-in`);
  }
  
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {locale === 'en' ? 'Dashboard' : 'لوحة التحكم'}
      </h1>
      
      {/* Simple Dashboard Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {locale === 'en' ? 'Welcome to your dashboard' : 'مرحبًا بك في لوحة التحكم'}
        </h2>
        <p className="text-gray-600 mb-4">
          {locale === 'en' 
            ? 'This is your dashboard where you can manage your tours, bookings, and profile.' 
            : 'هذه هي لوحة التحكم الخاصة بك حيث يمكنك إدارة جولاتك وحجوزاتك وملفك الشخصي.'}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Link 
            href={`/${locale}/dashboard/guide/profile`}
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium mb-2">
              {locale === 'en' ? 'My Profile' : 'ملفي الشخصي'}
            </h3>
            <p className="text-sm text-gray-500">
              {locale === 'en' ? 'View and edit your profile' : 'عرض وتعديل ملفك الشخصي'}
            </p>
          </Link>
          
          <Link 
            href={`/${locale}/dashboard/guide/tours`}
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium mb-2">
              {locale === 'en' ? 'My Tours' : 'جولاتي'}
            </h3>
            <p className="text-sm text-gray-500">
              {locale === 'en' ? 'Manage your tours' : 'إدارة جولاتك'}
            </p>
          </Link>
          
          <Link 
            href={`/${locale}/dashboard/guide/bookings`}
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium mb-2">
              {locale === 'en' ? 'Bookings' : 'الحجوزات'}
            </h3>
            <p className="text-sm text-gray-500">
              {locale === 'en' ? 'View your bookings' : 'عرض حجوزاتك'}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
} 