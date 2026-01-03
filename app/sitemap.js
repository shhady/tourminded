import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.watermelontours.com';
  
  // Explicitly include all supported languages for SEO
  const languages = ['en', 'ar'];

  // 1. Define Static Routes
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/tours',
    '/blog',
    '/faq',
  ];

  // Generate sitemap entries for static pages (multilingual)
  const staticRoutes = [];
  
  staticPages.forEach((route) => {
    languages.forEach((lang) => {
      // Construct URLs for alternates (hreflang)
      const alternates = {};
      languages.forEach((l) => {
        alternates[l] = `${baseUrl}/${l}${route}`;
      });

      staticRoutes.push({
        url: `${baseUrl}/${lang}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1.0 : 0.8,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  try {
    await connectDB();
    
    // 2. Fetch All Published Blogs from MongoDB
    // Select only necessary fields to optimize performance
    const blogs = await Blog.find({ isPublished: true })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    // Generate sitemap entries for blogs (multilingual)
    const blogRoutes = [];

    blogs.forEach((post) => {
      languages.forEach((lang) => {
        // Construct URLs for alternates (hreflang) for this specific blog post
        const alternates = {};
        languages.forEach((l) => {
          alternates[l] = `${baseUrl}/${l}/blog/${post.slug}`;
        });

        blogRoutes.push({
          url: `${baseUrl}/${lang}/blog/${post.slug}`,
          lastModified: new Date(post.updatedAt),
          changeFrequency: 'daily', // Encourage frequent crawling for news/blogs
          priority: 0.9, // High priority for content
          alternates: {
            languages: alternates,
          },
        });
      });
    });

    return [...staticRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static routes if DB fails
    return staticRoutes;
  }
}
