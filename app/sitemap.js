import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.watermelontours.com';
  
  // Static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/tours',
    '/blog',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  try {
    await connectDB();
    const blogs = await Blog.find({ isPublished: true }).select('slug updatedAt');
    
    const blogRoutes = blogs.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...routes, ...blogRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}

