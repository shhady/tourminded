import { useLocale } from 'next-intl';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Tour from '@/models/Tour';
import Review from '@/models/Review';
import { Calendar, Star, Map, Users } from 'lucide-react';
import { Compass } from 'lucide-react';
import User from '@/models/User';
import Location from '@/models/Location';
import Guide from '@/models/Guide';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard | Watermelon Tours',
  description: 'Manage your tours, bookings, and profile',
};

async function getStats({ role, userId, guideId }) {
  await connectDB();
  
  let stats = {
    bookings: 0,
    tours: 0,
    reviews: 0,
    upcomingBookings: [],
    recentBookings: [],
  };
  
  if (role === 'admin') {
    // Admin sees all stats
    stats.bookings = await Booking.countDocuments();
    stats.tours = await Tour.countDocuments();
    stats.reviews = await Review.countDocuments();
    stats.users = await User.countDocuments();
    stats.guides = await User.countDocuments({ role: 'guide' });
    stats.locations = await Location.countDocuments();
    
    // Upcoming confirmed bookings
    stats.upcomingBookings = await Booking.find({ status: 'confirmed', 'dates.startDate': { $gte: new Date() } })
      .populate('user', 'name email')
      .populate('tour', 'title')
      .populate('guide', 'names nickname')
      .sort({ 'dates.startDate': 1 })
      .limit(5);

    // Recent bookings (latest)
    stats.recentBookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('tour', 'title')
      .populate('guide', 'names nickname')
      .sort({ createdAt: -1 })
      .limit(10);
  } else if (role === 'guide') {
    // Guide sees stats for their tours - use userId directly as guide
    stats.bookings = await Booking.countDocuments({ guide: guideId });
    stats.tours = await Tour.countDocuments({ guide: guideId });
    stats.reviews = await Review.countDocuments({ guide: guideId });
    
    // Upcoming bookings
    stats.upcomingBookings = await Booking.find({ 
      guide: guideId,
      status: 'confirmed',
      'dates.startDate': { $gte: new Date() }
    })
      .populate('user', 'name email')
      .populate('tour', 'title')
      .sort({ 'dates.startDate': 1 })
      .limit(5);

    // Recent bookings
    stats.recentBookings = await Booking.find({ guide: guideId })
      .populate('user', 'name email')
      .populate('tour', 'title')
      .populate('guide', 'names nickname')
      .sort({ createdAt: -1 })
      .limit(10);
  } else {
    // Regular user sees their bookings
    stats.bookings = await Booking.countDocuments({ user: userId });
    stats.reviews = await Review.countDocuments({ user: userId });
    
    // Upcoming bookings
    stats.upcomingBookings = await Booking.find({ 
      user: userId,
      status: 'confirmed',
      'dates.startDate': { $gte: new Date() }
    })
      .populate('guide', 'names nickname')
      .populate('tour', 'title')
      .sort({ 'dates.startDate': 1 })
      .limit(5);

    // Recent bookings
    stats.recentBookings = await Booking.find({ user: userId })
      .populate('guide', 'names nickname')
      .populate('tour', 'title')
      .sort({ createdAt: -1 })
      .limit(10);
  }
  
  return stats;
}

export default async function DashboardPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  await connectDB();
  const userData = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
  if (!userData) {
    return null;
  }
  let guideId = null;
  if (userData.role === 'guide') {
    const guide = await Guide.findOne({ user: userData._id });
    guideId = guide ? guide._id : null;
  }
  const stats = await getStats({ role: userData.role, userId: userData._id, guideId });
  // Format date based on locale
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {locale === 'en' ? 'Dashboard' : 'لوحة التحكم'}
      </h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {userData.role === 'admin' ? ( <Link href={`/${locale}/dashboard/admin/bookings`}>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-primary-100 p-3 mr-4">
            <Calendar className="text-primary-600 text-xl" />
          </div>
          <div>
            <h3 className="text-secondary-500 text-sm font-medium">
              {locale === 'en' ? 'Bookings' : 'الحجوزات'}
            </h3>
            <p className="text-2xl font-bold">{stats.bookings}</p>
          </div>
        </div>
        </Link>) : null}
        {userData.role === 'admin' || userData.role === 'guide' ? (
        <Link href={`/${locale}/dashboard/admin/tours`}>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="rounded-full bg-primary-100 p-3 mr-4">
              <Compass className="text-primary-600 text-xl" />
            </div>
            <div>
              <h3 className="text-secondary-500 text-sm font-medium">
                {locale === 'en' ? 'Tours' : 'الجولات'}
              </h3>
              <p className="text-2xl font-bold">{stats.tours}</p>
            </div>
          </div>
          </Link>
        ) : null}
        
       
        {userData.role === 'admin' && (
          <>
          <Link href={`/${locale}/dashboard/admin/users`}>
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="rounded-full bg-primary-100 p-3 mr-4">
                <Users className="text-primary-600 text-xl" />
              </div>
              <div>
                <h3 className="text-secondary-500 text-sm font-medium">
                  {locale === 'en' ? 'Users' : 'المستخدمين'}
                </h3>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
            </div>
            </Link>            
            <Link href={`/${locale}/dashboard/admin/guides`}>
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="rounded-full bg-primary-100 p-3 mr-4">
                <Users className="text-primary-600 text-xl" />
              </div>
              <div>
                <h3 className="text-secondary-500 text-sm font-medium">
                  {locale === 'en' ? 'Guides' : 'المرشدين'}
                </h3>
                <p className="text-2xl font-bold">{stats.guides}</p>
              </div>
            </div>
            </Link>
            
          </>
        )}
      </div>
      
      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h2 className="font-bold text-lg">
            {locale === 'en' ? 'Upcoming Bookings' : 'الحجوزات القادمة'}
          </h2>
        </div>
        
        {/* Desktop table */}
        <div className="overflow-x-auto hidden md:block w-full mx-auto">
          {stats.upcomingBookings.length > 0 ? (
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Tour' : 'الجولة'}
                  </th>
                  {userData.role === 'admin' || userData.role === 'guide' ? (
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'User' : 'المستخدم'}
                    </th>
                  ) : (
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'Guide' : 'المرشد'}
                    </th>
                  )}
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
                    {userData.role === 'admin' || userData.role === 'guide' ? (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">
                          {booking.user?.name || booking.user?.email || '-'}
                        </div>
                      </td>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">
                          {booking.guide?.nickname || booking.guide?.names?.[0]?.value || '-'}
                        </div>
                      </td>
                    )}
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

        {/* Mobile cards */}
        <div className="md:hidden px-4 py-4 space-y-4">
          {stats.upcomingBookings.length > 0 ? (
            stats.upcomingBookings.map((booking) => (
              <div
                key={booking._id}
                className="border border-secondary-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="text-sm font-semibold text-secondary-900 mb-1">
                  {booking.tour.title?.en || booking.tour.title}
                </div>
                <div className="text-xs text-secondary-500 mb-1">
                  {userData.role === 'admin' || userData.role === 'guide'
                    ? (booking.user?.name || booking.user?.email || '-')
                    : (booking.guide?.nickname || booking.guide?.names?.[0]?.value || '-')}
                </div>
                <div className="text-xs text-secondary-500 mb-2">
                  {formatDate(booking.dates.startDate)}
                </div>
                <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 px-2 py-0.5">
                  {locale === 'en' ? 'Confirmed' : 'مؤكد'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-secondary-500 text-sm">
              {locale === 'en' ? 'No upcoming bookings' : 'لا توجد حجوزات قادمة'}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h2 className="font-bold text-lg">
            {locale === 'en' ? 'Recent Bookings' : 'أحدث الحجوزات'}
          </h2>
        </div>
        {/* Desktop table */}
        <div className="overflow-x-auto hidden md:block">
          {stats.recentBookings.length > 0 ? (
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Tour' : 'الجولة'}</th>
                  {userData.role === 'admin' || userData.role === 'guide' ? (
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'User' : 'المستخدم'}</th>
                  ) : (
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Guide' : 'المرشد'}</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Created' : 'تاريخ الإنشاء'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Travelers' : 'المسافرون'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Total' : 'الإجمالي'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Status' : 'الحالة'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {stats.recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">{b.tour?.title?.en || b.tour?.title?.ar || '-'}</div>
                    </td>
                    {userData.role === 'admin' || userData.role === 'guide' ? (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{b.user?.name || b.user?.email || '-'}</div>
                      </td>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{b.guide?.nickname || b.guide?.names?.[0]?.value || '-'}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">{formatDate(b.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">{b.travelers}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">${b.totalPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-4 text-center text-secondary-500">
              {locale === 'en' ? 'No recent bookings' : 'لا توجد حجوزات حديثة'}
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden px-4 py-4 space-y-4">
          {stats.recentBookings.length > 0 ? (
            stats.recentBookings.map((b) => (
              <div
                key={b._id}
                className="border border-secondary-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="text-sm font-semibold text-secondary-900 mb-1">
                  {b.tour?.title?.en || b.tour?.title?.ar || '-'}
                </div>
                <div className="text-xs text-secondary-500 mb-1">
                  {userData.role === 'admin' || userData.role === 'guide'
                    ? (b.user?.name || b.user?.email || '-')
                    : (b.guide?.nickname || b.guide?.names?.[0]?.value || '-')}
                </div>
                <div className="text-xs text-secondary-500 mb-1">
                  {formatDate(b.createdAt)}
                </div>
                <div className="flex justify-between items-center mt-1 text-xs text-secondary-600">
                  <span>
                    {locale === 'en' ? 'Travelers:' : 'المسافرون:'} {b.travelers}
                  </span>
                  <span>
                    {locale === 'en' ? 'Total:' : 'الإجمالي:'} ${b.totalPrice}
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      b.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : b.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : b.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-secondary-500 text-sm">
              {locale === 'en' ? 'No recent bookings' : 'لا توجد حجوزات حديثة'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 