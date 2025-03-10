import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';
import { 
  Star, 
  Clock, 
  Users, 
  MapPin, 
  CalendarDays, 
  Globe, 
  Briefcase, 
  Activity, 
  Car, 
  Accessibility, 
  Baby, 
  Heart,
  Share,
  MessageCircle,
  ChevronRight
} from 'lucide-react';

export async function generateMetadata({ params }) {
  const localeParams = await params;
  const id = await localeParams.id;
  const locale = await localeParams.locale;
  
  // Get tour data
  const tour = await getTourData(id);
  
  if (!tour) {
    return {
      title: locale === 'en' ? 'Tour Not Found' : 'الجولة غير موجودة',
      description: locale === 'en' ? 'The requested tour could not be found.' : 'لم يتم العثور على الجولة المطلوبة.'
    };
  }
  
  return {
    title: `${tour.title[locale]} | Tourminded`,
    description: tour.description[locale].substring(0, 160)
  };
}

// Function to get tour data
async function getTourData(id) {
  try {
    // Connect to database
    const connectDB = (await import('@/lib/mongodb')).default;
    await connectDB();
    
    // Import models
    const Tour = (await import('@/models/Tour')).default;
    const Guide = (await import('@/models/Guide')).default;
    
    // Find tour by ID
    let tour = await Tour.findById(id);
    console.log(tour)
    if (!tour) {
      return null;
    }
    if(tour){
      
    }
   // Fetch guide data separately if guide ID exists
    let guideData = null;
    if (tour.guide) {
      try {
        const guide = await Guide.findOne({user:tour.guide});
        if (guide) {
          guideData = {
            _id: guide._id,
            name: guide.name,
            nickname: guide.nickname,
            expertise: guide.expertise,
            languages: guide.languages,
            rating: guide.rating,
            reviewCount: guide.reviewCount,
            profileImage: guide.profileImage.url
          };
        }
      } catch (error) {
        console.error('Error fetching guide data:', error);
      }
    }
    
    // Populate locations if needed
    let locationsData = [];
    if (tour.locations && tour.locations.length > 0) {
      try {
        const Location = (await import('@/models/Location')).default;
        const locations = await Location.find({
          _id: { $in: tour.locations }
        });
        locationsData = locations;
      } catch (error) {
        console.error('Error fetching locations data:', error);
      }
    }
    
    // Convert Mongoose document to plain object
    const tourData = JSON.parse(JSON.stringify(tour));
    
    // Add some default values for fields that might be missing in the database
    return {
      ...tourData,
      guide: guideData,
      locations: locationsData,
      locationNames: tourData.locationNames || [],
      languages: tourData.languages || [],
      highlights: tourData.highlights || [
        {
          en: 'Explore historical sites with an expert guide',
          ar: 'استكشف المواقع التاريخية مع مرشد خبير'
        },
        {
          en: 'Learn about local culture and traditions',
          ar: 'تعرف على الثقافة والتقاليد المحلية'
        }
      ],
      itinerary: tourData.itinerary || [
        {
          title: {
            en: 'Meeting Point',
            ar: 'نقطة اللقاء'
          },
          description: {
            en: 'Meet your guide at the designated location to begin your tour.',
            ar: 'التق بمرشدك في الموقع المحدد لبدء جولتك.'
          }
        },
        {
          title: {
            en: 'Tour Experience',
            ar: 'تجربة الجولة'
          },
          description: {
            en: 'Enjoy your guided tour with an expert local guide.',
            ar: 'استمتع بجولتك المصحوبة بمرشد محلي خبير.'
          }
        }
      ],
      whatToExpect: tourData.whatToExpect || {
        en: 'This tour includes walking at a moderate pace. Wear comfortable shoes and bring water. Tour includes all entrance fees.',
        ar: 'تتضمن هذه الجولة المشي بوتيرة معتدلة. ارتد أحذية مريحة وأحضر الماء. تشمل الجولة جميع رسوم الدخول.'
      },
      meetingPoint: tourData.meetingPoint || {
        en: 'Details will be provided after booking.',
        ar: 'سيتم تقديم التفاصيل بعد الحجز.'
      },
      cancellationPolicy: tourData.cancellationPolicy || {
        en: 'Free cancellation up to 24 hours before the tour.',
        ar: 'إلغاء مجاني حتى 24 ساعة قبل الجولة.'
      },
      // Ensure these fields exist
      isHandicappedFriendly: tourData.handicappedFriendly || false,
      isKidFriendly: tourData.kidFriendly || false
    };
  } catch (error) {
    console.error('Error getting tour data:', error);
    return null;
  }
}

export default async function TourDetailPage({ params }) {
  const localeParams = await params;
  const id = await localeParams.id;
  const locale = await localeParams.locale;
  
  // Get current user
  const user = await getCurrentUser();
  
  // Get tour data
  const tour = await getTourData(id);
  console.log(tour)
  if (!tour) {
    notFound();
  }
  
  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=';
 
  // Format activity level for display
  const formatActivityLevel = (level) => {
    if (!level) return '';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };
  
  // Format transportation for display
  const formatTransportation = (transport) => {
    if (!transport) return '';
    const transportMap = {
      walking: 'Walking Tour',
      public: 'Public Transportation',
      private: 'Private Vehicle',
      mixed: 'Mixed Transportation'
    };
    return transportMap[transport] || transport;
  };
  
  return (
    <MainLayout locale={locale} user={user}>
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <Image
          src={tour.images?.cover?.url || placeholderImage}
          alt={tour.title[locale]}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <div className="container mx-auto">
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-primary-600 text-white text-sm font-medium px-2.5 py-0.5 rounded">
                {tour.expertise}
              </span>
              <div className="flex items-center">
                <Star className="text-yellow-400 w-5 h-5" />
                <span className="ml-1 font-medium">{tour.rating}</span>
                <span className="ml-1 text-white/80">({tour.reviewCount} {locale === 'en' ? 'reviews' : 'تقييمات'})</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {tour.title[locale]}
            </h1>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <div className="flex items-center">
                <Clock className="text-primary-400 w-5 h-5 mr-2" />
                <span>{tour.duration} {tour.durationUnit === 'hours' ? 
                  (locale === 'en' ? 'hours' : 'ساعات') : 
                  (locale === 'en' ? 'days' : 'أيام')}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="text-primary-400 w-5 h-5 mr-2" />
                <span>{tour.locationNames?.join(', ') || 'Various Locations'}</span>
              </div>
              <div className="flex items-center">
                <Users className="text-primary-400 w-5 h-5 mr-2" />
                <span>{locale === 'en' ? 'Max' : 'الحد الأقصى'} {tour.maxGroupSize} {locale === 'en' ? 'people' : 'أشخاص'}</span>
              </div>
              <div className="flex items-center">
                <Globe className="text-primary-400 w-5 h-5 mr-2" />
                <span>{tour.languages?.join(', ') || 'Multiple Languages'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-secondary-900">
                {locale === 'en' ? 'About This Tour' : 'عن هذه الجولة'}
              </h2>
              <p className="text-secondary-700 mb-6">
                {tour.description[locale]}
              </p>
              
              {/* Tour Highlights */}
              {tour.highlights && tour.highlights.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold mb-3 text-secondary-900">
                    {locale === 'en' ? 'Tour Highlights' : 'أبرز معالم الجولة'}
                  </h3>
                  <ul className="mb-6 space-y-2">
                    {tour.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <ChevronRight className="text-primary-600 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-secondary-700">{highlight[locale]}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              {/* Tour Features */}
              <h3 className="text-xl font-semibold mb-3 text-secondary-900">
                {locale === 'en' ? 'Tour Features' : 'ميزات الجولة'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Activity className="text-primary-600 w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">
                      {locale === 'en' ? 'Activity Level' : 'مستوى النشاط'}
                    </p>
                    <p className="text-secondary-600">{formatActivityLevel(tour.activityLevel)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Briefcase className="text-primary-600 w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">
                      {locale === 'en' ? 'Expertise' : 'الخبرة'}
                    </p>
                    <p className="text-secondary-600">{tour.expertise}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Car className="text-primary-600 w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">
                      {locale === 'en' ? 'Transportation' : 'المواصلات'}
                    </p>
                    <p className="text-secondary-600">{formatTransportation(tour.transportation)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-3">
                    {tour.isHandicappedFriendly && <Accessibility className="text-primary-600 w-5 h-5" />}
                    {tour.isKidFriendly && <Baby className="text-primary-600 w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">
                      {locale === 'en' ? 'Accessibility' : 'إمكانية الوصول'}
                    </p>
                    <p className="text-secondary-600">
                      {tour.isHandicappedFriendly && (locale === 'en' ? 'Handicapped Friendly' : 'مناسب لذوي الاحتياجات الخاصة')}
                      {tour.isHandicappedFriendly && tour.isKidFriendly && ', '}
                      {tour.isKidFriendly && (locale === 'en' ? 'Kid Friendly' : 'مناسب للأطفال')}
                      {!tour.isHandicappedFriendly && !tour.isKidFriendly && (locale === 'en' ? 'Standard' : 'قياسي')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-secondary-900">
                  {locale === 'en' ? 'Tour Itinerary' : 'مسار الجولة'}
                </h2>
                <div className="space-y-6">
                  {tour.itinerary.map((item, index) => (
                    <div key={index} className="relative pl-8 pb-6 border-l-2 border-primary-200 last:border-l-0 last:pb-0">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary-600"></div>
                      <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                        {item.title[locale]}
                      </h3>
                      <p className="text-secondary-700">
                        {item.description[locale]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* What to Expect */}
            {tour.whatToExpect && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-secondary-900">
                  {locale === 'en' ? 'What to Expect' : 'ما يمكن توقعه'}
                </h2>
                <p className="text-secondary-700 mb-4">
                  {tour.whatToExpect[locale]}
                </p>
                
                {tour.meetingPoint && (
                  <>
                    <h3 className="text-xl font-semibold mb-2 text-secondary-900">
                      {locale === 'en' ? 'Meeting Point' : 'نقطة اللقاء'}
                    </h3>
                    <p className="text-secondary-700 mb-4">
                      {tour.meetingPoint[locale]}
                    </p>
                  </>
                )}
                
                {tour.cancellationPolicy && (
                  <>
                    <h3 className="text-xl font-semibold mb-2 text-secondary-900">
                      {locale === 'en' ? 'Cancellation Policy' : 'سياسة الإلغاء'}
                    </h3>
                    <p className="text-secondary-700">
                      {tour.cancellationPolicy[locale]}
                    </p>
                  </>
                )}
              </div>
            )}
            
            {/* Gallery */}
            {tour.images?.gallery && tour.images.gallery.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-secondary-900">
                  {locale === 'en' ? 'Tour Gallery' : 'معرض الصور'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tour.images.gallery.map((image, index) => (
                    <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src={image.url}
                        alt={`${tour.title[locale]} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
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
                <span className="text-3xl font-bold text-primary-600">${tour.price}</span>
                <span className="text-secondary-600">{locale === 'en' ? 'per person' : 'للشخص الواحد'}</span>
              </div>
              
              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg mb-4 transition duration-300">
                {locale === 'en' ? 'Book Now' : 'احجز الآن'}
              </button>
              
              <div className="flex justify-between mb-4">
                <button className="flex items-center text-secondary-700 hover:text-primary-600">
                  <Heart className="w-5 h-5 mr-1" />
                  <span>{locale === 'en' ? 'Save' : 'حفظ'}</span>
                </button>
                <button className="flex items-center text-secondary-700 hover:text-primary-600">
                  <Share className="w-5 h-5 mr-1" />
                  <span>{locale === 'en' ? 'Share' : 'مشاركة'}</span>
                </button>
                <button className="flex items-center text-secondary-700 hover:text-primary-600">
                  <MessageCircle className="w-5 h-5 mr-1" />
                  <span>{locale === 'en' ? 'Ask' : 'اسأل'}</span>
                </button>
              </div>
              
              <hr className="my-4 border-secondary-200" />
              
              {/* Guide Info */}
              {tour.guide ? (
                <>
                  <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                    {locale === 'en' ? 'Your Guide' : 'مرشدك'}
                  </h3>
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                      <Image
                        src={tour.guide.profileImage || placeholderImage}
                        alt={tour.guide.name?.[locale] || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-900">{tour.guide.name?.[locale] || ''}</h4>
                      <div className="flex items-center">
                        <Star className="text-yellow-400 w-4 h-4" />
                        <span className="ml-1 text-secondary-700">{tour.guide.rating || 0} ({tour.guide.reviewCount || 0})</span>
                      </div>
                      <Link 
                        href={`/${locale}/guides/${tour.guide._id}`}
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
              {tour.languages && tour.languages.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                    {locale === 'en' ? 'Languages' : 'اللغات'}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tour.languages.map((language, index) => (
                      <span key={index} className="bg-secondary-100 text-secondary-800 text-sm px-2.5 py-0.5 rounded">
                        {language}
                      </span>
                    ))}
                  </div>
                  <hr className="my-4 border-secondary-200" />
                </>
              )}
              
              {/* Expertise */}
              {tour.expertise && (
                <>
                  <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                    {locale === 'en' ? 'Expertise' : 'الخبرة'}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-secondary-100 text-secondary-800 text-sm px-2.5 py-0.5 rounded">
                      {tour.expertise}
                    </span>
                  </div>
                  <hr className="my-4 border-secondary-200" />
                </>
              )}
              
              {/* Locations */}
              {tour.locationNames && tour.locationNames.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                    {locale === 'en' ? 'Locations' : 'المواقع'}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tour.locationNames.map((location, index) => (
                      <Link 
                        key={index}
                        href={`/${locale}/locations/${encodeURIComponent(location.toLowerCase())}`}
                        className="bg-secondary-100 text-secondary-800 text-sm px-2.5 py-0.5 rounded hover:bg-secondary-200 transition-colors"
                      >
                        {location}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 