export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.watermelontours.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', 
        '/api/', 
        // Explicitly allowing these is default but good for clarity if we had broader disallows
        // '/_next/', 
        // '/static/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
