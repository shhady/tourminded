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
    .select('name profileImage rating reviewCount languages expertise about')
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              {locale === 'en' ? 'Meet Our Expert Guides' : 'تعرف على مرشدينا الخبراء'}
            </h1>
            <p className="text-secondary-600 max-w-2xl">
              {locale === 'en'
                ? 'Discover our knowledgeable local guides who will make your Holy Land experience unforgettable.'
                : 'اكتشف مرشدينا المحليين ذوي المعرفة الذين سيجعلون تجربتك في الأرض المقدسة لا تُنسى.'}
            </p>
          </div>
        </div>
        
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
              <div key={guide._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-64">
                  <Image
                    src={guide.profileImage?.url || placeholderImage}
                    alt={guide.name?.[locale] || guide.name?.en || guide.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold">
                      {guide.name?.[locale] || guide.name?.en || guide.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <Star className="text-yellow-500 mr-1" />
                      <span>{guide.rating}</span>
                      <span className="text-sm ml-1">
                        ({guide.reviewCount} {locale === 'en' ? 'reviews' : 'تقييمات'})
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {/* Languages */}
                  <div className="flex items-center mb-3 text-secondary-700">
                    <Languages className="mr-2 text-lg" />
                    <span>
                      {guide.languages?.map(lang => lang.language).join(', ')}
                    </span>
                  </div>
                  
                  {/* Expertise */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {guide.expertise?.map((exp, index) => (
                      <span
                        key={index}
                        className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                      >
                        {exp.area}
                      </span>
                    ))}
                  </div>
                  
                  {/* About (truncated) */}
                  <p className="text-secondary-600 mb-4 line-clamp-3">
                    {guide.about?.[locale] || guide.about?.en || ''}
                  </p>
                  
                  {/* Location */}
                  <div className="flex items-center text-secondary-700">
                    <MapPin className="mr-2 text-lg" />
                    <span>{guide.address}</span>
                  </div>
                  
                  <Button href={`/guides/${guide._id}`} className="w-full">
                    {locale === 'en' ? 'View Profile' : 'عرض الملف الشخصي'}
                  </Button>
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
            <Button href="/guides">
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