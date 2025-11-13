import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { currentUser } from '@clerk/nextjs/server';
import { 
  Star, 
  Clock, 
  Users, 
  MapPin, 
  Globe, 
  Briefcase, 
  Activity, 
  Car, 
  Accessibility, 
  Baby, 
  Heart,
  MessageCircle,
  ChevronRight,
  Check,
  X,
  Share,
  HelpCircle
} from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import User from '@/models/User';
import Guide from '@/models/Guide';
import dynamic from 'next/dynamic';
import GalleryLightbox from './GalleryLightbox';
import BookTourModal from '@/components/tours/BookTourModal';
import LightboxImage from '@/components/common/LightboxImage';

// Dynamically import the ShareTourButton component with no SSR
const ShareTourButton = dynamic(() => import('./ShareTourButton'));

export async function generateMetadata({ params }) {
  const paramsData = await params;
  const { id, locale } = paramsData;
  
  try {
    await connectDB();
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return {
        title: 'Tour Not Found',
      };
    }
    
    const title = typeof tour.title === 'object' 
      ? (locale === 'en' ? tour.title.en : tour.title.ar) || tour.title.en
      : tour.title;
    
    return {
      title: `${title} | Watermelon Tours`,
      description: typeof tour.description === 'object'
        ? (locale === 'en' ? tour.description.en : tour.description.ar) || tour.description.en
        : tour.description,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Tour | Watermelon Tours',
    };
  }
}

// Function to get tour data
async function getTourData(id) {
  try {
    // Connect to database
    await connectDB();
    
    // Find tour by ID
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return null;
    }
    
    // Initialize guideData
    let guideData = null;
    
    // Fetch guide data if guide ID exists
    if (tour.guide) {
      try {
        // Find the guide and populate the user data in one query
        const guide = await Guide.findById(tour.guide).populate('user');
        
        if (!guide) {
          console.log('No guide found for this tour');
        } else {
          // Extract first name only
          let guideName = guide.user?.name || 'Tour Guide';
          // Split the name and take only the first part
          guideName = guideName.split(' ')[0];
          // Serialize notAvailable to plain ISO strings
          const notAvailablePlain = Array.isArray(guide.notAvailable)
            ? guide.notAvailable.map(r => ({
                start: r.start ? new Date(r.start).toISOString() : undefined,
                end: r.end ? new Date(r.end).toISOString() : (r.start ? new Date(r.start).toISOString() : undefined),
                note: r.note || undefined,
              }))
            : [];
          
          // Combine user and guide data
          guideData = {
            _id: guide._id.toString(),
            name: guideName,
            profileImage: guide.profileImage?.url || null,
            email: guide.user?.email || null,
            phone: guide.user?.phone || null,
            address: guide.address || null,
            rating: guide.rating || 4.5,
            reviewCount: guide.reviewCount || 0,
            // Additional guide-specific fields
            about: guide.about || null,
            languages: guide.languages || [],
            expertise: guide.expertise || [],
            certifications: guide.certifications || [],
            experience: guide.experience || null,
            reviews: guide.reviews || [],
            userId: guide.user?._id?.toString() || null,
            notAvailable: notAvailablePlain
          };
        }
      } catch (error) {
        console.error('Error fetching guide data:', error);
      }
    }
    
    // Convert Mongoose document to plain object
    const tourData = JSON.parse(JSON.stringify(tour));

    // Enrich embedded tour reviews with user names
    let enrichedTourReviews = [];
    try {
      const originalReviews = Array.isArray(tour.tourReviews) ? tour.tourReviews : [];
      enrichedTourReviews = await Promise.all(
        originalReviews.map(async (rev) => {
          let userName = '';
          try {
            const userDoc = await User.findById(rev.userId).select('firstName lastName name');
            if (userDoc) {
              if (userDoc.firstName && userDoc.lastName) {
                userName = `${userDoc.firstName} ${userDoc.lastName}`;
              } else if (userDoc.name) {
                userName = userDoc.name;
              }
            }
          } catch (e) {}
          return {
            ...(rev.toObject ? rev.toObject() : JSON.parse(JSON.stringify(rev))),
            userName,
          };
        })
      );
    } catch (e) {
      enrichedTourReviews = [];
    }
    
    return {
      ...tourData,
      guide: guideData,
      _id: tourData._id.toString(),
      // Ensure these fields exist with defaults if needed
      title: tourData.title || { en: 'Untitled Tour', ar: 'جولة بدون عنوان' },
      description: tourData.description || { en: 'No description available', ar: 'لا يوجد وصف متاح' },
      price: tourData.price || 0,
      duration: tourData.duration || 1,
      durationUnit: tourData.durationUnit || 'hours',
      maxGroupSize: tourData.maxGroupSize || 1,
      activityLevel: tourData.activityLevel || 'easy',
      expertise: Array.isArray(tourData.expertise) ? tourData.expertise : (tourData.expertise ? [tourData.expertise] : []),
      transportation: tourData.transportation || 'walking',
      locationNames: tourData.locationNames || [],
      languages: tourData.languages || [],
      handicappedFriendly: tourData.handicappedFriendly || false,
      kidFriendly: tourData.kidFriendly || false,
      rating: tourData.rating || 0,
      reviewCount: tourData.reviewCount || 0,
      includes: tourData.includes || [],
      images: tourData.images || { cover: { url: null }, gallery: [] },
      faqs: Array.isArray(tourData.faqs) ? tourData.faqs : [],
      tourReviews: enrichedTourReviews
    };
  } catch (error) {
    console.error('Error getting tour data:', error);
    return null;
  }
}

export default async function TourPage({ params }) {
  const paramsData = await params;
  const { id, locale } = paramsData;
  
  try {
    // Get tour data
    const tourData = await getTourData(id);
    
    if (!tourData) {
      notFound();
    }
    
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    // Format title and description based on locale
    const title = typeof tourData.title === 'object' 
      ? (locale === 'en' ? tourData.title.en : tourData.title.ar) || tourData.title.en
      : tourData.title;
    
    const description = typeof tourData.description === 'object'
      ? (locale === 'en' ? tourData.description.en : tourData.description.ar) || tourData.description.en
      : tourData.description;
    
    // Compute rating from embedded tourReviews if available
    const embeddedReviews = Array.isArray(tourData.tourReviews) ? tourData.tourReviews : (tourData.tourreviews || []);
    const commentedReviews = embeddedReviews.filter(r => r && typeof r.comment === 'string' && r.comment.trim().length > 0);
    const reviewsForAverage = embeddedReviews.filter(r => r && typeof r.rating === 'number');
    const avgFromEmbedded = reviewsForAverage.length > 0
      ? reviewsForAverage.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewsForAverage.length
      : null;

    const averageRating = avgFromEmbedded !== null ? avgFromEmbedded : (Number(tourData.rating) || 0);
    const reviewsCount = embeddedReviews.length > 0 ? embeddedReviews.length : (tourData.reviewCount || 0);

    // Placeholder image for development
    const placeholderImage = 'https://placehold.co/800x600/0d47a1/ffffff?text=Tour+Image';
    
    // Format activity level for display
    const formatActivityLevel = (level) => {
      if (!level) return '';
      const levels = {
        easy: locale === 'en' ? 'Easy' : 'سهل',
        moderate: locale === 'en' ? 'Moderate' : 'متوسط',
        challenging: locale === 'en' ? 'Challenging' : 'صعب',
        difficult: locale === 'en' ? 'Difficult' : 'صعب جداً'
      };
      return levels[level] || level;
    };
    
    // Format transportation for display
    const formatTransportation = (transport) => {
      if (!transport) return '';
      const transportMap = {
        walking: locale === 'en' ? 'Walking Tour' : 'جولة سيراً على الأقدام',
        public: locale === 'en' ? 'Public Transportation' : 'وسائل النقل العامة',
        private: locale === 'en' ? 'Private Vehicle' : 'مركبة خاصة',
        mixed: locale === 'en' ? 'Mixed Transportation' : 'وسائل نقل مختلطة'
      };
      return transportMap[transport] || transport;
    };

    // Helper to title-case location slugs for display
    const formatLocationName = (raw) => {
      if (!raw || typeof raw !== 'string') return '';
      const withSpaces = raw
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2');
      return withSpaces
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    };
    
    return (
      <MainLayout locale={locale}>
        {/* Hero Section !!*/}
        <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh]">
          {tourData.images?.cover?.url ? (
            <LightboxImage
              src={tourData.images.cover.url}
              alt={title}
              containerClassName="absolute inset-0"
              imageClassName="object-contain"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 text-xl">
                {locale === 'en' ? 'No cover image available' : 'لا توجد صورة غلاف متاحة'}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            <div className="container mx-auto">
              <div className="flex items-center space-x-2 mb-3">
                
                {averageRating > 0 && (
                  <div className="flex items-center">
                    <Star className="text-yellow-400 w-5 h-5" />
                    <span className="ml-1 font-medium">{averageRating.toFixed(1)}</span>
                    <span className="ml-1 text-white/80">({reviewsCount} {locale === 'en' ? 'reviews' : 'تقييمات'})</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {title}
              </h1>
              <div className="flex flex-wrap gap-4 md:gap-6">
                <div className="flex items-center">
                  <Clock className="text-primary-400 w-5 h-5 mr-2" />
                  <span>{tourData.duration} {tourData.durationUnit === 'hours' ? 
                    (locale === 'en' ? 'hours' : 'ساعات') : 
                    (locale === 'en' ? 'days' : 'أيام')}
                  </span>
                </div>
                {tourData.locationNames && tourData.locationNames.length > 0 && (
                  <div className="flex items-center">
                    <MapPin className="text-primary-400 w-5 h-5 mr-2" />
                    <span>{tourData.locationNames.map(formatLocationName).join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="text-primary-400 w-5 h-5 mr-2" />
                  <span>{locale === 'en' ? 'Max' : 'الحد الأقصى'} {tourData.maxGroupSize} {locale === 'en' ? 'people' : 'أشخاص'}</span>
                </div>
                {tourData.languages && tourData.languages.length > 0 && (
                  <div className="flex items-center">
                    <Globe className="text-primary-400 w-5 h-5 mr-2" />
                    <span>
                      {tourData.languages.map(lang => 
                        lang === 'en' ? 'English' : 
                        lang === 'ar' ? 'Arabic' : 
                        lang === 'he' ? 'Hebrew' : lang
                      ).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Mobile Book Tour Button */}
              <div className="mb-4 lg:hidden">
                <BookTourModal locale={locale} tourId={tourData._id} maxGroupSize={tourData.maxGroupSize || 10} pricePer={tourData.pricePer || 'group'} guideNotAvailable={tourData.guide?.notAvailable || []} />
              </div>
              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-secondary-900">
                  {locale === 'en' ? 'About This Tour' : 'عن هذه الجولة'}
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p>{description}</p>
                </div>
              </div>
      {/* CTA: Message the guide to customize */}
      {tourData.guide?.userId && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-4 md:px-6 md:py-5 mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="text-secondary-900 mb-3 md:mb-0">
            {locale === 'en'
              ? `Itinerary not perfect? Message ${tourData.guide.name || 'the guide'} to build a tour that's just right for you.`
              : `الخطة ليست مثالية؟ أرسل رسالة إلى ${tourData.guide.name || 'المرشد'} لبناء جولة تناسبك تمامًا.`}
          </p>
          <Link
            href={`/${locale}/chat/${tourData.guide.userId}`}
            className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 bg-black text-white font-medium hover:bg-white hover:text-black transition-colors border-2 border-primary-600"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span>{locale === 'en' ? `Message ${tourData.guide.name || ''}` : `مراسلة ${tourData.guide.name || ''}`}</span>
          </Link>
        </div>
      )}
              
              {/* Tour Plan - Only show for multi-day tours */}
              {tourData.tourPlan && tourData.tourPlan.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-secondary-900">
                    {locale === 'en' ? 'Tour Plan' : 'خطة الجولة'}
                  </h2>
                  <div className="space-y-4">
                    {tourData.tourPlan.map((day, index) => (
                      <details key={day.day} className="group border border-secondary-200 rounded-lg">
                        <summary className="cursor-pointer p-4 bg-secondary-50 hover:bg-secondary-100 transition-colors rounded-lg group-open:rounded-b-none">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-secondary-900">
                              {locale === 'en' ? `Day ${day.day}` : `اليوم ${day.day}`}
                              {day.title && day.title[locale] && (
                                <span className="text-base font-normal text-secondary-600 ml-2">
                                  - {day.title[locale]}
                                </span>
                              )}
                            </h3>
                            <ChevronRight className="w-5 h-5 text-secondary-600 transition-transform group-open:rotate-90" />
                          </div>
                        </summary>
                        <div className="p-4 border-t border-secondary-200">
                          {day.title && day.title[locale] && (
                            <h4 className="font-semibold text-secondary-800 mb-2">
                              {day.title[locale]}
                            </h4>
                          )}
                          <div className="prose max-w-none text-gray-700">
                            <p className="whitespace-pre-line">
                              {day.content && day.content[locale] ? day.content[locale] : day.content?.en || ''}
                            </p>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tour Features */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-secondary-900">
                  {locale === 'en' ? 'Tour Features' : 'ميزات الجولة'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Activity className="text-primary-600 w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium text-secondary-900">
                        {locale === 'en' ? 'Activity Level' : 'مستوى النشاط'}
                      </p>
                      <p className="text-secondary-600">{formatActivityLevel(tourData.activityLevel)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Briefcase className="text-primary-600 w-5 h-5 mr-3 mt-1" />
                    <div>
                      <p className="font-medium text-secondary-900">
                        {locale === 'en' ? 'Expertise' : 'الخبرة'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tourData.expertise.map((exp, i) => (
                          <span key={i} className="bg-secondary-100 text-secondary-800 text-sm px-2.5 py-0.5 rounded">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Car className="text-primary-600 w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium text-secondary-900">
                        {locale === 'en' ? 'Transportation' : 'المواصلات'}
                      </p>
                      <p className="text-secondary-600">{formatTransportation(tourData.transportation)}</p>
                    </div>
                  </div>
                  {tourData.handicappedFriendly && (
                    <div className="flex items-center">
                      <Accessibility className="text-primary-600 w-5 h-5 mr-3" />
                      <div>
                        <p className="text-secondary-600">
                          {locale === 'en' ? 'Handicapped Friendly' : 'مناسب لذوي الاحتياجات الخاصة'}
                        </p>
                      </div>
                    </div>
                  )}
                  {tourData.kidFriendly && (
                    <div className="flex items-center">
                      <Baby className="text-primary-600 w-5 h-5 mr-3" />
                      <div>
                        <p className="text-secondary-600">
                          {locale === 'en' ? 'Kid Friendly' : 'مناسب للأطفال'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Locations */}
                {Array.isArray(tourData.locationNames) && tourData.locationNames.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 text-secondary-900">
                      {locale === 'en' ? 'Covered Locations' : 'المواقع المغطاة'}
                    </h3>
                    <p className="text-sm text-secondary-600 mt-1">
                      {locale === 'en' ? 'This tour typically visits:' : 'تزور هذه الجولة عادةً:'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tourData.locationNames.slice(0, 6).map((location, index) => (
                        <Link
                          key={index}
                          href={`/${locale}/locations/${encodeURIComponent(location.toLowerCase())}`}
                          className="inline-flex items-center gap-1 rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1.5 text-sm text-secondary-800 hover:bg-secondary-100 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-primary-600" />
                          {formatLocationName(location)}
                        </Link>
                      ))}
                      {tourData.locationNames.length > 6 && (
                        <span className="inline-flex items-center rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1.5 text-sm text-secondary-700">
                          +{tourData.locationNames.length - 6} {locale === 'en' ? 'more' : 'أخرى'}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {/* What's Included */}
              {tourData.includes && tourData.includes.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-secondary-900">
                    {locale === 'en' ? 'What\'s Included' : 'ما هو مشمول'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tourData.includes.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="text-primary-600 w-5 h-5 mr-3" />
                        <div>
                          <p className="font-medium text-secondary-900">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {Array.isArray(tourData.faqs) && tourData.faqs.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-secondary-900 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2 text-primary-600" />
                    {locale === 'en' ? 'Frequently Asked Questions' : 'الأسئلة الشائعة'}
                  </h3>
                  <div className="space-y-3">
                    {tourData.faqs.map((faq, idx) => (
                      <details key={idx} className="group border border-secondary-200 rounded-lg">
                        <summary className="cursor-pointer p-4 bg-secondary-50 hover:bg-secondary-100 transition-colors rounded-lg group-open:rounded-b-none list-none [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                          <div className="flex items-center justify-between">
                            <h4 className="text-md font-semibold text-secondary-900">
                              {faq.question?.[locale] || faq.question?.en}
                            </h4>
                            <ChevronRight className="w-5 h-5 text-secondary-600 transition-transform group-open:rotate-90" />
                          </div>
                        </summary>
                        <div className="p-4 border-t border-secondary-200 text-secondary-700">
                          {faq.answer?.[locale] || faq.answer?.en}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Gallery */}
              {tourData.images?.gallery && tourData.images.gallery.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-secondary-900">
                    {locale === 'en' ? 'Tour Gallery' : 'معرض الصور'}
                  </h3>
                  <GalleryLightbox images={tourData.images.gallery} locale={locale} />
                </div>
              )}

              {/* Reviews Section (only reviews with comments) */}
              {commentedReviews && commentedReviews.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-secondary-900">
                    {locale === 'en' ? 'Reviews' : 'المراجعات'}
                  </h3>
                  <div className="space-y-4">
                    {commentedReviews.map((rev) => (
                      <div key={rev.id || rev._id} className="border border-secondary-200 rounded-md p-4">
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="font-medium text-secondary-900">{Number(rev.rating) || 0}</span>
                          <span className="ml-2 text-xs text-secondary-600">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        {rev.userName && (
                          <p className="text-xs text-secondary-700 mb-1">{locale === 'en' ? 'By' : 'بواسطة'} {rev.userName}</p>
                        )}
                        <p className="text-secondary-800 whitespace-pre-line">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Booking Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-3xl font-bold text-primary-600">${tourData.price}</span>
                  <span className="text-secondary-600">{locale === 'en' ? (tourData.pricePer === 'person' ? 'per person' : 'per group') : (tourData.pricePer === 'person' ? 'للشخص' : 'للمجموعة')}</span>
                </div>
                
                <div className="mb-4 hidden lg:block">
                  <BookTourModal locale={locale} tourId={tourData._id} maxGroupSize={tourData.maxGroupSize || 10} pricePer={tourData.pricePer || 'group'} guideNotAvailable={tourData.guide?.notAvailable || []} />
                </div>
                
                <div className="flex justify-between mb-4">
                  <button className="flex items-center text-secondary-700 hover:text-primary-600">
                    <Heart className="w-5 h-5 mr-1" />
                    <span>{locale === 'en' ? 'Save' : 'حفظ'}</span>
                  </button>
                  <ShareTourButton 
                    locale={locale} 
                    tourTitle={tourData.title[locale] || tourData.title.en}
                  />
                  {tourData.guide?.userId ? (
                    <Link 
                      href={`/${locale}/chat/${tourData.guide.userId}`}
                      className="flex items-center text-secondary-700 hover:text-primary-600"
                    >
                      <MessageCircle className="w-5 h-5 mr-1" />
                      <span>{locale === 'en' ? 'Message' : 'رسالة'}</span>
                    </Link>
                  ) : (
                    <button className="flex items-center text-secondary-400 cursor-not-allowed opacity-60" disabled>
                      <MessageCircle className="w-5 h-5 mr-1" />
                      <span>{locale === 'en' ? 'Message' : 'رسالة'}</span>
                    </button>
                  )}
                </div>
                
                <hr className="my-4 border-secondary-200" />
                
                {/* Guide Info */}
                {tourData.guide ? (
                  <>
                    <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                      {locale === 'en' ? 'Your Guide' : 'مرشدك'}
                    </h3>
                    <div className="flex items-center mb-4">
                      {tourData.guide.profileImage ? (
                        <LightboxImage
                          src={tourData.guide.profileImage}
                          alt={tourData.guide.name || ''}
                          containerClassName="relative w-16 h-16 rounded-full overflow-hidden mr-4"
                          imageClassName="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 text-xl">{tourData.guide.name?.charAt(0) || 'G'}</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-secondary-900">{tourData.guide.name || ''}</h4>
                        <div className="flex items-center">
                          <Star className="text-yellow-400 w-4 h-4" />
                          <span className="ml-1 text-secondary-700">
                            {(() => {
                              const reviews = Array.isArray(tourData.guide.reviews) ? tourData.guide.reviews : [];
                              const count = reviews.length;
                              if (count === 0) return '0 (0)';
                              const avg = (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count).toFixed(1);
                              return `${avg} (${count})`;
                            })()}
                          </span>
                        </div>
                        <Link 
                          href={`/${locale}/guides/${tourData.guide._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          {locale === 'en' ? 'View Profile' : 'عرض الملف الشخصي'}
                        </Link>
                      </div>
                    </div>
                    
                 
                    <hr className="my-4 border-secondary-200" />
                  </>
                ) : (
                  <>
                    <div className="bg-secondary-50 rounded-lg p-4 mb-4">
                      <p className="text-secondary-600 text-center">
                        {locale === 'en' 
                          ? 'This tour is currently not assigned to a specific guide.' 
                          : 'هذه الجولة غير مخصصة حاليًا لمرشد معين.'}
                      </p>
                    </div>
                    <hr className="my-4 border-secondary-200" />
                  </>
                )}
                
                {/* Languages */}
                {tourData.languages && tourData.languages.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                      {locale === 'en' ? 'Languages' : 'اللغات'}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tourData.languages.map((language, index) => (
                        <span key={index} className="bg-secondary-100 text-secondary-800 text-sm px-2.5 py-0.5 rounded">
                          {language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : language === 'he' ? 'Hebrew' : language}
                        </span>
                      ))}
                    </div>
                    <hr className="my-4 border-secondary-200" />
                  </>
                )}
                 
              {/* Guide Address */}
              {tourData.guide?.address && (
                <>
                  <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                    {locale === 'en' ? 'Address' : 'العنوان'}
                  </h3>
                  <p className="mb-4 text-secondary-700 flex items-start">
                    <MapPin className="w-4 h-4 mr-1 text-primary-600 mt-0.5" />
                    <span>{tourData.guide.address}</span>
                  </p>
                  <hr className="my-4 border-secondary-200" />
                </>
              )}
                {/* Guide Expertise (comma-separated) */}
                {Array.isArray(tourData.guide?.expertise) && tourData.guide.expertise.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                      {locale === 'en' ? 'Expertise' : 'الخبرة'}
                    </h3>
                    <p className="mb-4 text-secondary-700">
                      {tourData.guide.expertise
                        .map((e) => (typeof e === 'string' ? e : (e?.area || '')))
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <hr className="my-4 border-secondary-200" />
                  </>
                )}
                
                
              </div>
             
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
} 