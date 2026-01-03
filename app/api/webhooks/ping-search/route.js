import { NextResponse } from 'next/server';

export async function GET() {
  const sitemapUrl = 'https://www.watermelontours.com/sitemap.xml';
  
  try {
    // Ping Google
    const googlePing = fetch(`http://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    
    // Ping Bing (optional but good practice)
    const bingPing = fetch(`http://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);

    await Promise.all([googlePing, bingPing]);

    return NextResponse.json({ success: true, message: 'Search engines pinged successfully' });
  } catch (error) {
    console.error('Error pinging search engines:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

