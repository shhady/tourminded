import Stripe from 'stripe';

// Note: config.api.bodyParser is used by Pages Router; App Router ignores it,
// but we include it here for clarity about raw-body requirements.
export const config = {
  api: { bodyParser: false },
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set for webhooks');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' }) : null;

export async function POST(request) {
  try {
    if (!stripe) {
      return new Response('Stripe not configured', { status: 500 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const webhookSecret = isProd
      ? process.env.STRIPE_WEBHOOK_SECRET_LIVE
      : process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret is not set');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    const sig = request.headers.get('stripe-signature');
    if (!sig) {
      console.error('Missing Stripe signature header');
      return new Response('Missing signature', { status: 400 });
    }

    const rawBody = await request.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    const type = event.type;
    const obj = event.data?.object || {};

    const getMetadataBookingId = () => {
      return obj?.metadata?.bookingId || '';
    };

    let bookingId = getMetadataBookingId();

    // For charge.succeeded, metadata may live on the PaymentIntent
    if (!bookingId && type === 'charge.succeeded' && obj.payment_intent) {
      try {
        const pi = await stripe.paymentIntents.retrieve(obj.payment_intent);
        bookingId = pi?.metadata?.bookingId || '';
      } catch (err) {
        console.error('Failed to retrieve PaymentIntent for charge.succeeded:', err);
      }
    }

    // For checkout.session.completed, metadata is on the session
    if (!bookingId && type === 'checkout.session.completed') {
      bookingId = obj?.metadata?.bookingId || '';
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const confirmBookingIfNeeded = async () => {
      if (!bookingId) {
        console.warn(`Stripe webhook ${type} received without bookingId metadata.`);
        return;
      }

      try {
        const res = await fetch(`${baseUrl}/api/bookings/${bookingId}/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error(
            `Failed to confirm booking ${bookingId} from webhook ${type}:`,
            res.status,
            data
          );
        }
      } catch (err) {
        console.error(`Error calling confirm-payment for booking ${bookingId}:`, err);
      }
    };

    switch (type) {
      case 'payment_intent.succeeded':
      case 'charge.succeeded':
      case 'checkout.session.completed':
        await confirmBookingIfNeeded();
        break;
      case 'payment_intent.payment_failed':
        // Log failures for visibility; booking remains unconfirmed
        console.warn('Payment failed for intent:', obj?.id, 'bookingId:', bookingId);
        break;
      default:
        // Ignore other events but still return 200
        break;
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Unhandled error in Stripe webhook handler:', err);
    // Never expose stack to Stripe; still return 200 to avoid infinite retries on our own bugs
    return new Response('OK', { status: 200 });
  }
}

/**
 * Testing checklist (use Stripe CLI):
 *
 * 1. Start your dev server on port 3000:
 *    npm run dev
 *
 * 2. In another terminal, run:
 *    stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *
 * 3. Perform a test payment in your app using a test card, e.g.:
 *    4242 4242 4242 4242, any future expiry, any CVC, any ZIP.
 *
 * 4. Verify in your dev logs:
 *    - Webhook is received and signature is verified.
 *    - bookingId is read from event.data.object.metadata.bookingId (or from the PaymentIntent).
 *    - /api/bookings/[bookingId]/confirm-payment is called.
 *    - Booking status and guide availability update as expected in MongoDB.
 */


