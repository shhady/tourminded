import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  // In dev, this will surface clearly in the logs
  console.error('STRIPE_SECRET_KEY is not set');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' }) : null;

export async function POST(request) {
  try {
    if (!stripe) {
      return new Response('Stripe is not configured', { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const amount = body?.amount;
    const bookingId = body?.bookingId;

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a positive integer in cents.' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: bookingId || '',
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}


