/**
 * Utility to ping search engines about sitemap updates.
 * Call this function after creating or updating a blog post.
 */
export async function pingSearchEngines() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.watermelontours.com';
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  // Google and Bing have deprecated their ping endpoints in favor of direct GSC API or simply crawling sitemaps.
  // However, for completeness and "suggestion" purposes:
  
  const engines = [
    `http://www.google.com/ping?sitemap=${sitemapUrl}`,
    // `http://www.bing.com/ping?sitemap=${sitemapUrl}` // Bing also deprecated this
  ];

  try {
    const promises = engines.map(url => fetch(url).catch(e => console.error(`Failed to ping ${url}`, e)));
    await Promise.all(promises);
    console.log('Pinged search engines with new sitemap.');
  } catch (error) {
    console.error('Error pinging search engines:', error);
  }
}
