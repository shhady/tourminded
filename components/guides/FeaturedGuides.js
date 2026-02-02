import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Languages, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';

// Helper function to get guide name based on locale
const getGuideName = (guide, locale) => {
  if (!guide || !guide.names) return '';
  
  // Map locale to language code
  const languageMap = {
    'en': 'English',
    'ar': 'Arabic',
    'he': 'Hebrew'
  };
  
  const languageToFind = languageMap[locale] || 'English';
  
  // Find name in current locale
  const nameObj = guide.names?.find(n => n.language === languageToFind);
  
  return nameObj?.value || guide.names?.[0]?.value || '';
};

// Helper function to get guide expertise based on locale
const getGuideExpertise = (guide, locale) => {
  if (!guide || !guide.expertise) return [];
  
  return guide.expertise.map(exp => exp.area).slice(0, 3); // Limit to 3 expertise areas
};

// Helper function to get guide languages
const getGuideLanguages = (guide) => {
  if (!guide || !guide.languages) return [];
  
  return guide.languages.map(lang => lang.language).slice(0, 3); // Limit to 3 languages
};

// Helper function to get guide location/address
const getGuideLocation = (guide) => {
  if (!guide || !guide.address) return '';
  return guide.address;
};

// Fetch top-rated guides from database
async function getFeaturedGuides() {
  try {
    await connectDB();
    
    const guides = await Guide.find({ active: true })
      .populate('user', 'firstName lastName')
      .select('names profileImage rating reviewCount languages expertise aboutSections address active')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(4);
      
    return guides;
  } catch (error) {
    console.error('Error fetching featured guides:', error);
    return [];
  }
}

const FeaturedGuides = async ({ locale }) => {
  const guides = await getFeaturedGuides();

  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5HdWlkZTwvdGV4dD48L3N2Zz4=';

  return (
    <section className="py-16 bg-secondary-50 ">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
            {locale === 'en' ? 'Top-Rated Guides' : 'المرشدين الأعلى تقييماً'}
          </h2>
          <p className="text-xl  max-w-3xl mx-auto text-black">
            {locale === 'en'
              ? 'Meet our experienced local guides who will make your journey unforgettable'
              : 'تعرف على مرشدينا المحليين ذوي الخبرة الذين سيجعلون رحلتك لا تُنسى'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {guides.map((guide) => {
            const guideName = getGuideName(guide, locale);
            const guideExpertise = getGuideExpertise(guide, locale);
            const guideLanguages = getGuideLanguages(guide);
            const guideLocation = getGuideLocation(guide);
            const profileImageUrl = guide.profileImage?.url || placeholderImage;
            
            return (
              <Link
                key={guide._id}
                href={`/${locale}/guides/${guide._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={profileImageUrl}
                    alt={guideName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-black">{guideName.split(' ')[0]}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <Star className="text-yellow-500 mr-1" size={16} />
                    <span className="font-medium text-black">{guide.rating.toFixed(1) || 0}</span>
                    <span className="text-black ml-1">
                      ({guide.reviewCount || 0} {locale === 'en' ? 'reviews' : 'تقييمات'})
                    </span>
                  </div>
                  
                  {/* Location */}
                  {guideLocation && (
                    <div className="flex items-center mb-3 text-black">
                      <MapPin className="mr-2" size={16} />
                      <span>{guideLocation}</span>
                    </div>
                  )}
                  
                  {/* Languages */}
                  {guideLanguages.length > 0 && (
                    <div className="flex items-center mb-4 text-black">
                      <Languages className="mr-2 text-lg" size={18} />
                      <span>{guideLanguages.join(', ')}</span>
                    </div>
                  )}
                  
                  {/* Expertise */}
                  {guideExpertise.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {guideExpertise.map((exp, index) => (
                        <span
                          key={index}
                          className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Show message if no guides found */}
        {guides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary-600">
              {locale === 'en' ? 'No guides available at the moment.' : 'لا توجد مرشدين متاحين في الوقت الحالي.'}
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href={`/${locale}/guides`}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white  hover:text-white transition-colors"
          >
           <Button className='text-white'>{locale === 'en' ? 'View All Guides' : 'عرض جميع المرشدين'}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGuides;