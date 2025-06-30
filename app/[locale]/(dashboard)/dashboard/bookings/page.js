import { useLocale } from 'next-intl';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Link from 'next/link';
import { Eye, Edit, X } from 'lucide-react';

export const metadata = {
  title: 'Bookings | Watermelon Tours',
  description: 'Manage your bookings',
};

async function getBookings(userId, role) {
  await connectDB();
  
  let filter = {};
  
  if (role === 'admin') {
    // Admin sees all bookings
    filter = {};
  } else if (role === 'guide') {
    // Guide sees bookings for their tours
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: userId });
    
    if (guide) {
      filter = { guide: guide._id };
    }
  } else {
    // Regular user sees their bookings
    filter = { user: userId };
  }
  
  const bookings = await Booking.find(filter)
    .populate('user', 'name email')
    .populate('tour', 'title price duration durationUnit')
    .populate('guide', 'name profileImage')
    .sort({ 'dates.startDate': -1 });
  
  return bookings;
}

export default async function BookingsPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  const user = await getCurrentUser();
  const bookings = await getBookings(user._id, user.role);
  
  // Format date based on locale
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };
  
  // Translate status
  const translateStatus = (status) => {
    if (locale === 'en') return status.charAt(0).toUpperCase() + status.slice(1);
    
    const statusTranslations = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    
    return statusTranslations[status] || status;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {locale === 'en' ? 'Bookings' : 'الحجوزات'}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {bookings.length > 0 ? (
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Tour' : 'الجولة'}
                  </th>
                  {user.role === 'admin' || user.role === 'guide' ? (
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
                    {locale === 'en' ? 'Travelers' : 'المسافرين'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Total' : 'المجموع'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Status' : 'الحالة'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Actions' : 'الإجراءات'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {booking.tour.title?.en || booking.tour.title}
                      </div>
                    </td>
                    {user.role === 'admin' || user.role === 'guide' ? (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">
                          {booking.user.name}
                        </div>
                        <div className="text-sm text-secondary-400">
                          {booking.user.email}
                        </div>
                      </td>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">
                          {booking.guide.name?.en || booking.guide.name}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">
                        {formatDate(booking.dates.startDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">
                        {booking.travelers}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">
                        ${booking.totalPrice}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(booking.status)}`}>
                        {translateStatus(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/dashboard/bookings/${booking._id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye />
                        </Link>
                        {booking.status === 'pending' && (
                          <>
                            {(user.role === 'admin' || user.role === 'guide') && (
                              <Link
                                href={`/dashboard/bookings/${booking._id}/edit`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit />
                              </Link>
                            )}
                            <Link
                              href={`/dashboard/bookings/${booking._id}/cancel`}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X />
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-4 text-center text-secondary-500">
              {locale === 'en' ? 'No bookings found' : 'لم يتم العثور على حجوزات'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 