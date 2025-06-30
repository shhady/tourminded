import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { folder, fileType } = body;

    // Get Cloudinary credentials from environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { message: 'Cloudinary credentials are not configured' },
        { status: 500 }
      );
    }

    // Create timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create the signature string
    const signatureParams = {
      timestamp: timestamp,
      folder: folder || 'Watermelon Tours',
    };

    // Create the signature string
    const signatureString = Object.entries(signatureParams)
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join('&') + apiSecret;

    // Generate the SHA-1 signature
    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex');

    // Return the signature and other necessary parameters
    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { message: 'Failed to generate signature' },
      { status: 500 }
    );
  }
} 