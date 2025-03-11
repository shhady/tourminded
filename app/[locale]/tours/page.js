import { useLocale } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import Tour from '@/models/Tour';
import Guide from '@/models/Guide';
import Location from '@/models/Location';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Clock, Users, Calendar, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { currentUser } from '@clerk/nextjs/server';
import PriceRangeFilter from '@/components/tours/PriceRangeFilter';

export const metadata = {
  title: 'Tours | Tourminded',
  description: 'Explore our guided tours in the Holy Land',
};

async function getTours(searchParams) {
  try {
    await connectDB();
    
    // Ensure Guide model is registered
    if (!mongoose.models.Guide) {
      console.log('Guide model not registered, importing now');
      await import('@/models/Guide');
    }
    
    // Ensure searchParams is awaited
    const params = await searchParams;
    
    // Build filter object from search params
    const filter = {};
    
    if (params.location) {
      // Use $in operator to check if the location is in the locationNames array
      filter.locationNames = { $in: [params.location] };
    }
    
    if (params.duration) {
      filter.duration = parseInt(params.duration);
    }
    
    if (params.minPrice && params.maxPrice) {
      filter.price = { 
        $gte: parseInt(params.minPrice), 
        $lte: parseInt(params.maxPrice) 
      };
    } else if (params.minPrice) {
      filter.price = { $gte: parseInt(params.minPrice) };
    } else if (params.maxPrice) {
      filter.price = { $lte: parseInt(params.maxPrice) };
    }
    
    if (params.date) {
      const searchDate = new Date(params.date);
      filter.availableDates = {
        $elemMatch: {
          date: {
            $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
            $lte: new Date(searchDate.setHours(23, 59, 59, 999))
          }
        }
      };
    }
    
    // Get page and limit from search params or use defaults
    const page = params.page ? parseInt(params.page) : 1;
    const limit = params.limit ? parseInt(params.limit) : 9;
    const skip = (page - 1) * limit;
    
    // Find tours with filters, but don't populate locations
    const tours = await Tour.find(filter)
      .populate('guide', 'names profileImage rating reviewCount')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Count total tours for pagination
    const total = await Tour.countDocuments(filter);
    
    return {
      tours,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching tours:', error);
    return {
      tours: [],
      pagination: {
        page: 1,
        limit: 9,
        total: 0,
        pages: 0,
      },
    };
  }
}

// Helper function to get tour title based on locale
const getTourTitle = (tour, locale) => {
  if (!tour || !tour.title) return '';
  
  return tour.title[locale] || tour.title.en || 'Tour';
};

// Helper function to get tour description based on locale
const getTourDescription = (tour, locale) => {
  if (!tour || !tour.description) return '';
  
  const description = tour.description[locale] || tour.description.en || '';
  
  // Return first 100 characters with ellipsis
  return description.length > 100 
    ? description.substring(0, 100) + '...'
    : description;
};

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
  const nameObj = guide.names.find(n => n.language === languageToFind);
  if (nameObj && nameObj.value) return nameObj.value;
  
  // Fallback to English name
  const enNameObj = guide.names.find(n => n.language === 'English');
  if (enNameObj && enNameObj.value) return enNameObj.value;
  
  // Fallback to first available name
  if (guide.names.length > 0 && guide.names[0].value) {
    return guide.names[0].value;
  }
  
  return 'Guide';
};

// Helper function to format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Helper function to check if any filters are applied
const hasActiveFilters = (params) => {
  return !!(params.location || params.duration || params.minPrice || 
           params.maxPrice || params.date || params.priceRange);
};

export default async function ToursPage({ searchParams, params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Await searchParams before passing to getTours
  const awaitedSearchParams = await searchParams;
  const { tours, pagination } = await getTours(awaitedSearchParams);
  
  // Get current user
  let user = null;
  try {
    user = await currentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Get location options for filter
  const locationOptions = [
    { value: '', label: locale === 'en' ? 'All Locations' : 'جميع المواقع' },
    { value: 'telaviv', label: locale === 'en' ? 'Tel Aviv' : 'تل أبيب' },
    { value: 'nazareth', label: locale === 'en' ? 'Nazareth' : 'الناصرة' },
    { value: 'bethlehem', label: locale === 'en' ? 'Bethlehem' : 'بيت لحم' },
    { value: 'jerusalem', label: locale === 'en' ? 'Jerusalem' : 'القدس' },
    { value: 'deadsea', label: locale === 'en' ? 'Dead Sea' : 'البحر الميت' },
  ];
  
  // Get duration options for filter
  const durationOptions = [
    { value: '', label: locale === 'en' ? 'Any Duration' : 'أي مدة' },
    { value: '1', label: locale === 'en' ? '1 Day' : 'يوم واحد' },
    { value: '2', label: locale === 'en' ? '2 Days' : 'يومان' },
    { value: '3', label: locale === 'en' ? '3 Days' : '3 أيام' },
    { value: '4', label: locale === 'en' ? '4+ Days' : '4+ أيام' },
  ];
  
  // Get price range options for filter
  const priceRangeOptions = [
    { value: '', label: locale === 'en' ? 'Any Price' : 'أي سعر' },
    { value: '0-100', label: '$0 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200-300', label: '$200 - $300' },
    { value: '300-500', label: '$300 - $500' },
    { value: '500+', label: '$500+' },
  ];
  
  // Check if any filters are applied
  const filtersActive = hasActiveFilters(awaitedSearchParams);
  
  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-secondary-900">
          {locale === 'en' ? 'Explore Our Tours' : 'استكشف جولاتنا'}
        </h1>
        
        {/* Responsive Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-secondary-900">
              {locale === 'en' ? 'Filter Tours' : 'تصفية الجولات'}
            </h2>
            
            {/* Clear Filters Button - Only show if filters are active */}
            {filtersActive && (
              <Link
                href={`/${locale}/tours`}
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
              >
                <X size={16} className="mr-1" />
                {locale === 'en' ? 'Clear Filters' : 'مسح الفلاتر'}
              </Link>
            )}
          </div>
          
          <form action="" method="get" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Filter */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Location' : 'الموقع'}
              </label>
              <select
                id="location"
                name="location"
                defaultValue={awaitedSearchParams.location || ''}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {locationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Duration Filter */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Duration' : 'المدة'}
              </label>
              <select
                id="duration"
                name="duration"
                defaultValue={awaitedSearchParams.duration || ''}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Price Range Filter */}
            <PriceRangeFilter
              locale={locale}
              options={priceRangeOptions}
              defaultValue={awaitedSearchParams.priceRange || ''}
              minPriceValue={awaitedSearchParams.minPrice || ''}
              maxPriceValue={awaitedSearchParams.maxPrice || ''}
            />
            
            {/* Date Filter */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Date' : 'التاريخ'}
              </label>
              <input
                type="date"
                id="date"
                name="date"
                defaultValue={awaitedSearchParams.date || ''}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Submit Button */}
            <div className="md:col-span-3 mt-2 flex space-x-2">
              <Button type="submit" className="flex-1 md:flex-none md:w-auto">
                {locale === 'en' ? 'Apply Filters' : 'تطبيق الفلاتر'}
              </Button>
              
              {/* Clear button - Only show if filters are active */}
              {filtersActive && (
                <Link
                  href={`/${locale}/tours`}
                  className="flex-1 md:flex-none md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors text-center"
                >
                  {locale === 'en' ? 'Clear' : 'مسح'}
                </Link>
              )}
            </div>
          </form>
        </div>
        
        {/* Tours Grid */}
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {tours.map((tour) => (
              <Link 
                key={tour._id} 
                href={`/${locale}/tours/${tour._id}`}
                className="block group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Tour Image */}
                  <div className="relative h-48 w-full">
                    <Image 
                      src={tour.images?.cover.url || '/images/default-tour.jpg'}
                      alt={getTourTitle(tour, locale)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                      <span className="font-bold text-primary-600">
                        {formatPrice(tour.price)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                      {getTourTitle(tour, locale)}
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
                      {/* Duration */}
                      <div className="flex items-center text-gray-600 w-1/2">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {tour.duration} {locale === 'en' ? 
                            (tour.duration === 1 ? 'day' : 'days') : 
                            (tour.duration === 1 ? 'يوم' : 'أيام')}
                        </span>
                      </div>
                      
                      {/* Group Size */}
                      <div className="flex items-center text-gray-600 w-1/2">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {locale === 'en' ? 'Max ' : 'الحد الأقصى '}{tour.maxGroupSize}
                        </span>
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-600 w-full">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {tour.locationNames?.join(', ') || 'Multiple locations'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {getTourDescription(tour, locale)}
                    </p>
                    
                    {/* Guide Info */}
                    {tour.guide && (
                      <div className="flex items-center mb-4">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                          <Image 
                            src={tour.guide.profileImage?.url || '/images/default-avatar.png'}
                            alt={getGuideName(tour.guide, locale)}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-700">
                          {locale === 'en' ? 'By ' : 'بواسطة '} 
                          <span className="font-medium">{getGuideName(tour.guide, locale)}</span>
                        </span>
                      </div>
                    )}
                    
                      <div className="w-full bg-gray-500 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors text-center">
                      {locale === 'en' ? 'View Tour' : 'عرض الجولة'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">
              {locale === 'en' ? 'No Tours Found' : 'لم يتم العثور على جولات'}
            </h3>
            <p className="text-secondary-600 mb-4">
              {locale === 'en'
                ? 'Try adjusting your filters or explore our other tour options'
                : 'حاول تعديل الفلاتر أو استكشف خيارات الجولات الأخرى'}
            </p>
            <Button href={`/${locale}/tours`}>
              {locale === 'en' ? 'View All Tours' : 'عرض جميع الجولات'}
            </Button>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => {
                // Create new URLSearchParams with current params
                const params = new URLSearchParams(awaitedSearchParams);
                params.set('page', page.toString());
                
                return (
                  <Link
                    key={page}
                    href={`/${locale}/tours?${params.toString()}`}
                    className={`px-4 py-2 border ${
                      page === pagination.page
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 