import { useLocale } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Languages, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Guides | Tourminded',
  description: 'Meet our expert local guides in the Holy Land',
};

async function getGuides(searchParams) {
  await connectDB();
  
  // Ensure searchParams is awaited
  const params = await searchParams;
  
  // Build filter object from search params
  const filter = {};
  
  if (params.expertise) {
    filter['expertise.area'] = params.expertise;
  }
  
  if (params.language) {
    filter['languages.language'] = params.language;
  }
  
  if (params.rating) {
    filter.rating = { $gte: parseFloat(params.rating) };
  }
  
  // Get page and limit from search params or use defaults
  const page = params.page ? parseInt(params.page) : 1;
  const limit = params.limit ? parseInt(params.limit) : 9;
  const skip = (page - 1) * limit;
  
  // Find guides with filters
  const guides = await Guide.find(filter)
    .select('name profileImage rating reviewCount languages expertise about address')
    .skip(skip)
    .limit(limit)
    .sort({ rating: -1, reviewCount: -1 });
  
  // Count total guides for pagination
  const total = await Guide.countDocuments(filter);
  
  return {
    guides,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export default async function GuidesPage({ searchParams, params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Await searchParams before passing to getGuides
  const awaitedSearchParams = await searchParams;
  const { guides, pagination } = await getGuides(awaitedSearchParams);
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5HdWlkZTwvdGV4dD48L3N2Zz4=';
  
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
  
  // Get rating options for filter
  const ratingOptions = [
    { value: '', label: locale === 'en' ? 'Any Rating' : 'أي تقييم' },
    { value: '5', label: '5 ★' },
    { value: '4', label: '4+ ★' },
    { value: '3', label: '3+ ★' },
  ];
  
  return (
    <MainLayout locale={locale} user={user}>
      <div className="bg-primary-900 text-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">
            {locale === 'en' ? 'Meet Our Expert Guides' : 'تعرف على مرشدينا الخبراء'}
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-center">
            {locale === 'en'
              ? 'Connect with knowledgeable local guides who will make your Holy Land experience unforgettable'
              : 'تواصل مع مرشدين محليين ذوي معرفة سيجعلون تجربتك في الأرض المقدسة لا تُنسى'}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
      
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {locale === 'en' ? 'Filter Guides' : 'تصفية المرشدين'}
          </h2>
          
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            {/* Rating Filter */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Rating' : 'التقييم'}
              </label>
              <select
                id="rating"
                name="rating"
                defaultValue={awaitedSearchParams.rating || ''}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Submit Button */}
            <div className="md:col-span-3 mt-2">
              <Button type="submit" className="w-full md:w-auto">
                {locale === 'en' ? 'Apply Filters' : 'تطبيق الفلاتر'}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Guides Grid */}
        {guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {guides.map((guide) => (
              <div 
                key={guide._id} 
                className="group bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary-500/20 to-transparent z-10"></div>
                
                {/* Guide Profile Image with overlay */}
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={guide.profileImage?.url || placeholderImage}
                    alt={guide.name?.[locale] || guide.name?.en || guide.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  
                  {/* Rating badge */}
                  <div className="absolute top-4 left-4 flex items-center bg-yellow-400/90 text-gray-900 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                    <Star className="w-4 h-4 mr-1 text-yellow-700 fill-yellow-700" />
                    <span className="font-bold">{guide.rating?.toFixed(1) || "5.0"}</span>
                    <span className="text-xs ml-1 opacity-80">({guide.reviewCount || 0})</span>
                  </div>
                  
                  {/* Guide name and location */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
                    <h3 className="text-2xl font-bold tracking-tight drop-shadow-md mb-2">
                      {guide.name?.[locale] || guide.name?.en || guide.name}
                    </h3>
                    
                    <div className="flex items-center text-white/80 text-sm">
                      <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-primary-300" />
                      <span>{guide.address || 'Israel'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Guide Details Section */}
                <div className="p-6 relative">
                  {/* Expertise Badges */}
                  <div className="flex flex-wrap gap-2 mb-4 -mt-10 relative z-20">
                    {guide.expertise?.slice(0, 2).map((exp, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gradient-to-r from-gray-500 to-gray-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md"
                      >
                        {exp.area} {exp.years && `• ${exp.years} ${locale === 'en' ? 'yrs' : 'سنة'}`}
                      </span>
                    ))}
                  </div>
                  
                  {/* Languages */}
                  <div className="flex items-center mb-3 text-gray-700">
                    <Languages className="w-5 h-5 mr-2 text-secondary-500" />
                    <span className="text-sm font-medium">
                      {guide.languages?.map(lang => lang.language).join(', ')}
                    </span>
                  </div>
                  
                  {/* About (Truncated) */} 
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2 group-hover:line-clamp-3 transition-all duration-300">
                    {guide.about?.[locale] || guide.about?.en || ''}...
                  </p>
                  
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                  
                  {/* CTA Button */}
                  <Link 
                    href={`/${locale}/guides/${guide._id}`}
                    className="flex items-center justify-center w-full bg-gradient-to-r from-primary-200 to-gray-400 hover:from-primary-500 hover:to-primary-600 text-black font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 group-hover:shadow-lg"
                  >
                    <span className="mr-2">{locale === 'en' ? 'View Profile' : 'عرض الملف الشخصي'}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">
              {locale === 'en' ? 'No Guides Found' : 'لم يتم العثور على مرشدين'}
            </h3>
            <p className="text-secondary-600 mb-4">
              {locale === 'en'
                ? 'Try adjusting your filters or explore our other guide options'
                : 'حاول تعديل الفلاتر أو استكشف خيارات المرشدين الأخرى'}
            </p>
            <Button href={`/${locale}/guides`}>
              {locale === 'en' ? 'View All Guides' : 'عرض جميع المرشدين'}
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
                    href={`/guides?${params.toString()}`}
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