import { NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function GET() {
  try {
    // Remove the token cookie
    await removeTokenCookie();
    
    // Create a response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
    
    // Also clear the token cookie directly on the response
    response.cookies.delete('token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
} 