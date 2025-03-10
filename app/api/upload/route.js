import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { withAuth } from '@/lib/authMiddleware';

// POST upload an image to Cloudinary (requires authentication)
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await withAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'tourminded';
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;
    
    // Upload to Cloudinary
    const result = await uploadImage(dataURI, folder);
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
} 