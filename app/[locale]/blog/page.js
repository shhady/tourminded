'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Search, Newspaper } from 'lucide-react';

export default function BlogPage({ params }) {
  const resolvedParams = use(params);
  const locale = resolvedParams?.locale || 'en';
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [blogPosts, setBlogPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch blogs from API
  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs?published=true');
        const json = await res.json();
        if (json.success) {
          setBlogPosts(json.data);
          setFilteredPosts(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  // Apply filters
  useEffect(() => {
    if (loading) return;
    
    let filtered = blogPosts;
    
    // Apply category filter (if we decide to implement categories properly later, for now using tags as categories or just "All")
    // Currently the model uses 'tags', not a single category field.
    // We can extract unique tags to use as categories if needed.
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query) || 
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredPosts(filtered);
  }, [searchQuery, blogPosts, loading]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <MainLayout locale={locale}>
      {/* Hero Section */}
      <div className="relative bg-secondary-900 text-white py-20">
        <div className="absolute inset-0 bg-secondary-900/50 mix-blend-multiply "></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading text-black">
            {locale === 'en' ? 'Our Blog' : 'مدونتنا'}
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-secondary-100 text-black">
            {locale === 'en' 
              ? 'Discover stories, tips, and insights about the Holy Land.' 
              : 'اكتشف قصصًا ونصائح ورؤى حول الأراضي المقدسة.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder={locale === 'en' ? 'Search articles...' : 'ابحث عن مقالات...'}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-10 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              dir={locale === 'en' ? 'ltr' : 'rtl'}
            />
            <Search className={`absolute ${locale === 'en' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5`} />
          </div>
        </div>

        {/* Blog Grid */}
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link 
                href={`/${locale}/blog/${post.slug}`} 
                key={post._id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-secondary-100 flex flex-col h-full"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  {post.mainImage ? (
                    <Image
                      src={post.mainImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary-100 flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-secondary-300" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary-700 shadow-sm">
                    {post.tags[0] || 'General'}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-xs text-secondary-500 mb-3">
                    <span>{formatDate(post.createdAt)}</span>
                    {/* <span className="mx-2">•</span> */}
                    {/* <span>{locale === 'en' ? 'By Admin' : 'بواسطة المشرف'}</span> */}
                  </div>
                  
                  <h3 className="text-xl font-bold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-secondary-600 mb-4 line-clamp-3 text-sm flex-grow text-black">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-primary-600 font-medium text-sm mt-auto">
                    {locale === 'en' ? 'Read More' : 'اقرأ المزيد'}
                    <ArrowLeft className={`w-4 h-4 ${locale === 'en' ? 'rotate-180 ml-2' : 'mr-2'}`} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-secondary-900 mb-2">
              {locale === 'en' ? 'No articles found' : 'لم يتم العثور على مقالات'}
            </h3>
            <p className="text-secondary-600">
              {locale === 'en' 
                ? 'Try adjusting your search or category filter.' 
                : 'حاول تعديل البحث أو تصفية الفئات.'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
