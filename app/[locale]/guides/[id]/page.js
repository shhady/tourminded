// Convert to server component
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Star, Languages, MapPin, Award, Mail, Phone, Share2, Download, MessageCircle, Camera, Calendar, Car } from 'lucide-react';
import ContactForm from '@/components/guides/ContactForm';
import ShareGuide from '@/components/guides/ShareGuide';
import LanguageStatsSection from '@/components/guides/LanguageStatsSection';
import ReviewsSection from '@/components/guides/ReviewsSection';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';
import Tour from '@/models/Tour';
import AvailabilityCalendar from '@/components/guides/AvailabilityCalendar';

// Generate QR code URL
const generateQRCode = (url) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
};

// Helper function to get guide name based on locale
const getGuideName = (guide, locale) => {
  if (!guide) return '';
  
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
  
  // Fallback to nickname or first part of name field
  if (guide.nickname) return guide.nickname;
  
  // If there's a name field, extract first name
  if (guide.name) {
    return guide.name.split(' ')[0];
  }
  
  return 'Guide';
};

// Helper function to get guide bio in current locale
const getGuideBio = (guide, locale) => {
  if (!guide) return '';
  
  // Map locale to language code
  const languageMap = {
    'en': 'English',
    'ar': 'Arabic',
    'he': 'Hebrew'
  };
  
  const languageToFind = languageMap[locale] || 'English';
  
  // Find about section in current locale
  const aboutObj = guide.aboutSections?.find(a => a.language === languageToFind);
  if (aboutObj && aboutObj.content) return aboutObj.content;
  
  // Fallback to English about
  const enAboutObj = guide.aboutSections?.find(a => a.language === 'English');
  if (enAboutObj && enAboutObj.content) return enAboutObj.content;
  
  // Fallback to first available about
  if (guide.aboutSections && guide.aboutSections.length > 0 && guide.aboutSections[0].content) {
    return guide.aboutSections[0].content;
  }
  
  return '';
};

// Helper function to calculate years of experience
const calculateYearsOfExperience = (licenseDate) => {
  if (!licenseDate) return 0;
  
  const licenseYear = new Date(licenseDate).getFullYear();
  const currentYear = new Date().getFullYear();
  return Math.max(0, currentYear - licenseYear);
};

// Get language name from code
const getLanguageName = (code) => {
  const languageNames = {
    en: 'English',
    ar: 'العربية',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch',
    it: 'Italiano',
    ru: 'Русский',
    zh: '中文',
    ja: '日本語',
    ko: '한국어'
  };
  
  return languageNames[code] || code;
};

// Helper function to get Arabic expertise area name
const getArabicExpertiseArea = (area) => {
  const arabicAreas = {
    'Christian': 'المسيحية',
    'Jewish': 'اليهودية',
    'Muslim': 'الإسلامية',
    'Political': 'السياسية',
    'Historical': 'التاريخية',
    'Cultural': 'الثقافية',
    'Food': 'الطعام',
    'Adventure': 'المغامرة',
    'Nature': 'الطبيعة',
    'Photography': 'التصوير',
    'Culinary': 'الطهي',
    'All-inclusive': 'الشاملة'
  };
  
  return arabicAreas[area] || area;
};

export async function generateMetadata({ params }) {
  const { id, locale } = await params;
  
  try {
    await connectDB();
    const guide = await Guide.findById(id).populate('user');
    
    if (!guide) {
      return {
        title: locale === 'en' ? 'Guide Not Found' : 'لم يتم العثور على المرشد',
      };
    }
    
    const name = getGuideName(guide, locale);
    
    return {
      title: `${name} | Watermelon Tours`,
      description: getGuideBio(guide, locale).substring(0, 160),
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Tour Guide | Watermelon Tours',
      description: 'Professional tour guide profile',
    };
  }
}

export default async function GuideProfilePage({ params }) {
  const { id, locale } = await params;
  
  try {
    await connectDB();
    
    // Fetch guide data
    const guide = await Guide.findById(id).populate('user');
    
    if (!guide) {
      notFound();
    }
    
    // Fetch tours by this guide
    const tours = await Tour.find({ guide: id }).limit(4);
    
    // Extract guide data
    const name = getGuideName(guide, locale);
    const bio = getGuideBio(guide, locale);
    const profileImage = guide.profileImage?.url || '/images/default-guide.jpg';
    const coverImage = guide.coverImage?.url || '/images/default-cover.jpg';
    const rating = guide.rating || 5;
    const reviewCount = guide.reviewCount || 0;
    const languages = guide.languages || [];
    const expertise = guide.expertise || [];
    const address = guide.address || 'Israel';
    const yearsExperience = calculateYearsOfExperience(guide.licenseIssueDate);
    const vehicle = guide.vehicle || {};
    const notAvailableRanges = Array.isArray(guide.notAvailable) ? guide.notAvailable : [];
    // Serialize ranges to plain objects with ISO strings to avoid serializing Mongoose docs
    const notAvailablePlain = notAvailableRanges.map(r => ({
      start: r.start ? new Date(r.start).toISOString() : undefined,
      end: r.end ? new Date(r.end).toISOString() : (r.start ? new Date(r.start).toISOString() : undefined),
      note: r.note || undefined,
    }));
    
    // Helpers for calendar
    const toUtcMidnight = (d) => {
      const x = new Date(d);
      return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
    };
    const dateInRanges = (d, ranges) => {
      const target = toUtcMidnight(d).getTime();
      for (const r of ranges) {
        const start = toUtcMidnight(r.start).getTime();
        const end = toUtcMidnight(r.end || r.start).getTime();
        if (target >= start && target <= end) return true;
      }
      return false;
    };
    const buildMonthMatrix = (baseDate) => {
      const year = baseDate.getUTCFullYear();
      const month = baseDate.getUTCMonth();
      const first = new Date(Date.UTC(year, month, 1));
      const startWeekday = first.getUTCDay(); // 0-6 Sun-Sat
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const matrix = [];
      let current = new Date(Date.UTC(year, month, 1 - startWeekday));
      for (let week = 0; week < 6; week++) {
        const row = [];
        for (let day = 0; day < 7; day++) {
          row.push(new Date(current));
          current.setUTCDate(current.getUTCDate() + 1);
        }
        matrix.push(row);
      }
      return { matrix, month, year };
    };
    const now = new Date();
    const calendar = buildMonthMatrix(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
    
    // Generate QR code URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://watermelontours.com';
    const guideUrl = `${baseUrl}/${locale}/guides/${id}`;
    const qrCode = generateQRCode(guideUrl);
    
    return (
      <MainLayout locale={locale}>
        {/* Hero Cover Image Section */}
        <div className="relative h-[50vh] min-h-[400px] w-full">
          {/* Cover Image */}
          <div className="absolute inset-0">
            <Image 
              src={coverImage || '/no-image-cover.png'}
              alt={`${name} cover`}
              fill
              className="object-cover"
              priority
              sizes='100vw'
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70"></div>
          </div>
          
          {/* Back button */}
          <div className="absolute top-8 left-8 z-10">
            <Link 
              href={`/${locale}/guides`}
              className="inline-flex items-center text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <span className="mr-2">←</span>
              {locale === 'en' ? 'Back to Guides' : 'العودة إلى المرشدين'}
            </Link>
          </div>
          
          {/* Guide name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10 bg-gradient-to-b from-black/10 via-black/20 to-black/60 shadow-lg">
            <div className="container mx-auto px-4">
              <div className="flex items-center  gap-2">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mr-6">
                  <Image 
                    src={profileImage}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes='100vw'
                  />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">{name}</h1>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="flex-col items-center">
                      <div className="flex items-center text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : ''}`} 
                          />
                        ))}
                      </div>
                      <span className="text-white/90">
                        {rating.toFixed(1)} ({reviewCount} {locale === 'en' ? 'reviews' : 'تقييمات'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
               {/* Contact Button */}
               <div className='mb-6'>
                  <Link 
                    href={`/${locale}/chat/${guide.user._id}`}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-300 text-black font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {locale === 'en' ? 'Contact Guide' : 'تواصل مع المرشد'}
                  </Link>
                </div>
              <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
                {/* Languages */}
                <LanguageStatsSection 
                  guideId={id}
                  locale={locale}
                />
                
                {/* Experience */}
                <div className="mb-8 pb-8 border-b border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary-600" />
                    {locale === 'en' ? 'Experience' : 'الخبرة'}
                  </h3>
                  
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-primary-600">{yearsExperience}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {locale === 'en' 
                          ? `${yearsExperience} year${yearsExperience !== 1 ? 's' : ''}` 
                          : `${yearsExperience} سنة${yearsExperience !== 1 ? '' : ''}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {locale === 'en' ? 'Professional Experience' : 'خبرة مهنية'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Availability Calendar */}
                <div className="mb-8 pb-8 border-b border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                    {locale === 'en' ? 'Availability' : 'التوفر'}
                  </h3>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="inline-flex items-center mr-4"><span className="inline-block w-3 h-3 bg-red-400 rounded-sm mr-2"></span>{locale === 'en' ? 'Unavailable' : 'غير متاح'}</span>
                    <span className="inline-flex items-center"><span className="inline-block w-3 h-3 bg-white border border-secondary-300 rounded-sm mr-2"></span>{locale === 'en' ? 'Available' : 'متاح'}</span>
                  </div>
                  <AvailabilityCalendar locale={locale} ranges={notAvailablePlain} />
                </div>
                
                {/* Vehicle Information (if available) */}
                {vehicle && (vehicle.type || vehicle.model || vehicle.image) && (
                  <div className="mb-8 pb-8 border-b border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Car className="w-5 h-5 mr-2 text-primary-600" />
                      {locale === 'en' ? 'Vehicle' : 'المركبة'}
                    </h3>
                    
                    <div className="flex flex-col">
                      {vehicle.image?.url && (
                        <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden">
                          <Image 
                            src={vehicle.image.url}
                            alt="Guide's vehicle"
                            fill
                            className="object-cover"
                            sizes='100vw'
                            />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {vehicle.type && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{locale === 'en' ? 'Type' : 'النوع'}:</span>
                            <span className="font-medium">{vehicle.type}</span>
                          </div>
                        )}
                        
                        {vehicle.model && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{locale === 'en' ? 'Model' : 'الطراز'}:</span>
                            <span className="font-medium">{vehicle.model}</span>
                          </div>
                        )}
                        
                        {vehicle.year && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{locale === 'en' ? 'Year' : 'السنة'}:</span>
                            <span className="font-medium">{vehicle.year}</span>
                          </div>
                        )}
                        
                        {vehicle.capacity && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{locale === 'en' ? 'Capacity' : 'السعة'}:</span>
                            <span className="font-medium">{vehicle.capacity} {locale === 'en' ? 'persons' : 'أشخاص'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* QR Code */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    {locale === 'en' ? 'Scan to Share' : 'امسح للمشاركة'}
                  </h3>
                  
                  <div className="bg-white p-2 border border-gray-200 rounded-lg inline-block">
                    <Image 
                      src={qrCode}
                      alt="QR Code"
                      width={150}
                      height={150}
                    />
                  </div>
                </div>

               
              </div>
              
              {/* Share Guide Component */}
              <ShareGuide locale={locale} guideId={id} guideName={name} />
            </div>
            
            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              {/* About Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">👤</span>
                  </span>
                  {locale === 'en' ? 'About Me' : 'نبذة عني'}
                </h2>
                
                <div className="prose max-w-none">
                  {bio ? (
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      {locale === 'en' 
                        ? 'This guide has not added a bio yet.' 
                        : 'لم يضف هذا المرشد سيرة ذاتية بعد.'}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Mobile Sidebar (visible only on mobile) */}
              <div className="lg:hidden">
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
                   {/* Contact Button */}
                   <div className='mb-8'>
                    <Link 
                      href={`/${locale}/chat/${guide.user._id}`}
                      className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-300 text-black font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {locale === 'en' ? 'Contact Guide' : 'تواصل مع المرشد'}
                    </Link>
                  </div>
                  {/* Languages */}
                  <LanguageStatsSection 
                    guideId={id}
                    locale={locale}
                  />
                  
                  {/* Experience */}
                  <div className="mb-8 pb-8 border-b border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-primary-600" />
                      {locale === 'en' ? 'Experience' : 'الخبرة'}
                    </h3>
                    
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mr-4">
                        <span className="text-2xl font-bold text-primary-600">{yearsExperience}</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {locale === 'en' 
                            ? `${yearsExperience} year${yearsExperience !== 1 ? 's' : ''}` 
                            : `${yearsExperience} سنة${yearsExperience !== 1 ? '' : ''}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {locale === 'en' ? 'Professional Experience' : 'خبرة مهنية'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Availability (Mobile) */}
                  <div className="mb-8 pb-8 border-b border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                      {locale === 'en' ? 'Availability' : 'التوفر'}
                    </h3>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="inline-flex items-center mr-4"><span className="inline-block w-3 h-3 bg-red-400 rounded-sm mr-2"></span>{locale === 'en' ? 'Unavailable' : 'غير متاح'}</span>
                      <span className="inline-flex items-center"><span className="inline-block w-3 h-3 bg-white border border-secondary-300 rounded-sm mr-2"></span>{locale === 'en' ? 'Available' : 'متاح'}</span>
                    </div>
                    <AvailabilityCalendar locale={locale} ranges={notAvailablePlain} />
                  </div>
                  
                  {/* Vehicle Information (if available) */}
                  {vehicle && (vehicle.type || vehicle.model || vehicle.image) && (
                    <div className="mb-8 pb-8 border-b border-gray-100">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Car className="w-5 h-5 mr-2 text-primary-600" />
                        {locale === 'en' ? 'Vehicle' : 'المركبة'}
                      </h3>
                      
                      <div className="flex flex-col">
                        {vehicle.image?.url && (
                          <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden">
                            <Image 
                              src={vehicle.image.url}
                              alt="Guide's vehicle"
                              fill
                              className="object-cover"
                              sizes='100vw'
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          {vehicle.type && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">{locale === 'en' ? 'Type' : 'النوع'}:</span>
                              <span className="font-medium">{vehicle.type}</span>
                            </div>
                          )}
                          
                          {vehicle.model && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">{locale === 'en' ? 'Model' : 'الطراز'}:</span>
                              <span className="font-medium">{vehicle.model}</span>
                            </div>
                          )}
                          
                          {vehicle.year && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">{locale === 'en' ? 'Year' : 'السنة'}:</span>
                              <span className="font-medium">{vehicle.year}</span>
                            </div>
                          )}
                          
                          {vehicle.capacity && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">{locale === 'en' ? 'Capacity' : 'السعة'}:</span>
                              <span className="font-medium">{vehicle.capacity} {locale === 'en' ? 'persons' : 'أشخاص'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* QR Code */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      {locale === 'en' ? 'Scan to Share' : 'امسح للمشاركة'}
                    </h3>
                    
                    <div className="bg-white p-2 border border-gray-200 rounded-lg inline-block">
                      <Image 
                        src={qrCode}
                        alt="QR Code"
                        width={150}
                        height={150}
                      />
                    </div>
                  </div>

                 
                </div>
              </div>
              
              {/* Expertise Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-8 h-8 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mr-3">
                    <Award className="w-5 h-5" />
                  </span>
                  {locale === 'en' ? 'Areas of Expertise' : 'مجالات الخبرة'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {expertise.map((exp, index) => {
                    // Calculate years of experience based on license date
                    const yearsExperience = calculateYearsOfExperience(exp.licenseIssueDate);
                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
                            <Award className="w-5 h-5 text-secondary-600" />
                          </div>
                          <h3 className="text-lg font-semibold">
                            {locale === 'en' ? exp.area : getArabicExpertiseArea(exp.area)}
                          </h3>
                        </div>
                        
                        {/* <div className="flex items-center text-gray-600 mb-2">
                          <span className="font-medium text-secondary-700">{yearsExperience}</span>
                          <span className="ml-1">
                            {locale === 'en' 
                              ? `year${yearsExperience !== 1 ? 's' : ''} of experience` 
                              : `سنة${yearsExperience !== 1 ? '' : ''} من الخبرة`}
                          </span>
                        </div> */}
                        
                        {(() => {
                          const desc = locale === 'en' 
                            ? (exp.expertiseAreaDescriptionEn || '')
                            : (exp.expertiseAreaDescriptionAr || '');
                          return desc && desc.trim() !== '' ? (
                            <p className="text-sm text-gray-500 whitespace-pre-line">{desc}</p>
                          ) : null;
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Tours by this Guide Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🧭</span>
                  </span>
                  {locale === 'en' ? 'Tours by this Guide' : 'جولات هذا المرشد'}
                </h2>
                
                {tours && tours.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tours.map((tour) => (
                      <Link 
                        key={tour._id} 
                        href={`/${locale}/tours/${tour._id}`}
                        className="block group"
                      >
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="relative h-48 w-full">
                            <Image 
                              src={tour.images?.cover?.url || '/no-image-cover.png'}
                              alt={tour.title?.[locale] || tour.title?.en || 'Tour'}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes='100vw'
                            />
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
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
                            
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {tour.description?.[locale] || tour.description?.en || ''}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
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
                )}
              </div>
              
              {/* Reviews Section */}
              <ReviewsSection 
                guideId={id}
                locale={locale}
              />
              
              {/* Contact Form - Using client component */}
              <ContactForm locale={locale} guideId={id} guideName={name} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error('Error fetching guide:', error);
    notFound();
  }
} 