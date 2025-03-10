import { useLocale } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Clock, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Tours | Tourminded',
  description: 'Explore our guided tours in the Holy Land',
};

async function getTours(searchParams) {
  await connectDB();
  
  // Build filter object from search params
  const filter = {};
  
  // Ensure searchParams is awaited
  const params = await searchParams;
  
  if (params.expertise) {
    filter.expertise = params.expertise;
  }
  
  if (params.language) {
    filter.languages = { $in: [params.language] };
  }
  
  if (params.travelers) {
    filter.maxGroupSize = { $gte: parseInt(params.travelers) };
  }
  
  if (params.location) {
    filter.locationNames = { $in: [params.location] };
  }
  
  // Only show active tours
  filter.isActive = true;
  
  // Get page and limit from search params or use defaults
  const page = params.page ? parseInt(params.page) : 1;
  const limit = params.limit ? parseInt(params.limit) : 9;
  const skip = (page - 1) * limit;
  
  // Find tours with filters
  const tours = await Tour.find(filter)
    .populate('guide', 'name profileImage rating reviewCount')
    .skip(skip)
    .limit(limit)
    .sort({ rating: -1, reviewCount: -1 });
  
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
}

export default async function ToursPage({ searchParams, params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Await searchParams before passing to getTours
  const awaitedSearchParams = await searchParams;
  const { tours, pagination } = await getTours(awaitedSearchParams);
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=';
  
  // Get expertise options for filter
  const expertiseOptions = [
    { value: '', label: locale === 'en' ? 'All Expertise' : 'جميع الخبرات' },
    { value: 'Christian', label: locale === 'en' ? 'Christian' : 'مسيحي' },
    { value: 'Jewish', label: locale === 'en' ? 'Jewish' : 'يهودي' },
    { value: 'Muslim', label: locale === 'en' ? 'Muslim' : 'إسلامي' },
    { value: 'Political', label: locale === 'en' ? 'Political' : 'سياسي' },
    { value: 'Historical', label: locale === 'en' ? 'Historical' : 'تاريخي' },
    { value: 'Cultural', label: locale === 'en' ? 'Cultural' : 'ثقافي' },
    { value: 'Food', label: locale === 'en' ? 'Food' : 'طعام' },
    { value: 'All-inclusive', label: locale === 'en' ? 'All-inclusive' : 'شامل' },
  ];
  
  // Get language options for filter
  const languageOptions = [
    { value: '', label: locale === 'en' ? 'All Languages' : 'جميع اللغات' },
    { value: 'English', label: locale === 'en' ? 'English' : 'الإنجليزية' },
    { value: 'Arabic', label: locale === 'en' ? 'Arabic' : 'العربية' },
    { value: 'Hebrew', label: locale === 'en' ? 'Hebrew' : 'العبرية' },
    { value: 'Spanish', label: locale === 'en' ? 'Spanish' : 'الإسبانية' },
    { value: 'French', label: locale === 'en' ? 'French' : 'الفرنسية' },
    { value: 'German', label: locale === 'en' ? 'German' : 'الألمانية' },
    { value: 'Italian', label: locale === 'en' ? 'Italian' : 'الإيطالية' },
    { value: 'Russian', label: locale === 'en' ? 'Russian' : 'الروسية' },
  ];
  
  return (
    <MainLayout locale={locale} user={user}>
      <div className="bg-primary-900 text-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">
            {locale === 'en' ? 'Explore Our Tours' : 'استكشف جولاتنا'}
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-center">
            {locale === 'en'
              ? 'Discover the Holy Land with our expert local guides'
              : 'اكتشف الأرض المقدسة مع مرشدينا المحليين الخبراء'}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              {locale === 'en' ? 'Explore Our Tours' : 'استكشف جولاتنا'}
            </h1>
            <p className="text-secondary-600 max-w-2xl">
              {locale === 'en'
                ? 'Discover the Holy Land with our expert guides. Filter by expertise, language, and more to find your perfect tour.'
                : 'اكتشف الأرض المقدسة مع مرشدينا الخبراء. قم بالتصفية حسب الخبرة واللغة والمزيد للعثور على جولتك المثالية.'}
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {locale === 'en' ? 'Filter Tours' : 'تصفية الجولات'}
          </h2>
          
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Expertise Filter */}
            <div>
              <label htmlFor="expertise" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Expertise' : 'الخبرة'}
              </label>
              <select
                id="expertise"
                name="expertise"
                defaultValue={awaitedSearchParams.expertise || ''}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {expertiseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Language Filter */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Language' : 'اللغة'}
              </label>
              <select
                id="language"
                name="language"
                defaultValue={awaitedSearchParams.language || ''}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Travelers Filter */}
            <div>
              <label htmlFor="travelers" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Travelers' : 'المسافرين'}
              </label>
              <select
                id="travelers"
                name="travelers"
                defaultValue={awaitedSearchParams.travelers || ''}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{locale === 'en' ? 'Any' : 'أي'}</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}+
                  </option>
                ))}
              </select>
            </div>
            
            {/* Submit Button */}
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                {locale === 'en' ? 'Apply Filters' : 'تطبيق الفلاتر'}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Tours Grid */}
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {tours.map((tour) => (
              <div key={tour._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={tour.images?.cover?.url || placeholderImage}
                    alt={tour.title?.[locale] || tour.title?.en || tour.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <span className="flex items-center text-yellow-500">
                      {tour.rating}
                      <Star className="ml-1" />
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {tour.title?.[locale] || tour.title?.en || tour.title}
                  </h3>
                  
                  <div className="flex items-center text-secondary-600 mb-2">
                    <MapPin className="mr-1" />
                    <span>
                      {tour.locationNames?.join(', ') || 
                       tour.locations?.map(loc => loc.name?.[locale] || loc.name?.en || loc.name).join(', ') || 
                       (locale === 'en' ? 'Various locations' : 'مواقع متنوعة')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-secondary-600">
                      <Clock className="mr-1" />
                      <span>
                        {tour.duration} {tour.durationUnit === 'hours' 
                          ? (locale === 'en' ? 'hours' : 'ساعات')
                          : (locale === 'en' ? 'days' : 'أيام')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-secondary-600">
                      <Users className="mr-1" />
                      <span>
                        {locale === 'en' ? 'Max' : 'الحد الأقصى'} {tour.maxGroupSize}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary-600">
                      ${tour.price}
                    </span>
                    
                    <Button href={`/tours/${tour._id}`} size="sm">
                      {locale === 'en' ? 'View Details' : 'عرض التفاصيل'}
                    </Button>
                  </div>
                </div>
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
            <Button href="/tours">
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
                    href={`/tours?${params.toString()}`}
                    className={`px-4 py-2 border ${
                      page === pagination.page
                        ? 'bg-primary-600 text-black border-primary-600'
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