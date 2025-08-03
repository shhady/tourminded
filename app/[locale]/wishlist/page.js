'use client';

import { useState, useEffect, use } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import MainLayout from '@/components/layout/MainLayout';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Heart, Loader2, Star, MapPin, Clock, Users, Languages } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import WishlistButton from '@/components/ui/WishlistButton';

export default function WishlistPage({ params }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params);
  const locale = unwrappedParams?.locale || 'en';
  
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState({ tours: [], guides: [] });
  const [activeTab, setActiveTab] = useState('tours');

  console.log(wishlist)
  // Fetch wishlist data
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        router.push(`/${locale}/sign-in?redirect_url=${encodeURIComponent('/wishlist')}`);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/me/wishlist');
        const data = await response.json();
        
        if (data.success) {
          setWishlist(data.wishlist);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWishlist();
  }, [isLoaded, isSignedIn, locale, router]);

  // Helper functions for tours
  const getTourTitle = (tour) => {
    if (!tour) return '';
    
    // Handle case where title is directly a string
    if (typeof tour.title === 'string') {
      return tour.title;
    }
    
    // Handle case where title is an object with locale keys
    if (tour.title && typeof tour.title === 'object') {
      return tour.title[locale] || tour.title.en || tour.title.default || Object.values(tour.title)[0] || '';
    }
    
    // Fallback to name or empty string
    return tour.name || '';
  };

  const getTourDescription = (tour) => {
    if (!tour) return '';
    
    let description = '';
    
    // Handle case where description is directly a string
    if (typeof tour.description === 'string') {
      description = tour.description;
    }
    // Handle case where description is an object with locale keys
    else if (tour.description && typeof tour.description === 'object') {
      description = tour.description[locale] || tour.description.en || tour.description.default || Object.values(tour.description)[0] || '';
    }
    
    // Truncate long descriptions
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  };

  const getGuideName = (guide) => {
    // Case 1: guide is just a string ID
    if (typeof guide === 'string') {
      return locale === 'en' ? 'Tour Guide' : 'مرشد سياحي';
    }
    
    // Case 2: guide is null or undefined
    if (!guide) {
      return locale === 'en' ? 'Tour Guide' : 'مرشد سياحي';
    }
    
    // Case 3: guide has names array (normal case)
    if (guide.names && Array.isArray(guide.names)) {
      // Map locale to language code
      const languageMap = {
        'en': 'English',
        'ar': 'Arabic',
        'he': 'Hebrew'
      };
      
      const languageToFind = languageMap[locale] || 'English';
      
      // Find name in current locale
      const nameObj = guide.names?.find(n => n.language === languageToFind);
      if (nameObj && nameObj.value) {
        return nameObj.value;
      }
      
      // Fallback to English name
      const enNameObj = guide.names?.find(n => n.language === 'English');
      if (enNameObj && enNameObj.value) {
        return enNameObj.value;
      }
    }
    
    // Case 4: guide has fullName property
    if (guide.fullName) {
      return guide.fullName;
    }
    
    // Case 5: guide has firstName and lastName
    if (guide.firstName && guide.lastName) {
      return `${guide.firstName} ${guide.lastName}`;
    }
    
    // Final fallback
    return guide.nickname || guide.username || (locale === 'en' ? 'Tour Guide' : 'مرشد سياحي');
  };

  const getGuideExcerpt = (guide) => {
    if (!guide || !guide.aboutSections) return '';
    
    const languageMap = {
      'en': 'English',
      'ar': 'Arabic',
      'he': 'Hebrew'
    };
    
    const languageToFind = languageMap[locale] || 'English';
    
    const aboutObj = guide.aboutSections.find(a => a.language === languageToFind);
    if (aboutObj && aboutObj.content) {
      return aboutObj.content.length > 100 
        ? aboutObj.content.substring(0, 100) + '...'
        : aboutObj.content;
    }
    
    const enAboutObj = guide.aboutSections.find(a => a.language === 'English');
    if (enAboutObj && enAboutObj.content) {
      return enAboutObj.content.length > 100 
        ? enAboutObj.content.substring(0, 100) + '...'
        : enAboutObj.content;
    }
    
    return '';
  };

  const getLanguageName = (code) => {
    const languageNames = {
      'English': 'English',
      'Arabic': 'العربية',
      'Hebrew': 'עברית',
      'Spanish': 'Español',
      'French': 'Français',
      'German': 'Deutsch',
      'Italian': 'Italiano',
      'Russian': 'Русский',
    };
    
    return languageNames[code] || code;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateYearsOfExperience = (guide) => {
    if (!guide || !guide.expertise || guide.expertise.length === 0 || !guide.expertise[0].licenseIssueDate) {
      return 0;
    }
    
    const licenseYear = new Date(guide.expertise[0].licenseIssueDate).getFullYear();
    const currentYear = new Date().getFullYear();
    return Math.max(0, currentYear - licenseYear);
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <MainLayout locale={locale}>
        <div className="container mx-auto px-4 py-12 min-h-screen">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
            <p className="text-lg text-gray-600">
              {locale === 'en' ? 'Loading your wishlist...' : 'جار تحميل قائمة رغباتك...'}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Empty state for both tabs
  const isEmpty = !wishlist.tours?.length && !wishlist.guides?.length;

  // Empty state for current tab
  const isCurrentTabEmpty = activeTab === 'tours' 
    ? !wishlist.tours?.length 
    : !wishlist.guides?.length;

  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart className="mr-2 text-red-500" />
            {locale === 'en' ? 'My Wishlist' : 'قائمة رغباتي'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'en' 
              ? 'Save your favorite tours and guides to revisit later'
              : 'احفظ الجولات والمرشدين المفضلين لديك للعودة إليهم لاحقًا'}
          </p>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {locale === 'en' ? 'Your wishlist is empty' : 'قائمة رغباتك فارغة'}
            </h2>
            <p className="text-gray-600 mb-6">
              {locale === 'en'
                ? 'Start exploring tours and guides, and save your favorites!'
                : 'ابدأ باستكشاف الجولات والمرشدين، واحفظ المفضلين لديك!'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/tours`}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                {locale === 'en' ? 'Explore Tours' : 'استكشف الجولات'}
              </Link>
              <Link
                href={`/${locale}/guides`}
                className="px-6 py-3 bg-secondary-900 text-white rounded-lg font-medium hover:bg-secondary-800 transition-colors"
              >
                {locale === 'en' ? 'Discover Guides' : 'اكتشف المرشدين'}
              </Link>
            </div>
          </div>
        ) : (
          <Tabs 
            defaultValue="tours" 
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="mb-8">
              <TabsTrigger 
                value="tours"
                className="flex items-center gap-2"
              >
                {locale === 'en' ? 'Saved Tours' : 'الجولات المحفوظة'}
                {wishlist.tours?.length > 0 && (
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {wishlist.tours.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="guides"
                className="flex items-center gap-2"
              >
                {locale === 'en' ? 'Saved Guides' : 'المرشدون المحفوظون'}
                {wishlist.guides?.length > 0 && (
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {wishlist.guides.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tours">
              {wishlist.tours?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {wishlist.tours.map(tour => (
                    <div key={tour._id} className="relative">
                      <WishlistButton
                        id={tour._id.toString()}
                        type="tours"
                        locale={locale}
                        position="top-right"
                        size="default"
                        className="z-30"
                      />
                      <Link 
                        href={`/${locale}/tours/${tour._id}`}
                        className="block group"
                      >
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="relative h-48 w-full">
                            <Image 
                              src={tour.images?.cover?.url || '/images/default-tour.jpg'}
                              alt={getTourTitle(tour)}
                              fill
                              sizes='100vw'
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            
                            <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-md">
                              <span className="font-bold text-primary-600">
                                {formatPrice(tour.price)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                              {getTourTitle(tour)}
                            </h3>
                            
                            <div className="flex items-center mb-3">
                              <div className="flex items-center text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < Math.floor(tour.rating || 5) ? 'fill-current' : ''}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-gray-500 text-sm ml-2">
                                ({tour.reviewCount || 0} {locale === 'en' ? 'reviews' : 'تقييمات'})
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-y-2 mb-3">
                              <div className="flex items-center text-gray-600 w-1/2">
                                <Clock className="w-4 h-4 mr-1" />
                                <span className="text-sm">
                                  {tour.duration} {tour.durationUnit === "hours" ? 
                                    (locale === 'en' ? 
                                      (tour.duration === 1 ? 'hour' : 'hours') : 
                                      (tour.duration === 1 ? 'ساعة' : 'ساعات')) : 
                                    (locale === 'en' ? 
                                      (tour.duration === 1 ? 'day' : 'days') : 
                                      (tour.duration === 1 ? 'يوم' : 'أيام'))
                                  }
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-600 w-1/2">
                                <Users className="w-4 h-4 mr-1" />
                                <span className="text-sm">
                                  {locale === 'en' ? 'Max ' : 'الحد الأقصى '}{tour.maxGroupSize}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-600 w-full">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="text-sm truncate">
                                  {tour.locationNames?.join(', ') || 'Multiple locations'}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {getTourDescription(tour)}
                            </p>
                            
                            <div className="flex items-center mb-4">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                                <Image 
                                  src={
                                    tour.guide && tour.guide.profileImage && tour.guide.profileImage.url 
                                      ? tour.guide.profileImage.url 
                                      : '/images/default-avatar.png'
                                  }
                                  alt={tour.guide ? getGuideName(tour.guide) : 'Tour guide'}
                                  fill
                                  sizes='100vw'
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-sm text-gray-700">
                                {locale === 'en' ? 'By ' : 'بواسطة '} 
                                <span className="font-medium">
                                  {tour.guide ? getGuideName(tour.guide) : (locale === 'en' ? 'Tour Guide' : 'مرشد سياحي')}
                                </span>
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors text-center">
                              {locale === 'en' ? 'View Tour' : 'عرض الجولة'}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    {locale === 'en' ? 'No saved tours yet' : 'لا توجد جولات محفوظة حتى الآن'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {locale === 'en'
                      ? 'Explore tours and click the heart icon to save your favorites!'
                      : 'استكشف الجولات واضغط على أيقونة القلب لحفظ المفضلة لديك!'}
                  </p>
                  <Link
                    href={`/${locale}/tours`}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    {locale === 'en' ? 'Explore Tours' : 'استكشف الجولات'}
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="guides">
              {wishlist.guides?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {wishlist.guides.map(guide => {
                    const yearsExperience = calculateYearsOfExperience(guide);
                    
                    return (
                      <div key={guide._id} className="relative">
                        <WishlistButton
                          id={guide._id.toString()}
                          type="guides"
                          locale={locale}
                          position="top-right"
                          size="default"
                          className="z-30"
                        />
                        <Link 
                          href={`/${locale}/guides/${guide._id}`}
                          className="block group"
                        >
                          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative h-32 w-full">
                              <Image 
                                src={guide.coverImage?.url || '/no-image-cover.png'}
                                alt={`${getGuideName(guide)} cover image`}
                                fill
                                sizes='100vw'
                                className="object-cover"
                              />
                              
                              <div className="absolute -bottom-10 left-5">
                                <div className="relative w-20 h-20 rounded-full border-4 border-white overflow-hidden">
                                  <Image 
                                    src={guide.profileImage?.url || '/images/default-avatar.png'}
                                    alt={getGuideName(guide) || 'Guide profile image'}
                                      fill
                                    sizes='100vw'
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-5 pt-12">
                              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                                {getGuideName(guide)}
                              </h3>
                              
                              <div className="flex items-center mb-3">
                                <div className="flex items-center text-yellow-500">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < Math.floor(guide.rating || 5) ? 'fill-current' : ''}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-gray-500 text-sm ml-2">
                                  ({guide.reviewCount || 0} {locale === 'en' ? 'reviews' : 'تقييمات'})
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-600 mb-3">
                                <Languages className="w-4 h-4 mr-1" />
                                <span className="text-sm">
                                  {guide.languages?.map(l => getLanguageName(l.language)).join(', ')}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {getGuideExcerpt(guide)}
                              </p>
                              
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">{yearsExperience}</span>
                                <span className="ml-1">
                                  {locale === 'en' 
                                    ? `year${yearsExperience !== 1 ? 's' : ''} of experience` 
                                    : `سنة${yearsExperience !== 1 ? '' : ''} من الخبرة`}
                                </span>
                              </div>
                              
                              <div className="w-full bg-gray-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors text-center">
                                {locale === 'en' ? 'View Profile' : 'عرض الملف الشخصي'}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    {locale === 'en' ? 'No saved guides yet' : 'لا يوجد مرشدون محفوظون حتى الآن'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {locale === 'en'
                      ? 'Discover guides and click the heart icon to save your favorites!'
                      : 'اكتشف المرشدين واضغط على أيقونة القلب لحفظ المفضلين لديك!'}
                  </p>
                  <Link
                    href={`/${locale}/guides`}
                    className="px-6 py-3 bg-secondary-900 text-white rounded-lg font-medium hover:bg-secondary-800 transition-colors"
                  >
                    {locale === 'en' ? 'Discover Guides' : 'اكتشف المرشدين'}
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
} 