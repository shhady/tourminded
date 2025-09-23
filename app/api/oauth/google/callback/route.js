import axios from 'axios';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/en/dashboard/guide?calendar=error`);
  }

  try {
    // Debug logging
    console.log('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET);
    console.log('GOOGLE_REDIRECT_URI', process.env.GOOGLE_REDIRECT_URI);
    console.log('code', code);

    // Exchange code for tokens
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    console.log('tokenRes.data', tokenRes.data);

    const { access_token, refresh_token, expires_in, id_token } = tokenRes.data;
    if (!id_token) throw new Error('No id_token returned');

    // Decode id_token to get email
    const decoded = jwt.decode(id_token);
    const email = decoded?.email;
    if (!email) throw new Error('No email in id_token');

    // Connect to DB and find user/guide
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    const guide = await Guide.findOne({ user: user._id });
    if (!guide) throw new Error('Guide not found');

    // Save tokens and calendarId (avoid overwriting an existing refresh token if Google didn't return a new one)
    if (!guide.googleCalendar) guide.googleCalendar = {};
    guide.googleCalendar.accessToken = access_token;
    guide.googleCalendar.calendarId = email;
    guide.googleCalendar.tokenExpiry = new Date(Date.now() + expires_in * 1000);
    if (refresh_token) {
      guide.googleCalendar.refreshToken = refresh_token;
    }
    await guide.save();

    // Redirect back to dashboard success state; calendar fetching will be handled by the dashboard API
    return NextResponse.redirect(`${BASE_URL}/en/dashboard/guide?calendar=connected`);
  } catch (err) {
    if (err.response) {
      console.error('Google OAuth error:', err.response.data);
    } else {
      console.error('Google OAuth error:', err);
    }
    return NextResponse.redirect(`${BASE_URL}/en/dashboard/guide?calendar=error`);
  }
} 