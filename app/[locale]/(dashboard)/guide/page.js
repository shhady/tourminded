import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';
import { Calendar, Star, Compass } from 'lucide-react';

export const metadata = {
  title: 'Guide Dashboard | Watermelon Tours',
  description: 'Manage your tours, bookings, and profile as a guide',
};

async function getGuideStats(guideId) {
  await connectDB();
  
  const Booking = (await import('@/models/Booking')).default;
  const Tour = (await import('@/models/Tour')).default;
  const Review = (await import('@/models/Review')).default;
  
  const stats = {
    bookings: await Booking.countDocuments({ guide: guideId }),
    tours: await Tour.countDocuments({ guide: guideId }),
    reviews: await Review.countDocuments({ guide: guideId }),
    upcomingBookings: await Booking.find({ 
      guide: guideId,
      status: 'confirmed',
      'dates.startDate': { $gte: new Date() }
    })
      .populate('user', 'name')
      .populate('tour', 'title')
      .sort({ 'dates.startDate': 1 })
      .limit(5)
  };
  
  return stats;
}

export default async function GuideDashboardPage({ params }) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    const localeParams = await params;
    const locale = localeParams?.locale || 'en';
    redirect(`/${locale}/sign-in`);
    return;
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
  
  // Redirect if not a guide
  if (user.role !== 'guide') {
    redirect(`/${locale}/dashboard`);
    return;
  }
  
  // Get guide data and check if active
  const guide = await Guide.findOne({ user: user._id });
  
  // Redirect if guide profile doesn't exist
  if (!guide) {
    redirect(`/${locale}/profile`);
    return;
  }
  
  // Redirect if guide is not active
  if (!guide.active) {
    redirect(`/${locale}/profile`);
    return;
  }
  
  // Get guide stats
  const stats = await getGuideStats(guide._id);
  
  // Format date based on locale
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6 overflow-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-2">
          {locale === 'en' ? 'Guide Dashboard' : 'لوحة تحكم المرشد'}
        </h1>
        <p className="text-secondary-600 mb-6">
          {locale === 'en' 
            ? 'Welcome to your dashboard. Manage your tours, bookings, and profile from here.'
            : 'مرحبًا بك في لوحة التحكم. يمكنك إدارة جولاتك وحجوزاتك وملفك الشخصي من هنا.'}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-secondary-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-3">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-secondary-600 text-sm">{locale === 'en' ? 'Tours' : 'الجولات'}</p>
              <h3 className="text-2xl font-bold">{stats.tours}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-secondary-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-3">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-secondary-600 text-sm">{locale === 'en' ? 'Bookings' : 'الحجوزات'}</p>
              <h3 className="text-2xl font-bold">{stats.bookings}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-secondary-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-3">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-secondary-600 text-sm">{locale === 'en' ? 'Reviews' : 'التقييمات'}</p>
              <h3 className="text-2xl font-bold">{stats.reviews}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upcoming Bookings */}
      <div className="bg-white border border-secondary-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-secondary-200">
          <h2 className="font-semibold text-secondary-900">
            {locale === 'en' ? 'Upcoming Bookings' : 'الحجوزات القادمة'}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {stats.upcomingBookings && stats.upcomingBookings.length > 0 ? (
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Tour' : 'الجولة'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'User' : 'المستخدم'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Date' : 'التاريخ'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Status' : 'الحالة'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {stats.upcomingBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {booking.tour.title?.en || booking.tour.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">
                        {booking.user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">
                        {formatDate(booking.dates.startDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {locale === 'en' ? 'Confirmed' : 'مؤكد'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-4 text-center text-secondary-500">
              {locale === 'en' ? 'No upcoming bookings' : 'لا توجد حجوزات قادمة'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 