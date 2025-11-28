import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Faq from '@/models/Faq';

// Public FAQ endpoint: read-only, no auth required
export async function GET() {
  try {
    await connectDB();

    const faqs = await Faq.find().sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: faqs,
    });
  } catch (err) {
    console.error('Error fetching public FAQ list:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch FAQ list' },
      { status: 500 }
    );
  }
}


