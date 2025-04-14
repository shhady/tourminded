'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Cross, Star, Building, Landmark, BookOpen, Theater, Utensils, Globe, Mountain, TreePine, Camera } from 'lucide-react';

const TourTypeCarousel = ({ locale }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(5);
  const carouselRef = useRef(null);
  const isRTL = locale === 'ar';

  // Tour types data with icons instead of images
  const tourTypes = [
    {
      id: 'christian',
      title: locale === 'en' ? 'Christian' : 'المسيحية',
      icon: <Cross className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Explore sacred Christian sites and follow in the footsteps of Jesus' 
        : 'استكشف المواقع المسيحية المقدسة واتبع خطى السيد المسيح',
      color: 'bg-blue-50',
    },
    {
      id: 'jewish',
      title: locale === 'en' ? 'Jewish' : 'اليهودية',
      icon: <Star className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Discover the rich Jewish heritage and historical sites' 
        : 'اكتشف التراث اليهودي الغني والمواقع التاريخية',
      color: 'bg-indigo-50',
    },
    {
      id: 'muslim',
      title: locale === 'en' ? 'Muslim' : 'الإسلامية',
      icon: <Building className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Visit important Islamic sites and learn about Muslim history' 
        : 'زيارة المواقع الإسلامية المهمة والتعرف على التاريخ الإسلامي',
      color: 'bg-green-50',
    },
    {
      id: 'political',
      title: locale === 'en' ? 'Political' : 'السياسية',
      icon: <Landmark className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Understand the complex political landscape of the region' 
        : 'فهم المشهد السياسي المعقد في المنطقة',
      color: 'bg-red-50',
    },
    {
      id: 'historical',
      title: locale === 'en' ? 'Historical' : 'التاريخية',
      icon: <BookOpen className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Journey through thousands of years of fascinating history' 
        : 'رحلة عبر آلاف السنين من التاريخ المثير للاهتمام',
      color: 'bg-amber-50',
    },
    {
      id: 'cultural',
      title: locale === 'en' ? 'Cultural' : 'الثقافية',
      icon: <Theater className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Experience the diverse cultures and traditions of the Holy Land' 
        : 'تجربة الثقافات والتقاليد المتنوعة للأرض المقدسة',
      color: 'bg-purple-50',
    },
    {
      id: 'food',
      title: locale === 'en' ? 'Food' : 'الطعام',
      icon: <Utensils className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Taste the delicious flavors of Middle Eastern cuisine' 
        : 'تذوق النكهات اللذيذة للمطبخ الشرق الأوسط',
      color: 'bg-orange-50',
    },
    {
      id: 'adventure',
      title: locale === 'en' ? 'Adventure' : 'المغامرة',
      icon: <Mountain className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Experience thrilling adventures and unique activities' 
        : 'تجربة مغامرات مثيرة وأنشطة فريدة من نوعها',
      color: 'bg-yellow-50',
    },
    {
      id: 'nature',
      title: locale === 'en' ? 'Nature' : 'الطبيعة',
      icon: <TreePine className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Explore the natural beauty of the Holy Land' 
        : 'استكشف الجمال الطبيعي للأرض المقدسة',
      color: 'bg-green-50',
    },
    {
      id: 'photography',
      title: locale === 'en' ? 'Photography' : 'التصوير',
      icon: <Camera className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Capture the beauty of the Holy Land through your lens' 
        : 'التقط جمال الأرض المقدسة من خلال عدستك',
      color: 'bg-blue-50',
    },
    {
      id: 'culinary',
      title: locale === 'en' ? 'Culinary' : 'الطهي',
      icon: <Utensils className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Experience the rich culinary traditions of the Holy Land' 
        : 'تجربة تقاليد الطهي الغنية في الأرض المقدسة',
      color: 'bg-orange-50',
    },
    {
      id: 'all-inclusive',
      title: locale === 'en' ? 'All-inclusive' : 'شاملة',
      icon: <Globe className="w-12 h-12 text-primary-500" />,
      description: locale === 'en' 
        ? 'Comprehensive tours covering multiple aspects of the Holy Land' 
        : 'جولات شاملة تغطي جوانب متعددة من الأرض المقدسة',
      color: 'bg-teal-50',
    }
  ];

  // Update the number of slides to show based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(3);
      } else {
        setSlidesToShow(5);
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = tourTypes.length;
  const maxIndex = totalSlides - slidesToShow;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < maxIndex ? prevIndex + 1 : maxIndex));
  };

  // Handle navigation for RTL layout
  const handlePrevious = isRTL ? goToNext : goToPrevious;
  const handleNext = isRTL ? goToPrevious : goToNext;
  const disablePrevious = isRTL ? currentIndex === maxIndex : currentIndex === 0;
  const disableNext = isRTL ? currentIndex === 0 : currentIndex === maxIndex;

  return (
    <div className="py-16 bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {locale === 'en' ? 'Explore Tour Types' : 'استكشف أنواع الجولات'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {locale === 'en'
              ? 'Discover the perfect tour experience based on your interests and preferences'
              : 'اكتشف تجربة الجولة المثالية بناءً على اهتماماتك وتفضيلاتك'}
          </p>
        </div>

        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={disablePrevious}
            className={`absolute ${isRTL ? 'right' : 'left'}-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary-600 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${isRTL ? '-mr-5' : '-ml-5'} ${
              disablePrevious ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label={locale === 'en' ? 'Previous' : 'السابق'}
          >
            {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </button>
          
          {/* Carousel Container */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: isRTL 
                  ? `translateX(${currentIndex * (100 / slidesToShow)}%)` 
                  : `translateX(-${currentIndex * (100 / slidesToShow)}%)`
              }}
            >
              {tourTypes.map((tourType) => (
                <div
                  key={tourType.id}
                  className={`px-2 flex-shrink-0`}
                  style={{ width: `${100 / slidesToShow}%` }}
                >
                  <div className={`${tourType.color} rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col p-5 text-center`}>
                    <div className="bg-white p-4 rounded-full shadow-md w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      {tourType.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {tourType.title}
                    </h3>
                    <p className="text-gray-600 mb-5 flex-grow">{tourType.description}</p>
                    <div className="mt-auto">
                      <Link 
                        href={`/${locale}/tours?expertise=${tourType.id}`}
                        className="inline-block bg-white hover:bg-primary-50 text-primary-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                      >
                        {locale === 'en' ? 'Explore Tours' : 'استكشف الجولات'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={disableNext}
            className={`absolute ${isRTL ? 'left' : 'right'}-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary-600 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${isRTL ? '-ml-5' : '-mr-5'} ${
              disableNext ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label={locale === 'en' ? 'Next' : 'التالي'}
          >
            {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6">
          {[...Array(Math.min(5, maxIndex + 1))].map((_, i) => {
            // Create grouped indicators for larger collections
            const isActive = i === Math.min(
              Math.floor(currentIndex / Math.ceil(maxIndex / 5)),
              4
            );
            
            return (
              <button
                key={i}
                className={`w-2 h-2 mx-1 rounded-full ${
                  isActive ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide group ${i + 1}`}
                onClick={() => {
                  const targetIndex = i * Math.ceil(maxIndex / 5);
                  setCurrentIndex(Math.min(targetIndex, maxIndex));
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TourTypeCarousel; 