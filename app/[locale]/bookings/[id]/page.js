import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import ApproveButton from './ApproveButton';
import SpecialRequestsClient from './SpecialRequestsClient';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';

export const metadata = {
  title: 'Booking Details | Watermelon Tours',
  description: 'View booking details',
};

export default async function BookingDetailsPage({ params }) {
  const paramsData = await params;
  const locale = paramsData?.locale || 'en';
  const bookingId = paramsData?.id;

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

  const booking = await Booking.findById(bookingId)
    .populate('tour', 'title price pricePer duration durationUnit maxGroupSize')
    .populate('guide', 'names nickname')
    .populate('user', 'name email')
    .lean();

  if (!booking) {
    redirect(`/${locale}/bookings`);
    return null;
  }

  // Access control: only the user who booked can view this page
  if (String(booking.user?._id) !== String(user._id)) {
    redirect(`/${locale}/bookings`);
    return null;
  }

  const t = (en, ar) => (locale === 'en' ? en : ar);
  const formatDate = (date) => date ? new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const guideName = booking.guide?.nickname || booking.guide?.names?.[0]?.value || '-';
  const tourTitle = booking.tour?.title?.en || booking.tour?.title?.ar || '-';
  const extras = Array.isArray(booking.specialRequestsCheckBoxes) ? booking.specialRequestsCheckBoxes : [];
  const extrasPlain = extras.map((it) => ({
    specialRequest: it?.specialRequest || '',
    specialRequestPrice: Number(it?.specialRequestPrice) || 0,
    specialRequestPricePerGroupOrPerson: it?.specialRequestPricePerGroupOrPerson === 'person' ? 'person' : 'group',
  }));
  const extrasTotal = extrasPlain.reduce((sum, it) => sum + (Number(it?.specialRequestPrice) || 0), 0);
  const canApprove = !booking.approvedOfferUser;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="mb-6">
        <Link href={`/${locale}/bookings`} className="text-primary-600 hover:text-primary-800">{t('← Back to My Bookings', '← الرجوع إلى حجوزاتي')}</Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{t('Booking Details', 'تفاصيل الحجز')}</h1>
      <p className="text-secondary-600 mb-6">{t('Review your booking information below.', 'راجع تفاصيل حجزك أدناه.')}</p>

      <div className="bg-white rounded-lg shadow divide-y divide-secondary-200">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-secondary-600">{t('Tour', 'الجولة')}</div>
            <div className="text-secondary-900 font-semibold">{tourTitle}</div>
          </div>
          <div>
            <div className="text-sm text-secondary-600">{t('Guide', 'المرشد')}</div>
            <div className="text-secondary-900 font-semibold">{guideName}</div>
          </div>
          <div>
            <div className="text-sm text-secondary-600">{t('Dates', 'التواريخ')}</div>
            <div className="text-secondary-900 font-semibold">{formatDate(booking.dates?.startDate)}{booking.dates?.endDate ? ` → ${formatDate(booking.dates.endDate)}` : ''}</div>
          </div>
          <div>
            <div className="text-sm text-secondary-600">{t('Travelers', 'المسافرون')}</div>
            <div className="text-secondary-900 font-semibold">{booking.travelers}</div>
          </div>
          <div>
            <div className="text-sm text-secondary-600">{t('Status', 'الحالة')}</div>
            <div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {booking.status}
              </span>
              <div className="mt-2">
                {booking.approvedOfferGuide && booking.approvedOfferUser ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">{t('Both approved', 'تمت موافقة الطرفين')}</span>
                ) : booking.approvedOfferGuide ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">{t('Guide approved', 'تمت موافقة المرشد')}</span>
                ) : booking.approvedOfferUser ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs">{t('You approved', 'لقد وافقت')}</span>
                ) : null}
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-secondary-600">{t('Payment', 'الدفع')}</div>
            <div className="text-secondary-900 font-semibold capitalize">{booking.paymentStatus || 'pending'}</div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-sm text-secondary-600 mb-1">{t('Notes', 'ملاحظات')}</div>
          <div className="text-secondary-800 whitespace-pre-line">{booking.specialRequests || t('None', 'لا يوجد')}</div>
        </div>

        <div className="p-6">
          <div className="text-sm text-secondary-600 mb-3">{t('Price Breakdown', 'تفاصيل السعر')}</div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Item', 'البند')}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('Price', 'السعر')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-100">
                <tr>
                  <td className="px-4 py-2 text-sm text-secondary-800">
                    {t('Base tour price', 'سعر الجولة الأساسي')}{' '}
                    {booking.tour?.pricePer === 'person' ? t('(per person)', '(لكل شخص)') : t('(per group)', '(لكل مجموعة)')}
                  </td>
                  <td className="px-4 py-2 text-sm text-secondary-900 text-right">
                    ${booking.tour?.pricePer === 'person' ? (Number(booking.tour?.price || 0) * Number(booking.travelers || 1)) : Number(booking.tour?.price || 0)}
                  </td>
                </tr>
                {extras.map((it, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-secondary-800">{it?.specialRequest || t('Special request', 'طلب خاص')}</td>
                    <td className="px-4 py-2 text-sm text-secondary-900 text-right">${Number(it?.specialRequestPrice || 0)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-2 text-sm font-semibold text-secondary-900">{t('Total', 'الإجمالي')}</td>
                  <td className="px-4 py-2 text-sm font-semibold text-secondary-900 text-right">${Number(booking.totalPrice || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <SpecialRequestsClient
          locale={locale}
          bookingId={String(booking._id)}
          travelers={booking.travelers}
          tourPrice={booking.tour?.price}
          tourPricePer={booking.tour?.pricePer || 'group'}
          items={extrasPlain}
          userAlreadyApproved={!!booking.approvedOfferUser}
          otherApproved={!!booking.approvedOfferGuide}
        />
      </div>
    </div>
  );
}


