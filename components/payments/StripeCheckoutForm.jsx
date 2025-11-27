'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader } from 'lucide-react';

export default function StripeCheckoutForm({
  locale = 'en',
  bookingId,
  booking,
  amount,
  tourId,
  startDate,
  endDate,
  travelers,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const t = (en, ar) => (locale === 'en' ? en : ar);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const params = new URLSearchParams();
      if (bookingId) params.set('bookingId', bookingId);
      if (tourId) params.set('tourId', tourId);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (travelers) params.set('travelers', String(travelers));
      if (amount) params.set('amount', String(amount));

      const qs = params.toString();
      const returnUrl = qs ? `${origin}/payment-success?${qs}` : `${origin}/payment-success`;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (error) {
        setErrorMessage(error.message || t('Payment failed. Please try again.', 'فشل الدفع. يرجى المحاولة مرة أخرى.'));
      }
    } catch (err) {
      setErrorMessage(
        err?.message || t('Payment failed. Please try again.', 'فشل الدفع. يرجى المحاولة مرة أخرى.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="border border-secondary-200 rounded-md p-3">
        <PaymentElement />
      </div>
      {errorMessage && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-60 flex items-center gap-2"
      >
        {submitting ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            {t('Processing…', 'جار المعالجة...')}
          </>
        ) : (
          t('Pay Now', 'ادفع الآن')
        )}
      </button>
    </form>
  );
}


