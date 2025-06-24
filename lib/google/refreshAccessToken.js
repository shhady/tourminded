import axios from 'axios';

export async function refreshAccessToken(guide) {
  try {
    const res = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: guide.googleCalendar.refreshToken,
        grant_type: 'refresh_token',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, expires_in } = res.data;

    guide.googleCalendar.accessToken = access_token;
    guide.googleCalendar.tokenExpiry = new Date(Date.now() + expires_in * 1000);
    await guide.save();

    return access_token;
  } catch (err) {
    console.error('Failed to refresh Google access token:', err.response?.data || err);
    throw new Error('Token refresh failed');
  }
} 