import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import Booking from '@/models/Booking';
import Review from '@/models/Review';
import { Calendar, Star, Map, Users, Edit, Check, X } from 'lucide-react';
import { Compass } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Guide Dashboard | Tourminded',
  description: 'Manage your guide profile, tours, and bookings',
};

async function getGuideStats(userId) {
  await connectDB();
  
  let stats = {
    bookings: 0,
    tours: 0,
    reviews: 0,
    upcomingBookings: [],
    guideStatus: false,
  };
  
  try {
    // Get guide ID from user
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: userId });
    
    if (!guide) {
      return stats;
    }
    
    // Get stats for this guide using guide._id instead of userId
    stats.bookings = await Booking.countDocuments({ guide: userId });
    stats.tours = await Tour.countDocuments({ guide: userId });
    stats.reviews = await Review.countDocuments({ guide: userId });
    stats.guideStatus = guide.active;
    
    // Get upcoming bookings
    stats.upcomingBookings = await Booking.find({ 
      guide: guide._id,
      status: 'confirmed',
      'dates.startDate': { $gte: new Date() }
    })
      .populate('user', 'name')
      .populate('tour', 'title')
      .sort({ 'dates.startDate': 1 })
      .limit(5);
    
    // Log for debugging
    console.log(`Guide ID: ${guide._id}, Tours count: ${stats.tours}, Bookings count: ${stats.bookings}`);
    
    return stats;
  } catch (error) {
    console.error('Error getting guide stats:', error);
    return stats;
  }
}

export default async function GuideDashboardPage({ params }) {
  // Ensure params.locale is properly awaited
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Redirect if not authenticated or not a guide
  if (!user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/dashboard/guide`);
  }
  
  if (user.role !== 'guide') {
    redirect(`/${locale}/dashboard`);
  }
  
  // Get guide stats
  const stats = await getGuideStats(user._id);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {locale === 'en' ? 'Guide Dashboard' : 'لوحة تحكم المرشد'}
      </h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <Compass size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-secondary-900">
                {locale === 'en' ? 'Total Tours' : 'إجمالي الجولات'}
              </h3>
              <p className="text-3xl font-bold text-secondary-900">{stats.tours}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-100 text-accent-600">
              <Calendar size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-secondary-900">
                {locale === 'en' ? 'Total Bookings' : 'إجمالي الحجوزات'}
              </h3>
              <p className="text-3xl font-bold text-secondary-900">{stats.bookings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <Star size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-secondary-900">
                {locale === 'en' ? 'Reviews' : 'التقييمات'}
              </h3>
              <p className="text-3xl font-bold text-secondary-900">{stats.reviews}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stats.guideStatus ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'}`}>
              {stats.guideStatus ? <Check size={24} /> : <X size={24} />}
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-secondary-900">
                {locale === 'en' ? 'Status' : 'الحالة'}
              </h3>
              <p className={`text-lg font-bold ${stats.guideStatus ? 'text-success-600' : 'text-warning-600'}`}>
                {stats.guideStatus 
                  ? (locale === 'en' ? 'Active' : 'نشط') 
                  : (locale === 'en' ? 'Inactive' : 'غير نشط')}
              </p>
              {!stats.guideStatus && (
                <p className="text-xs text-secondary-500 mt-1">
                  {locale === 'en' 
                    ? 'Waiting for admin approval' 
                    : 'في انتظار موافقة المسؤول'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-secondary-900">
          {locale === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            href={`/${locale}/dashboard/guide/tours/new`}
            variant="primary"
            className="text-black"
          >
            {locale === 'en' ? 'Create New Tour' : 'إنشاء جولة جديدة'}
          </Button>
          <Button 
            href={`/${locale}/dashboard/guide/tours`}
            variant="outline"
            className="text-black"
          >
            {locale === 'en' ? 'Manage Tours' : 'إدارة الجولات'}
          </Button>
          <Button 
            href={`/${locale}/dashboard/guide/bookings`}
            variant="outline"
            className="text-black"
          >
            {locale === 'en' ? 'View Bookings' : 'عرض الحجوزات'}
          </Button>
          <Button 
            href={`/${locale}/dashboard/guide/reviews`}
            variant="outline"
            className="text-black"
          >
            {locale === 'en' ? 'View Reviews' : 'عرض التقييمات'}
          </Button>
          <Button 
            href={`/${locale}/dashboard/guide/profile`}
            variant="outline"
            className="text-black"
          >
            {locale === 'en' ? 'Edit Profile' : 'تعديل الملف الشخصي'}
          </Button>
        </div>
      </div>
      
      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-secondary-900">
          {locale === 'en' ? 'Upcoming Bookings' : 'الحجوزات القادمة'}
        </h2>
        
        {stats.upcomingBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-900 uppercase tracking-wider">
                    {locale === 'en' ? 'Tour' : 'الجولة'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-900 uppercase tracking-wider">
                    {locale === 'en' ? 'Customer' : 'العميل'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-900 uppercase tracking-wider">
                    {locale === 'en' ? 'Date' : 'التاريخ'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-900 uppercase tracking-wider">
                    {locale === 'en' ? 'Travelers' : 'المسافرين'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-900 uppercase tracking-wider">
                    {locale === 'en' ? 'Actions' : 'الإجراءات'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {stats.upcomingBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {booking.tour?.title?.[locale] || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{booking.user?.name || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        {formatDate(booking.dates?.startDate)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{booking.travelers}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/${locale}/dashboard/guide/bookings/${booking._id}`}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {locale === 'en' ? 'View Details' : 'عرض التفاصيل'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-secondary-900">
            {locale === 'en' 
              ? 'No upcoming bookings found.' 
              : 'لم يتم العثور على حجوزات قادمة.'}
          </p>
        )}
        
        <div className="mt-4">
          <Link 
            href={`/${locale}/dashboard/guide/bookings`}
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            {locale === 'en' ? 'View All Bookings →' : '← عرض جميع الحجوزات'}
          </Link>
        </div>
      </div>
    </div>
  );
} 