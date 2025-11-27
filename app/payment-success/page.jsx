'use client';

import React, { useEffect, useState } from 'react';
import { Loader, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const bookingId = searchParams.get('bookingId') || '';
  const tourId = searchParams.get('tourId') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const travelers = searchParams.get('travelers') || '';
  const amount = searchParams.get('amount');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    const finalizeBooking = async () => {
      try {
        // If Stripe did not report success, stop here
        if (redirectStatus && redirectStatus !== 'succeeded') {
          setStatus('error');
          setMessage('Payment did not complete successfully.');
          return;
        }

        if (bookingId) {
          const res = await fetch(`/api/bookings/${bookingId}/confirm-payment`, {
            method: 'POST',
            credentials: 'include',
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to confirm booking after payment.');
          }
        } else if (tourId) {
          const res = await fetch('/api/checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              tour: tourId,
              dates: {
                startDate: startDate || null,
                endDate: endDate || null,
              },
              travelers: Number(travelers || 1),
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to create booking after payment.');
          }
        }

        setStatus('success');
      } catch (err) {
        console.error('Error finalizing booking after payment:', err);
        setStatus('error');
        setMessage(err?.message || 'There was a problem finalizing your booking.');
      }
    };

    finalizeBooking();
  }, [bookingId, tourId, startDate, endDate, travelers, redirectStatus]);

  const goHome = () => {
    router.push('/en');
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      {status === 'processing' && (
        <div className="flex flex-col items-center text-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <div className="text-lg font-semibold text-secondary-900">Processing your payment…</div>
          <p className="text-secondary-600 text-sm">
            Please wait while we confirm your payment and update your booking.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center text-center gap-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
          <div className="text-2xl font-bold text-secondary-900">Payment successful</div>
          {amount && (
            <p className="text-secondary-700">
              You paid <span className="font-semibold">${(Number(amount) / 100).toFixed(2)}</span>.
            </p>
          )}
          <p className="text-secondary-600 text-sm">
            A confirmation email has been sent to you and your guide. Thank you for booking with Watermelon Tours.
          </p>
          <button
            onClick={goHome}
            className="mt-4 px-4 py-2 rounded-md bg-black text-white hover:bg-black/90"
          >
            Back to Home
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center text-center gap-4">
          <XCircle className="w-10 h-10 text-red-600" />
          <div className="text-2xl font-bold text-secondary-900">Payment issue</div>
          <p className="text-secondary-700 text-sm max-w-md">
            {message ||
              'We could not verify your payment. If funds were captured, please contact support with your booking details.'}
          </p>
          <button
            onClick={goHome}
            className="mt-4 px-4 py-2 rounded-md bg-black text-white hover:bg-black/90"
          >
            Back to Home
          </button>
        </div>
      )}
    </main>
  );
}


