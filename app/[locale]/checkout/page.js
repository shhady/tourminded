'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import getStripe from '@/lib/getStripe';
import StripeCheckoutForm from '@/components/payments/StripeCheckoutForm';

const stripePromise = getStripe();

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
  const [tour, setTour] = useState(null);
  const [amountCents, setAmountCents] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

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
          const total = Number(data?.data?.totalPrice || 0);
          if (total > 0) {
            setAmountCents(Math.round(total * 100));
          }
        } else if (tourId) {
          const res = await fetch(`/api/tours/${tourId}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to load tour');
          const tourData = data.data;
          setTour(tourData);
          const price = Number(tourData?.price || 0);
          const pricePer = tourData?.pricePer || 'group';
          const tr = Number(travelers || 1) || 1;
          const total = pricePer === 'person' ? price * tr : price;
          if (total > 0) {
            setAmountCents(Math.round(total * 100));
          }
        }
      } catch (e) {
        setError(e.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  // Create PaymentIntent when we know the total
  useEffect(() => {
    const createIntent = async () => {
      try {
        if (!amountCents || (!bookingId && !tourId)) return;
        setClientSecret(null);
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountCents, bookingId: bookingId || null }),
        });
        const data = await res.json();
        if (!res.ok || !data.clientSecret) {
          throw new Error(data.error || 'Failed to start payment');
        }
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Failed to start payment');
      }
    };
    createIntent();
  }, [amountCents, bookingId]);

  const backToTour = () => {
    // Prefer going back in history so the user returns to the page they came from
    if (window.history.length > 1) {
      router.back();
    } else if (booking?.tour?._id) {
      router.push(`/${locale}/tours/${booking.tour._id}`);
    } else {
      router.push(`/${locale}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        {locale === 'en' ? 'Checkout' : 'الدفع'}
      </h1>

      <div className="mb-4 p-3 rounded bg-secondary-50 text-secondary-700">
        {locale === 'en'
          ? 'Secure payment powered by Stripe. Enter your details below to complete your booking.'
          : 'دفع آمن عبر Stripe. أدخل بياناتك أدناه لإتمام الحجز.'}
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
        // Existing booking flow with Stripe
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

          <div className="mt-6">
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm
                  locale={locale}
                  bookingId={bookingId}
                  booking={booking}
                  amount={amountCents}
                />
              </Elements>
            ) : (
              <div className="flex items-center gap-2 text-secondary-600">
                <Loader className="w-4 h-4 animate-spin" />
                {locale === 'en' ? 'Preparing secure payment…' : 'جاري تجهيز عملية الدفع الآمنة...'}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={backToTour}
                className="px-4 py-2 rounded-md border border-secondary-300 text-secondary-700 hover:bg-secondary-50"
              >
                {locale === 'en' ? 'Back' : 'رجوع'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-secondary-500">
            {locale === 'en'
              ? 'Your card will be charged securely by Stripe. You will see a confirmation page after payment.'
              : 'سيتم خصم المبلغ من بطاقتك بأمان عبر Stripe وستظهر لك صفحة تأكيد بعد الدفع.'}
          </div>
        </div>
      ) : tourId ? (
        // Intent flow (no booking yet) – Stripe payment for tour selection
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <div className="text-sm text-secondary-600 mb-1">
              {locale === 'en' ? 'Tour' : 'الجولة'}
            </div>
            <div className="text-lg font-semibold text-secondary-900">
              {tour?.title?.en || tour?.title?.ar || (locale === 'en' ? 'Selected Tour' : 'الجولة المحددة')}
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
            {amountCents ? (
              <div className="text-2xl font-bold text-primary-600">
                ${(amountCents / 100).toFixed(2)}
              </div>
            ) : (
              <div className="text-secondary-700">
                {locale === 'en'
                  ? 'Total will be calculated when pricing is available.'
                  : 'سيتم حساب الإجمالي عند توفر التسعير.'}
              </div>
            )}
          </div>

          <div className="mt-6">
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm
                  locale={locale}
                  bookingId={null}
                  booking={null}
                  amount={amountCents}
                  tourId={tourId}
                  startDate={startDate}
                  endDate={endDate}
                  travelers={travelers || 1}
                />
              </Elements>
            ) : (
              <div className="flex items-center gap-2 text-secondary-600">
                <Loader className="w-4 h-4 animate-spin" />
                {locale === 'en' ? 'Preparing secure payment…' : 'جاري تجهيز عملية الدفع الآمنة...'}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={backToTour}
                className="px-4 py-2 rounded-md border border-secondary-300 text-secondary-700 hover:bg-secondary-50"
              >
                {locale === 'en' ? 'Back' : 'رجوع'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-secondary-500">
            {locale === 'en'
              ? 'Your card will be charged securely by Stripe. You will see a confirmation page after payment.'
              : 'سيتم خصم المبلغ من بطاقتك بأمان عبر Stripe وستظهر لك صفحة تأكيد بعد الدفع.'}
          </div>
        </div>
      ) : null}
    </div>
  );
}


