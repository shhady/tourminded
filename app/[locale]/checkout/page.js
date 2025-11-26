'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage({ params }) {
  const localeParams = React.use(params);
  const locale = localeParams?.locale || 'en';

  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = useMemo(() => searchParams?.get('bookingId') || '', [searchParams]);
  const tourId = useMemo(() => searchParams?.get('tourId') || '', [searchParams]);
  const startDate = useMemo(() => searchParams?.get('startDate') || '', [searchParams]);
  const endDate = useMemo(() => searchParams?.get('endDate') || '', [searchParams]);
  const travelers = useMemo(() => searchParams?.get('travelers') || '', [searchParams]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (bookingId) {
          const res = await fetch(`/api/bookings/${bookingId}`, { credentials: 'include' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to load booking');
          setBooking(data.data);
        }
      } catch (e) {
        setError(e.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  const payNow = async () => {
    setPaying(true);
    setError('');
    try {
      if (bookingId) {
        const res = await fetch(`/api/bookings/${bookingId}/confirm-payment`, {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Payment failed');
        setSuccess(true);
        setBooking(data.data);
      } else {
        // No booking yet (no special requests): create and mark paid in one step
        const res = await fetch('/api/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tour: tourId,
            dates: {
              startDate: startDate ? new Date(startDate) : null,
              endDate: endDate ? new Date(endDate) : null,
            },
            travelers: Number(travelers || 1),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Payment failed');
        setSuccess(true);
        setBooking(data.data);
      }
    } catch (e) {
      setError(e.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const backToTour = () => {
    if (booking?.tour?._id) router.push(`/${locale}/tours/${booking.tour._id}`);
    else router.push(`/${locale}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        {locale === 'en' ? 'Checkout' : 'الدفع'}
      </h1>

      <div className="mb-4 p-3 rounded bg-secondary-50 text-secondary-700">
        {locale === 'en'
          ? 'This is a demo checkout page. We will integrate Stripe later.'
          : 'هذه صفحة دفع تجريبية. سنقوم بدمج Stripe لاحقاً.'}
      </div>

      {!bookingId && !tourId && (
        <div className="p-4 rounded bg-red-100 text-red-700">
          {locale === 'en' ? 'Missing bookingId or tour details in URL.' : 'معلومات الحجز أو الجولة مفقودة في الرابط.'}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-secondary-600">
          <Loader className="w-4 h-4 animate-spin" />
          {locale === 'en' ? 'Loading booking...' : 'جاري تحميل الحجز...'}
        </div>
      ) : bookingId ? (
        // Existing booking flow
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <div className="text-sm text-secondary-600 mb-1">
              {locale === 'en' ? 'Tour' : 'الجولة'}
            </div>
            <div className="text-lg font-semibold text-secondary-900">
              {booking?.tour?.title?.en || booking?.tour?.title?.ar || 'Tour'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-secondary-600 mb-1">
                {locale === 'en' ? 'Dates' : 'التواريخ'}
              </div>
              <div className="text-secondary-900">
                {booking?.dates?.startDate
                  ? new Date(booking.dates.startDate).toLocaleDateString()
                  : '-'}
                {booking?.dates?.endDate
                  ? ` → ${new Date(booking.dates.endDate).toLocaleDateString()}`
                  : ''}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-600 mb-1">
                {locale === 'en' ? 'Travelers' : 'المسافرون'}
              </div>
              <div className="text-secondary-900">{booking.travelers}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-secondary-600 mb-1">
              {locale === 'en' ? 'Total' : 'الإجمالي'}
            </div>
            <div className="text-2xl font-bold text-primary-600">
              ${Number(booking.totalPrice || 0).toFixed(2)}
            </div>
          </div>

          {success ? (
            <div className="mt-6 p-4 rounded border border-green-200 bg-green-50 text-green-800 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5" />
              <div>
                <div className="font-semibold">
                  {locale === 'en' ? 'Payment successful.' : 'تم الدفع بنجاح.'}
                </div>
                <div className="text-sm mt-1">
                  {locale === 'en'
                    ? 'Confirmation emails have been sent to you and the guide.'
                    : 'تم إرسال رسائل تأكيد إلى بريدك وإلى المرشد.'}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {!success && (
              <button
                onClick={payNow}
                disabled={paying}
                className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-60"
              >
                {paying ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    {locale === 'en' ? 'Processing…' : 'جار المعالجة...'}
                  </span>
                ) : (
                  locale === 'en' ? 'Pay Now (Demo)' : 'ادفع الآن (تجريبي)'
                )}
              </button>
            )}
            <button
              onClick={backToTour}
              className="px-4 py-2 rounded-md border border-secondary-300 text-secondary-700 hover:bg-secondary-50"
            >
              {locale === 'en' ? 'Back' : 'رجوع'}
            </button>
          </div>

          <div className="mt-6 text-xs text-secondary-500">
            {locale === 'en'
              ? 'After we integrate Stripe, this button will redirect to a Stripe Checkout session.'
              : 'بعد دمج Stripe سيتم تحويلك إلى صفحة الدفع في Stripe.'}
          </div>
        </div>
      ) : tourId ? (
        // Intent flow (no booking yet)
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <div className="text-sm text-secondary-600 mb-1">
              {locale === 'en' ? 'Tour' : 'الجولة'}
            </div>
            <div className="text-lg font-semibold text-secondary-900">
              {locale === 'en' ? 'Selected Tour' : 'الجولة المحددة'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-secondary-600 mb-1">
                {locale === 'en' ? 'Dates' : 'التواريخ'}
              </div>
              <div className="text-secondary-900">
                {startDate ? new Date(startDate).toLocaleDateString() : '-'}
                {endDate ? ` → ${new Date(endDate).toLocaleDateString()}` : ''}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-600 mb-1">
                {locale === 'en' ? 'Travelers' : 'المسافرون'}
              </div>
              <div className="text-secondary-900">{travelers || 1}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-secondary-600 mb-1">
              {locale === 'en' ? 'Total' : 'الإجمالي'}
            </div>
            <div className="text-secondary-700">
              {locale === 'en'
                ? 'Total will be calculated at confirmation.'
                : 'سيتم حساب الإجمالي عند التأكيد.'}
            </div>
          </div>

          {success ? (
            <div className="mt-6 p-4 rounded border border-green-200 bg-green-50 text-green-800 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5" />
              <div>
                <div className="font-semibold">
                  {locale === 'en' ? 'Payment successful.' : 'تم الدفع بنجاح.'}
                </div>
                <div className="text-sm mt-1">
                  {locale === 'en'
                    ? 'Confirmation emails have been sent to you and the guide.'
                    : 'تم إرسال رسائل تأكيد إلى بريدك وإلى المرشد.'}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {!success && (
              <button
                onClick={payNow}
                disabled={paying || !tourId || !startDate}
                className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-60"
              >
                {paying ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    {locale === 'en' ? 'Processing…' : 'جار المعالجة...'}
                  </span>
                ) : (
                  locale === 'en' ? 'Pay Now (Demo)' : 'ادفع الآن (تجريبي)'
                )}
              </button>
            )}
            <button
              onClick={backToTour}
              className="px-4 py-2 rounded-md border border-secondary-300 text-secondary-700 hover:bg-secondary-50"
            >
              {locale === 'en' ? 'Back' : 'رجوع'}
            </button>
          </div>

          <div className="mt-6 text-xs text-secondary-500">
            {locale === 'en'
              ? 'After we integrate Stripe, this button will redirect to a Stripe Checkout session.'
              : 'بعد دمج Stripe سيتم تحويلك إلى صفحة الدفع في Stripe.'}
          </div>
        </div>
      ) : null}
    </div>
  );
}


