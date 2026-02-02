'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

export default function GuideToursSection({ tours, locale }) {
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef(null);
  
  // Show only 4 tours initially, or all if showAll is true
  const displayedTours = showAll ? tours : tours.slice(0, 4);
  const hasMore = tours.length > 4;

  const handleToggle = () => {
    if (showAll) {
      // If currently showing all (and about to show less), scroll to top
      // We use setTimeout to allow the layout to update first if needed, 
      // though typically for 'Show Less' we want to scroll first or simultaneously
      // to avoid jumping. Scrolling before state change or immediately after is fine.
      // Here we scroll to the section top.
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowAll(!showAll);
  };

  if (!tours || tours.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-lg">🧭</span>
          </span>
          {locale === 'en' ? 'Tours by this Guide' : 'جولات هذا المرشد'}
        </h2>
        
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {locale === 'en' 
              ? 'No tours available from this guide yet' 
              : 'لا توجد جولات متاحة من هذا المرشد حتى الآن'}
          </p>
          <Link 
            href={`/${locale}/tours`}
            className="bg-primary-100 hover:bg-primary-200 text-primary-800 font-medium py-2 px-4 rounded-lg transition-colors inline-block"
          >
            {locale === 'en' ? 'Browse all tours' : 'تصفح جميع الجولات'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800 scroll-mt-24">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
          <span className="text-lg">🧭</span>
        </span>
        {locale === 'en' ? 'Tours by this Guide' : 'جولات هذا المرشد'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedTours.map((tour) => (
          <Link 
            key={tour._id} 
            href={`/${locale}/tours/${tour._id}`}
            className="block group"
          >
            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="relative h-48 w-full">
                <Image 
                  src={tour.images?.cover?.url || '/no-image-cover.png'}
                  alt={tour.title?.[locale] || tour.title?.en || 'Tour'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {tour.title?.[locale] || tour.title?.en || 'Tour'}
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-gray-700 ml-1">{tour.rating || 5}</span>
                    <span className="text-gray-500 text-sm ml-1">({tour.reviewCount || 0})</span>
                  </div>
                  
                  <span className="font-bold text-primary-600">
                    ${tour.price || 0}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 mt-auto">
                  {/* Strip HTML tags for preview */
                    (tour.description?.[locale] || tour.description?.en || '')
                      .replace(/<[^>]*>/g, '')
                      .replace(/&nbsp;/g, ' ')
                  }
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleToggle}
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 shadow-sm text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-5 h-5 mr-2" />
                {locale === 'en' ? 'Show Less' : 'عرض أقل'}
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5 mr-2" />
                {locale === 'en' ? 'Show More Tours' : 'عرض المزيد من الجولات'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
