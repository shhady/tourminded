import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  
  try {
    const { active } = await req.json();
    
    if (typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Active status must be a boolean' }, { status: 400 });
    }
    
    const guide = await Guide.findByIdAndUpdate(id, { active }, { new: true });
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    
    return NextResponse.json({ guide });
  } catch (err) {
    console.error('Error updating guide status:', err);
    return NextResponse.json({ error: 'Failed to update guide status' }, { status: 500 });
  }
} 