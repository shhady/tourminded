import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';

export const metadata = {
  title: 'Admin Bookings | Watermelon Tours',
  description: 'View all bookings on the platform',
};

export default async function AdminBookingsPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
    return null;
  }

  await connectDB();
  const admin = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
  if (!admin || admin.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
    return null;
  }

  const bookings = await Booking.find({})
    .populate('user', 'name email')
    .populate('guide', 'names nickname')
    .populate('tour', 'title')
    .sort({ 'dates.startDate': -1, createdAt: -1 })
    .lean();

  const t = (key, def) => (locale === 'en' ? key : def);
  const formatDate = (date) => new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">{t('Bookings', 'الحجوزات')}</h1>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Tour', 'الجولة')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('User', 'المستخدم')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Guide', 'المرشد')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Dates', 'التواريخ')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Travelers', 'المسافرون')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Total', 'الإجمالي')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Status', 'الحالة')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-100">
            {bookings.map((b) => (
              <tr key={b._id}>
                <td className="px-6 py-4 text-sm text-secondary-900">{b.tour?.title?.en || b.tour?.title?.ar || '-'}</td>
                <td className="px-6 py-4 text-sm text-secondary-700">{b.user?.name || b.user?.email || '-'}</td>
                <td className="px-6 py-4 text-sm text-secondary-700">{b.guide?.nickname || b.guide?.names?.[0]?.value || '-'}</td>
                <td className="px-6 py-4 text-sm text-secondary-700">{formatDate(b.dates?.startDate)}{b.dates?.endDate ? ` → ${formatDate(b.dates.endDate)}` : ''}</td>
                <td className="px-6 py-4 text-sm text-secondary-700">{b.travelers}</td>
                <td className="px-6 py-4 text-sm text-secondary-900">${b.totalPrice}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {bookings.map((b) => (
          <div key={b._id} className="bg-white rounded-lg shadow p-4">
            <div className="font-semibold text-secondary-900">{b.tour?.title?.en || b.tour?.title?.ar || '-'}</div>
            <div className="text-sm text-secondary-700 mt-1">{t('User', 'المستخدم')}: {b.user?.name || b.user?.email || '-'}</div>
            <div className="text-sm text-secondary-700">{t('Guide', 'المرشد')}: {b.guide?.nickname || b.guide?.names?.[0]?.value || '-'}</div>
            <div className="text-sm text-secondary-700">{t('Dates', 'التواريخ')}: {formatDate(b.dates?.startDate)}{b.dates?.endDate ? ` → ${formatDate(b.dates.endDate)}` : ''}</div>
            <div className="text-sm text-secondary-700">{t('Travelers', 'المسافرون')}: {b.travelers}</div>
            <div className="text-sm text-secondary-900 mt-1">{t('Total', 'الإجمالي')}: ${b.totalPrice}</div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


