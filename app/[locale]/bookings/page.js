import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Link from 'next/link';

export const metadata = {
  title: 'My Bookings | Watermelon Tours',
  description: 'View your tour bookings',
};

export default async function MyBookingsPage({ params }) {
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

  const bookings = await Booking.find({ user: user._id })
    .populate('tour', 'title')
    .populate('guide', 'names nickname')
    .sort({ createdAt: -1 })
    .lean();

  const t = (en, ar) => (locale === 'en' ? en : ar);
  const formatDate = (date) => new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto py-12 px-2">
      <Link href={`/${locale}`} className="text-primary-600 hover:text-primary-800 mb-10">
        {t('← Back', '← رجوع')}
      </Link>
      <h1 className="text-3xl font-bold my-6">{t('My Bookings', 'حجوزاتي')}</h1>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Tour', 'الجولة')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Guide', 'المرشد')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Dates', 'التواريخ')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Travelers', 'المسافرون')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Total', 'الإجمالي')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Status', 'الحالة')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Actions', 'الإجراءات')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-100">
            {bookings.map(b => (
              <tr key={b._id}>
                <td className="px-6 py-4 text-sm text-secondary-900">{b.tour?.title?.en || b.tour?.title?.ar || '-'}</td>
                <td className="px-6 py-4 text-sm text-secondary-700">{b.guide?.nickname || b.guide?.names?.[0]?.value || '-'}</td>
                <td className="px-6 py-4 text-sm text-secondary-700">{formatDate(b.dates?.startDate)}{b.dates?.endDate ? ` → ${formatDate(b.dates.endDate)}` : ''}</td>
                <td className="px-6 py-4 text-sm text-secondary-700">{b.travelers}</td>
                <td className="px-6 py-4 text-sm text-secondary-900">${b.totalPrice}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/${locale}/bookings/${b._id}`} className="inline-flex items-center px-3 py-1.5 rounded-md bg-black text-white hover:bg-primary-700">
                    {t('View', 'عرض')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="px-6 py-4 text-center text-secondary-500">{t('No bookings found', 'لا توجد حجوزات')}</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {bookings.map(b => (
          <div key={b._id} className="bg-white rounded-lg shadow p-4">
            <div className="font-semibold text-secondary-900">{b.tour?.title?.en || b.tour?.title?.ar || '-'}</div>
            <div className="text-sm text-secondary-700 mt-1">{t('Guide', 'المرشد')}: {b.guide?.nickname || b.guide?.names?.[0]?.value || '-'}</div>
            <div className="text-sm text-secondary-700">{t('Dates', 'التواريخ')}: {formatDate(b.dates?.startDate)}{b.dates?.endDate ? ` → ${formatDate(b.dates.endDate)}` : ''}</div>
            <div className="text-sm text-secondary-700">{t('Travelers', 'المسافرون')}: {b.travelers}</div>
            <div className="text-sm text-secondary-900 mt-1">{t('Total', 'الإجمالي')}: ${b.totalPrice}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {b.status}
              </span>
              <Link href={`/${locale}/bookings/${b._id}`} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                {t('View', 'عرض')}
              </Link>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="px-2 py-4 text-center text-secondary-500">{t('No bookings found', 'لا توجد حجوزات')}</div>
        )}
      </div>
    </div>
  );
}


