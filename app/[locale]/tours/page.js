import MainLayout from '@/components/layout/MainLayout';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import Tour from '@/models/Tour';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Clock, Users, Calendar, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import PriceRangeFilter from '@/components/tours/PriceRangeFilter';

// Import the new component
import TourFilters from '@/components/tours/TourFilters';
import WishlistButton from '@/components/ui/WishlistButton';

export const metadata = {
  title: 'Tours | Watermelon Tours',
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
    console.log('Search params received:', params); // Debug log
    
    // Build filter object from search params
    const filter = {};
    
    if (params.location) {
      // Get all location values as an array (support for multiple values)
      const locationValues = Array.isArray(params.location) 
        ? params.location 
        : params.location.split(',');
      
      // Require ALL selected locations, case-insensitive match against stored names (capitalized)
      if (locationValues.length > 0) {
        const regexes = locationValues
          .filter(Boolean)
          .map((val) => new RegExp(`^${val}$`, 'i'));
        filter.locationNames = { $all: regexes };
        console.log('Filtering by locations (all must match, case-insensitive):', locationValues);
      }
    }
    
    // Handle search parameter
    if (params.search && params.search.trim() !== '') {
      const searchQuery = params.search.trim();
      console.log('Searching for:', searchQuery);
      
      // Create a text search that looks for matches in title, guide name, or location
      filter.$or = [
        // Search in tour title (both English and Arabic)
        { 'title.en': { $regex: searchQuery, $options: 'i' } },
        { 'title.ar': { $regex: searchQuery, $options: 'i' } },
        // Search in tour locationNames
        { locationNames: { $regex: searchQuery, $options: 'i' } },
        // Search in guide name if populated
        { guideName: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    if (params.expertise) {
      // Make the filter case-insensitive using a regex
      filter.expertise = new RegExp(params.expertise, 'i');
      console.log('Filtering by expertise (case-insensitive):', params.expertise);
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

    // Handle price per (person/group)
    if (params.pricePer) {
      filter.pricePer = params.pricePer === 'person' ? 'person' : 'group';
    }
    
    // Handle language filter from HeroSection
    if (params.language) {
      filter.languages = { $in: [params.language] }; // Assuming your Tour model has a languages array
      console.log('Filtering by language:', params.language);
    }
    
    // Handle travelers/group size filter from HeroSection
    if (params.travelers) {
      filter.maxGroupSize = { $gte: parseInt(params.travelers) };
      console.log('Filtering by travelers:', params.travelers);
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
    
    console.log('Final filter:', JSON.stringify(filter, null, 2)); // Debug log
    
    // Show all tours: no pagination
    const page = 1;
    const limit = 0; // unused
    const skip = 0; // unused
    
    // Parse travelDates range (format: YYYY-MM-DD_to_YYYY-MM-DD)
    let requestedStart = null;
    let requestedEnd = null;
    const normalizeUtcMidnight = (d) => {
      const x = new Date(d);
      return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
    };
    if (params.travelDates) {
      try {
        const [s, e] = String(params.travelDates).split('_to_');
        if (s) requestedStart = normalizeUtcMidnight(new Date(s));
        requestedEnd = normalizeUtcMidnight(new Date(e || s));
        if (requestedStart && requestedEnd && requestedEnd < requestedStart) {
          const tmp = requestedStart; requestedStart = requestedEnd; requestedEnd = tmp;
        }
      } catch (e) {
        console.warn('Invalid travelDates format', params.travelDates);
      }
    }

    // Find tours with filters, but don't populate locations
    const toursAll = await Tour.find(filter)
      .populate('guide', 'names profileImage rating reviewCount notAvailable')
      .sort({ createdAt: -1 });

    // Filter by guide availability if travelDates provided
    const tours = requestedStart && requestedEnd
      ? toursAll.filter(t => {
          const ranges = Array.isArray(t.guide?.notAvailable) ? t.guide.notAvailable : [];
          // exclude if ANY overlap between requested [start,end] and an unavailable range
          for (const r of ranges) {
            const rStart = normalizeUtcMidnight(r.start);
            const rEnd = normalizeUtcMidnight(r.end || r.start);
            const overlap = !(rEnd < requestedStart || rStart > requestedEnd);
            if (overlap) return false; // guide unavailable → exclude
          }
          return true; // no overlaps → include
        })
      : toursAll;

    // Total after availability filtering (no pagination)
    const total = tours.length;
    
    return {
      tours,
      pagination: {
        page: 1,
        limit: total,
        total,
        pages: 0,
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
  const nameObj = guide.names?.find(n => n.language === languageToFind);
  if (nameObj && nameObj.value) {
    // Extract first name only
    return nameObj.value.split(' ')[0];
  }
  
  // Fallback to English name
  const enNameObj = guide.names?.find(n => n.language === 'English');
  if (enNameObj && enNameObj.value) {
    // Extract first name only
    return enNameObj.value.split(' ')[0];
  }
  
  // Fallback to first available name
  if (guide.names && guide.names.length > 0 && guide.names[0].value) {
    // Extract first name only
    return guide.names[0].value.split(' ')[0];
  }
  
  // Last fallback to nickname or first part of user name
  if (guide.nickname) return guide.nickname;
  
  if (guide.user && guide.user.firstName) {
    return guide.user.firstName;
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

// Helper to format location slugs (e.g., 'deadsea', 'kufrKana', 'akko-town') to Title Case
const formatLocationName = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  // Replace underscores and hyphens with spaces, add space before camelCase capitals
  const withSpaces = raw
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
  // Title-case each word
  return withSpaces
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatLocationList = (locations) => {
  if (!Array.isArray(locations)) return '';
  return locations.map(formatLocationName).join(', ');
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
  const initialFilters = {
    location: awaitedSearchParams.location || '',
    duration: awaitedSearchParams.duration || '',
    expertise: awaitedSearchParams.expertise || '', // Changed from type to expertise
    language: awaitedSearchParams.language || '',
    travelers: awaitedSearchParams.travelers || '',
    pricePer: awaitedSearchParams.pricePer || '',
    minPrice: awaitedSearchParams.minPrice || '',
    maxPrice: awaitedSearchParams.maxPrice || '',
    priceRange: awaitedSearchParams.priceRange || '',
  };
  
  // Get location options for filter
  const locationOptions = [
    { value: '', label: locale === 'en' ? 'All Locations' : 'جميع المواقع' },
    { value: 'telaviv', label: locale === 'en' ? 'Tel Aviv' : 'تل أبيب' },
    { value: 'nazareth', label: locale === 'en' ? 'Nazareth' : 'الناصرة' },
    { value: 'bethlehem', label: locale === 'en' ? 'Bethlehem' : 'بيت لحم' },
    { value: 'jerusalem', label: locale === 'en' ? 'Jerusalem' : 'القدس' },
    { value: 'Dead Sea', label: locale === 'en' ? 'Dead Sea' : 'البحر الميت' },
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
        
        <TourFilters locale={locale} initialFilters={initialFilters} />

        {/* Tours Grid */}
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {tours.map((tour) => (
              <div key={tour._id} className="relative">
                {/* WishlistButton moved outside of Link */}
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
                    {/* Tour Image */}
                    <div className="relative h-48 w-full">
                      <Image 
                        src={tour.images?.cover.url || '/images/default-tour.jpg'}
                        alt={getTourTitle(tour, locale)}
                        fill
                        sizes='100vw'
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Price Badge - moved to left side */}
                      <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-md">
                        <span className="font-bold text-primary-600">
                          {formatPrice(tour.price)} {locale === 'en' ? (tour.pricePer === 'person' ? '/ person' : '/ group') : (tour.pricePer === 'person' ? '/ للشخص' : '/ للمجموعة')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                        {getTourTitle(tour, locale)}
                      </h3>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex items-center text-yellow-500">
                          {(() => {
                            const hasReviews = (tour.reviewCount && tour.reviewCount > 0) || (Array.isArray(tour.tourReviews) && tour.tourReviews.length > 0);
                            const ratingVal = hasReviews ? Math.floor(Number(tour.rating) || 0) : 0;
                            return [...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${hasReviews && i < ratingVal ? 'fill-current' : ''}`}
                              />
                            ));
                          })()}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">
                          ({(Array.isArray(tour.tourReviews) ? tour.tourReviews.length : (tour.reviewCount || 0))} {locale === 'en' ? 'reviews' : 'تقييمات'})
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-y-2 mb-3">
                        {/* Duration */}
                        <div className="flex items-center text-gray-600 w-1/2">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm">
                            {tour.duration} {tour.durationUnit === 'hours' 
                              ? (locale === 'en' 
                                ? (tour.duration === 1 ? 'hour' : 'hours') 
                                : (tour.duration === 1 ? 'ساعة' : 'ساعات')) 
                              : (locale === 'en' 
                                ? (tour.duration === 1 ? 'day' : 'days') 
                                : (tour.duration === 1 ? 'يوم' : 'أيام'))}
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
                            {tour.locationNames?.length ? formatLocationList(tour.locationNames) : 'Multiple locations'}
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
                              sizes='100vw'
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
              </div>
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
        
        {/* Pagination removed - showing all tours */}
      </div>
    </MainLayout>
  );
} 