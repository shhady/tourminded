'use client';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Clock, Users, ChevronRight, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function ToursClientPage({ initialTours, filterOptions, locale, isFiltered, filterValues }) {
  const [tours] = useState(initialTours);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  
  // Helper function to format activity level
  const formatActivityLevel = (level) => {
    if (locale === 'en') {
      switch (level) {
        case 'easy': return 'Easy';
        case 'moderate': return 'Moderate';
        case 'challenging': return 'Challenging';
        default: return level;
      }
    } else {
      switch (level) {
        case 'easy': return 'سهل';
        case 'moderate': return 'متوسط';
        case 'challenging': return 'صعب';
        default: return level;
      }
    }
  };
  
  // Helper function to format language
  const formatLanguage = (lang) => {
    if (locale === 'en') {
      switch (lang) {
        case 'en': return 'English';
        case 'ar': return 'Arabic';
        case 'he': return 'Hebrew';
        default: return lang;
      }
    } else {
      switch (lang) {
        case 'en': return 'الإنجليزية';
        case 'ar': return 'العربية';
        case 'he': return 'العبرية';
        default: return lang;
      }
    }
  };
  
  // Handle form submission with explicit button click
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    // Get form data
    const formData = new FormData(e.target);
    const params = new URLSearchParams();
    
    // Add form values to params
    for (const [key, value] of formData.entries()) {
      if (value) {
        console.log(`Adding filter: ${key}=${value}`);
        params.append(key, value);
      }
    }
    
    // Navigate to the same page with new query params
    const queryString = params.toString();
    console.log('Applying filters:', queryString);
    
    // Force a hard navigation to ensure the server component re-renders with new filters
    window.location.href = `/${locale}/tours${queryString ? `?${queryString}` : ''}`;
  };
  
  // Direct apply filter function for the button
  const applyFilters = () => {
    // Manually submit the form
    document.getElementById('filter-form').submit();
  };
  
  // Clear all filters function
  const clearFilters = (e) => {
    e.preventDefault();
    console.log('Clearing all filters');
    // Force a hard navigation to the base tours page
    window.location.href = `/${locale}/tours`;
  };
  
  if (!tours || tours.length === 0) {
    // If no tours found, show a message instead of 404
    return (
      <MainLayout locale={locale}>
        
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-8 text-center">
            {locale === 'en' ? 'No Tours Available' : 'لا توجد جولات متاحة'}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {locale === 'en' 
              ? 'We couldn\'t find any tours matching your criteria. Please try different filters or check back soon!' 
              : 'لم نتمكن من العثور على أي جولات تطابق معاييرك. يرجى تجربة مرشحات مختلفة أو التحقق مرة أخرى قريبًا!'}
          </p>
          
          {isFiltered && (
            <div className="flex justify-center">
              <a 
                href={`/${locale}/tours`}
                onClick={clearFilters}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                {locale === 'en' ? 'Clear Filters' : 'مسح المرشحات'}
              </a>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout locale={locale}>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">
          {locale === 'en' ? 'Explore Our Tours' : 'استكشف جولاتنا'}          </h1>
          <p className="text-xl max-w-3xl mx-auto text-center">
          {locale === 'en' 
                  ? 'Discover unique experiences led by expert local guides' 
                  : 'اكتشف تجارب فريدة بقيادة مرشدين محليين خبراء'}
          </p>
        </div>
          
         
          </div>
          
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-6">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-md p-3"
            >
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-gray-600" />
                <span className="font-medium">
                  {locale === 'en' ? 'Filters' : 'المرشحات'}
                </span>
              </div>
              {isFilterOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          
          {/* Filter Form - Accordion on mobile */}
          <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block mb-8`}>
            <form id="filter-form" onSubmit={handleFilterSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-secondary-900">
                {locale === 'en' ? 'Filter Tours' : 'تصفية الجولات'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date Filter */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Date' : 'التاريخ'}
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    defaultValue={filterValues.date || ''}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                
                {/* Travelers Filter */}
                <div>
                  <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Travelers' : 'المسافرون'}
                  </label>
                  <select
                    id="travelers"
                    name="travelers"
                    defaultValue={filterValues.travelers || ''}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">{locale === 'en' ? 'Any' : 'أي'}</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                    <option value="10">10+</option>
                  </select>
                </div>
                
                {/* Expertise Filter */}
                <div>
                  <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Expertise' : 'الخبرة'}
                  </label>
                  <select
                    id="expertise"
                    name="expertise"
                    defaultValue={filterValues.expertise || ''}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">{locale === 'en' ? 'Any' : 'أي'}</option>
                    {filterOptions.expertise.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
                
                {/* Languages Filter */}
                <div>
                  <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Languages' : 'اللغات'}
                  </label>
                  <select
                    id="languages"
                    name="languages"
                    defaultValue={filterValues.languages ? filterValues.languages[0] : ''}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">{locale === 'en' ? 'Any' : 'أي'}</option>
                    {filterOptions.languages.map(lang => (
                      <option key={lang} value={lang}>{formatLanguage(lang)}</option>
                    ))}
                  </select>
                </div>
                
                {/* Locations Filter */}
                <div>
                  <label htmlFor="locations" className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Locations' : 'المواقع'}
                  </label>
                  <select
                    id="locations"
                    name="locations"
                    defaultValue={filterValues.locations ? filterValues.locations[0] : ''}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">{locale === 'en' ? 'Any' : 'أي'}</option>
                    {filterOptions.locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                {/* Activity Level Filter */}
                <div>
                  <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Activity Level' : 'مستوى النشاط'}
                  </label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    defaultValue={filterValues.activityLevel || ''}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">{locale === 'en' ? 'Any' : 'أي'}</option>
                    {filterOptions.activityLevels.map(level => (
                      <option key={level} value={level}>{formatActivityLevel(level)}</option>
                    ))}
                  </select>
                </div>
                
                {/* Accessibility Options */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'en' ? 'Accessibility Options' : 'خيارات إمكانية الوصول'}
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="handicappedFriendly"
                        name="handicappedFriendly"
                        value="true"
                        defaultChecked={filterValues.handicappedFriendly}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="handicappedFriendly" className="ml-2 text-sm text-gray-700">
                        {locale === 'en' ? 'Handicapped Friendly' : 'مناسب لذوي الاحتياجات الخاصة'}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="kidFriendly"
                        name="kidFriendly"
                        value="true"
                        defaultChecked={filterValues.kidFriendly}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="kidFriendly" className="ml-2 text-sm text-gray-700">
                        {locale === 'en' ? 'Kid Friendly' : 'مناسب للأطفال'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button
                  type="submit"
                  className="w-full bg-white text-black font-medium py-3 px-4 rounded-md transition-colors text-center text-lg"
                >
                  {locale === 'en' ? 'Apply Filters' : 'تطبيق المرشحات'}
                </Button>
                
                {isFiltered && (
                  <a 
                    href={`/${locale}/tours`}
                    onClick={clearFilters}
                    className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md transition-colors text-center flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {locale === 'en' ? 'Clear' : 'مسح'}
                  </a>
                )}
              </div>
            </form>
          </div>
          
          {/* Active Filters Display */}
          {isFiltered && (
            <div className="bg-white rounded-lg p-4 mb-8 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium text-gray-700">
                  {locale === 'en' ? 'Active Filters:' : 'المرشحات النشطة:'}
                </h2>
                <a 
                  href={`/${locale}/tours`}
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <X className="w-3 h-3 mr-1" />
                  {locale === 'en' ? 'Clear All' : 'مسح الكل'}
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterValues.date && (
                  <span className="bg-primary-100 text-primary-800 text-sm px-2.5 py-0.5 rounded-full">
                    {locale === 'en' ? 'Date: ' : 'التاريخ: '}{filterValues.date}
                  </span>
                )}
                {filterValues.travelers && (
                  <span className="bg-primary-100 text-primary-800 text-sm px-2.5 py-0.5 rounded-full">
                    {locale === 'en' ? 'Travelers: ' : 'المسافرون: '}{filterValues.travelers}+
                  </span>
                )}
                {filterValues.expertise && (
                  <span className="bg-primary-100 text-primary-800 text-sm px-2.5 py-0.5 rounded-full">
                    {locale === 'en' ? 'Expertise: ' : 'الخبرة: '}{filterValues.expertise}
                  </span>
                )}
                {filterValues.languages && filterValues.languages.map(lang => (
                  <span key={lang} className="bg-primary-100 text-primary-800 text-sm px-2.5 py-0.5 rounded-full">
                    {locale === 'en' ? 'Language: ' : 'اللغة: '}{formatLanguage(lang)}
                  </span>
                ))}
                {filterValues.locations && filterValues.locations.map(loc => (
                  <span key={loc} className="bg-primary-100 text-primary-800 text-sm px-2.5 py-0.5 rounded-full">
                    {locale === 'en' ? 'Location: ' : 'الموقع: '}{loc}
                  </span>
                ))}
                {filterValues.activityLevel && (
                  <span className="bg-primary-100 text-primary-800 text-sm px-2.5 py-0.5 rounded-full">
                    {locale === 'en' ? 'Activity Level: ' : 'مستوى النشاط: '}{formatActivityLevel(filterValues.activityLevel)}
                  </span>
                )}
                {filterValues.handicappedFriendly && (
                  <span className="bg-primary-100 text-primary-800 text-sm px-2.5 py-0.5 rounded-full">
                    {locale === 'en' ? 'Handicapped Friendly' : 'مناسب لذوي الاحتياجات الخاصة'}
                  </span>
                )}
                {filterValues.kidFriendly && (
                  <span className="bg-primary-100 text-primary-800 text-sm px-2.5 py-0.5 rounded-full">
                    {locale === 'en' ? 'Kid Friendly' : 'مناسب للأطفال'}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              {locale === 'en' 
                ? `Showing ${tours.length} ${tours.length === 1 ? 'tour' : 'tours'}`
                : `عرض ${tours.length} ${tours.length === 1 ? 'جولة' : 'جولات'}`}
            </p>
          </div>
          
          {/* Tour Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => {
              // Format title based on locale
              const title = typeof tour.title === 'object' 
                ? (locale === 'en' ? tour.title.en : tour.title.ar) || tour.title.en
                : tour.title;
              
              // Format description based on locale
              const description = typeof tour.description === 'object'
                ? (locale === 'en' ? tour.description.en : tour.description.ar) || tour.description.en
                : tour.description;
              
              return (
                <div key={tour._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    {tour.images?.cover?.url ? (
                      <Image
                        src={tour.images.cover.url}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600">
                          {locale === 'en' ? 'No image' : 'لا توجد صورة'}
                        </span>
                      </div>
                    )}
                    {tour.expertise && (
                      <span className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                        {tour.expertise}
                      </span>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-1">{title}</h2>
                    
                    <div className="flex items-center mb-3">
                      {tour.rating > 0 ? (
                        <div className="flex items-center">
                          <Star className="text-yellow-400 w-4 h-4" />
                          <span className="ml-1 text-sm font-medium">{tour.rating.toFixed(1)}</span>
                          <span className="ml-1 text-xs text-gray-500">({tour.reviewCount})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {locale === 'en' ? 'No ratings yet' : 'لا توجد تقييمات بعد'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
                    
                    <div className="flex flex-wrap gap-y-2 mb-4">
                      <div className="flex items-center w-1/2">
                        <Clock className="text-gray-400 w-4 h-4 mr-1" />
                        <span className="text-sm text-gray-600">
                          {tour.duration} {tour.durationUnit === 'hours' 
                            ? (locale === 'en' ? 'hours' : 'ساعات') 
                            : (locale === 'en' ? 'days' : 'أيام')}
                        </span>
                      </div>
                      <div className="flex items-center w-1/2">
                        <Users className="text-gray-400 w-4 h-4 mr-1" />
                        <span className="text-sm text-gray-600">
                          {locale === 'en' ? `Up to ${tour.maxGroupSize}` : `حتى ${tour.maxGroupSize}`}
                        </span>
                      </div>
                      {tour.locationNames && tour.locationNames.length > 0 && (
                        <div className="flex items-center w-full">
                          <MapPin className="text-gray-400 w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="text-sm text-gray-600 truncate">
                            {tour.locationNames.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary-600">${tour.price} {locale === 'en' ? (tour.pricePer === 'person' ? '/ person' : '/ group') : (tour.pricePer === 'person' ? '/ للشخص' : '/ للمجموعة')}</span>
                      <Link 
                        href={`/${locale}/tours/${tour._id}`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {locale === 'en' ? 'View Details' : 'عرض التفاصيل'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 