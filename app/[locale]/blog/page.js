'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Search, Newspaper } from 'lucide-react';

// Sample blog posts data
const blogPosts = [
//   {
//     id: 1,
//     title: "The Historical Significance of Jerusalem's Old City",
//     excerpt: "Explore the rich history and cultural importance of Jerusalem's Old City, a UNESCO World Heritage site that holds significance for three major religions.",
//     coverImage: '/images/blog/jerusalem-old-city.jpg',
//     category: 'History',
//     author: 'Dr. Sarah Cohen',
//     date: 'May 15, 2023',
//     slug: 'historical-significance-jerusalem-old-city'
//   },
//   {
//     id: 2,
//     title: 'Culinary Adventures: Street Food Tour of Tel Aviv',
//     excerpt: 'Discover the vibrant food scene of Tel Aviv with our guide to the best street food spots that showcase the diverse flavors of Israeli cuisine.',
//     coverImage: '/images/blog/tel-aviv-food.jpg',
//     category: 'Food',
//     author: 'Chef Michael Levy',
//     date: 'June 3, 2023',
//     slug: 'culinary-adventures-street-food-tel-aviv'
//   },
//   {
//     id: 3,
//     title: 'Understanding the Complex Politics of the Holy Land',
//     excerpt: 'A balanced overview of the political landscape in the region, helping visitors understand the context behind the news headlines.',
//     coverImage: '/images/blog/political-landscape.jpg',
//     category: 'Political',
//     author: 'Prof. Ahmad Khalidi',
//     date: 'July 12, 2023',
//     slug: 'understanding-complex-politics-holy-land'
//   },
//   {
//     id: 4,
//     title: 'The Dead Sea: Natural Wonder and Healing Destination',
//     excerpt: 'Learn about the unique properties of the Dead Sea and why it continues to attract visitors seeking its therapeutic benefits.',
//     coverImage: '/images/blog/dead-sea.jpg',
//     category: 'Nature',
//     author: 'Emma Rodriguez',
//     date: 'August 5, 2023',
//     slug: 'dead-sea-natural-wonder-healing-destination'
//   },
//   {
//     id: 5,
//     title: 'Cultural Festivals of the Holy Land: A Year-Round Guide',
//     excerpt: 'From Passover to Ramadan to Christmas, discover the vibrant cultural festivals that take place throughout the year in this region.',
//     coverImage: '/images/blog/cultural-festivals.jpg',
//     category: 'Culture',
//     author: 'Yusuf Ibrahim',
//     date: 'September 20, 2023',
//     slug: 'cultural-festivals-holy-land-year-round-guide'
//   },
//   {
//     id: 6,
//     title: 'Photography Tips for Capturing the Essence of the Holy Land',
//     excerpt: 'Professional photography advice to help you capture stunning images that truly represent the beauty and spirit of this unique region.',
//     coverImage: '/images/blog/photography-tips.jpg',
//     category: 'Photography',
//     author: 'Sophia Chen',
//     date: 'October 8, 2023',
//     slug: 'photography-tips-capturing-essence-holy-land'
//   }
];

// Get unique categories from blog posts
const categories = ['All', ...new Set(blogPosts.map(post => post.category))];

export default function BlogPage({ params }) {
  // Properly unwrap params with React.use()
  const resolvedParams = use(params);
  const locale = resolvedParams?.locale || 'en';
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);

  // Apply filters when selectedCategory or searchQuery changes
  useEffect(() => {
    let filtered = blogPosts;
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query) || 
        post.author.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredPosts(filtered);
  }, [selectedCategory, searchQuery]);

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Translate category for display
  const translateCategory = (category) => {
    if (locale !== 'en') {
      switch(category) {
        case 'All': return 'الكل';
        case 'History': return 'التاريخ';
        case 'Culture': return 'الثقافة';
        case 'Political': return 'السياسية';
        case 'Food': return 'الطعام';
        case 'Nature': return 'الطبيعة';
        case 'Photography': return 'التصوير';
        default: return category;
      }
    }
    return category;
  };
  
  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-12">
        {/* Back to Tours Link */}
        <div className="mb-8">
          <Link 
            href={`/${locale}/tours`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'en' ? 'Back to Tours' : 'العودة إلى الجولات'}
          </Link>
        </div>
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {locale === 'en' ? 'The Watermelon Blog' : 'مدونة البطيخ'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'en' 
              ? 'Stories, insights, and reflections from the Holy Land' 
              : 'قصص ورؤى وتأملات من الأرض المقدسة'}
          </p>
        </div>
        
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={locale === 'en' ? 'Search articles...' : 'البحث في المقالات...'}
              className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          {/* Categories Filter */}
          <div className="flex overflow-x-auto pb-2 gap-2 w-full md:w-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={` cursor-pointer whitespace-nowrap px-4 py-2 rounded-full border transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white border-primary-600' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {translateCategory(category)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-60 w-full">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-primary-100 text-primary-800">
                      {translateCategory(post.category)}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold mb-3 text-gray-900">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">{post.author}</span>
                      <span className="mx-1">•</span>
                      <span>{post.date}</span>
                    </div>
                    
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      {locale === 'en' ? 'Read More' : 'قراءة المزيد'}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/40 via-transparent to-transparent" />
                <div className="relative px-6 py-12 text-center md:px-10">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600/10 text-primary-600">
                    <Newspaper className="h-7 w-7" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
                    {locale === 'en' ? 'Our blog is coming soon' : 'المدونة قادمة قريبًا'}
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {locale === 'en'
                      ? 'We’re crafting thoughtful stories, guides, and tips from the Holy Land. Check back soon or explore our tours meanwhile.'
                      : 'نعمل على إعداد قصص وإرشادات ونصائح من الأرض المقدسة. عاود الزيارة قريبًا أو استكشف جولاتنا في هذه الأثناء.'}
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <Link
                      href={`/${locale}/tours`}
                      className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-primary-700 transition-colors"
                    >
                      {locale === 'en' ? 'Explore Tours' : 'استكشف الجولات'}
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {locale === 'en' ? 'Clear Filters' : 'مسح عوامل التصفية'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 