import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';

// This would come from your database in a real app
// For demonstration purposes, we'll use this sample data
const blogPosts = [
  {
    id: 1,
    title: "The Historical Significance of Jerusalem's Old City",
    excerpt: "Explore the rich history and cultural importance of Jerusalem's Old City, a UNESCO World Heritage site that holds significance for three major religions.",
    content: `
      <p>Jerusalem's Old City is a place of profound historical and religious significance. Enclosed by ancient walls that date back to the Ottoman period, this area spans less than one square kilometer but houses some of the most revered sites in Judaism, Christianity, and Islam.</p>
      
      <p>Within these walls, you'll find the Western Wall, the holiest site where Jews are permitted to pray. It's a remnant of the retaining wall of the Second Temple, built by Herod the Great around 20 BCE. For Jews worldwide, this wall represents their ancient connection to Jerusalem and their faith's endurance through millennia of challenges.</p>
      
      <p>A short distance away stands the Church of the Holy Sepulchre, believed by many Christians to encompass both Golgotha, where Jesus was crucified, and the tomb where he was buried and resurrected. The church is a complex structure with sections controlled by different Christian denominations, each maintaining their traditions in a delicate balance of shared sacred space.</p>
      
      <p>The Dome of the Rock and Al-Aqsa Mosque sit atop the Temple Mount (or Haram al-Sharif), making this compound the third holiest site in Islam. Muslims believe that the Prophet Muhammad ascended to heaven from this location during his Night Journey.</p>
      
      <p>Beyond these major religious landmarks, the Old City is divided into four quarters: Jewish, Christian, Muslim, and Armenian. Each quarter has its distinct character, architecture, and cultural heritage. Wandering through the narrow, winding streets, visitors encounter ancient synagogues, churches, and mosques alongside bustling markets and residential areas.</p>
      
      <p>The archaeological layers beneath the Old City reveal even more of Jerusalem's past, with remains dating back to the Canaanite, Israelite, Roman, Byzantine, and many other periods. Each stone seems to tell a story of conquest, destruction, rebuilding, and the persistent human quest for meaning and connection to the divine.</p>
      
      <p>Understanding Jerusalem's Old City requires appreciating how this small area has shaped world history and continues to influence global politics and religion today. It's a place where past and present coexist, where ancient traditions are practiced daily, and where the complex interplay of faith, history, and identity is visible at every turn.</p>
    `,
    coverImage: '/images/blog/jerusalem-old-city.jpg',
    category: 'History',
    author: 'Dr. Sarah Cohen',
    date: 'May 15, 2023',
    slug: 'historical-significance-jerusalem-old-city'
  },
  {
    id: 2,
    title: 'Culinary Adventures: Street Food Tour of Tel Aviv',
    excerpt: 'Discover the vibrant food scene of Tel Aviv with our guide to the best street food spots that showcase the diverse flavors of Israeli cuisine.',
    content: '<p>Detailed article about Tel Aviv street food would go here...</p>',
    coverImage: '/images/blog/tel-aviv-food.jpg',
    category: 'Food',
    author: 'Chef Michael Levy',
    date: 'June 3, 2023',
    slug: 'culinary-adventures-street-food-tel-aviv'
  },
  {
    id: 3,
    title: 'Understanding the Complex Politics of the Holy Land',
    excerpt: 'A balanced overview of the political landscape in the region, helping visitors understand the context behind the news headlines.',
    content: '<p>Detailed article about regional politics would go here...</p>',
    coverImage: '/images/blog/political-landscape.jpg',
    category: 'Political Tours',
    author: 'Prof. Ahmad Khalidi',
    date: 'July 12, 2023',
    slug: 'understanding-complex-politics-holy-land'
  },
  {
    id: 4,
    title: 'The Dead Sea: Natural Wonder and Healing Destination',
    excerpt: 'Learn about the unique properties of the Dead Sea and why it continues to attract visitors seeking its therapeutic benefits.',
    content: '<p>Detailed article about the Dead Sea would go here...</p>',
    coverImage: '/images/blog/dead-sea.jpg',
    category: 'Nature',
    author: 'Emma Rodriguez',
    date: 'August 5, 2023',
    slug: 'dead-sea-natural-wonder-healing-destination'
  },
  {
    id: 5,
    title: 'Cultural Festivals of the Holy Land: A Year-Round Guide',
    excerpt: 'From Passover to Ramadan to Christmas, discover the vibrant cultural festivals that take place throughout the year in this region.',
    content: '<p>Detailed article about cultural festivals would go here...</p>',
    coverImage: '/images/blog/cultural-festivals.jpg',
    category: 'Culture',
    author: 'Yusuf Ibrahim',
    date: 'September 20, 2023',
    slug: 'cultural-festivals-holy-land-year-round-guide'
  },
  {
    id: 6,
    title: 'Photography Tips for Capturing the Essence of the Holy Land',
    excerpt: 'Professional photography advice to help you capture stunning images that truly represent the beauty and spirit of this unique region.',
    content: '<p>Detailed photography tips would go here...</p>',
    coverImage: '/images/blog/photography-tips.jpg',
    category: 'Photography',
    author: 'Sophia Chen',
    date: 'October 8, 2023',
    slug: 'photography-tips-capturing-essence-holy-land'
  }
];

// Function to get blog post by slug
function getBlogPost(slug) {
  return blogPosts.find(post => post.slug === slug) || null;
}

export async function generateMetadata({ params }) {
  const { slug, locale } = params;
  const post = getBlogPost(slug);
  
  if (!post) {
    return {
      title: locale === 'en' ? 'Post Not Found' : 'المقال غير موجود',
    };
  }
  
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }) {
  // Use React.use() to unwrap the params promise
  const resolvedParams = use(params);
  const { slug, locale } = resolvedParams;
  const post = getBlogPost(slug);
  
  // If post not found, display a message
  if (!post) {
    return (
      <MainLayout locale={locale}>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">
              {locale === 'en' ? 'Post Not Found' : 'المقال غير موجود'}
            </h1>
            <p className="mb-8">
              {locale === 'en' 
                ? 'The blog post you are looking for does not exist.' 
                : 'المقال الذي تبحث عنه غير موجود.'}
            </p>
            <Link 
              href={`/${locale}/blog`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {locale === 'en' ? 'Back to Blog' : 'العودة إلى المدونة'}
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-12">
        {/* Back navigation */}
        <div className="mb-8">
          <Link 
            href={`/${locale}/blog`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'en' ? 'Back to Blog' : 'العودة إلى المدونة'}
          </Link>
        </div>
        
        {/* Article header */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center text-gray-600 mb-8 gap-y-2">
            <div className="flex items-center mr-6">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center mr-6">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-primary-100 text-primary-800">
                {locale === 'en' 
                  ? post.category 
                  : post.category === 'History' 
                    ? 'التاريخ' 
                    : post.category === 'Culture' 
                      ? 'الثقافة' 
                      : post.category === 'Political' 
                        ? 'الجولات السياسية' 
                        : post.category === 'Food' 
                          ? 'الطعام' 
                          : post.category === 'Nature' 
                            ? 'الطبيعة' 
                            : post.category === 'Photography' 
                              ? 'التصوير' 
                              : post.category}
              </span>
            </div>
          </div>
        </div>
        
        {/* Featured image */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden shadow-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        
        {/* Article content */}
        <article className="max-w-4xl mx-auto prose prose-lg lg:prose-xl prose-primary">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        
        {/* Recommended posts - would be implemented in a real blog */}
        <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {locale === 'en' ? 'You Might Also Like' : 'قد يعجبك أيضًا'}
          </h2>
          
          {/* Here you would render recommended posts */}
        </div>
      </div>
    </MainLayout>
  );
} 