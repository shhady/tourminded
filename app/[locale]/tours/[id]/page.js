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
  Share,
  MessageCircle,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import User from '@/models/User';

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
      title: `${title} | Tourminded`,
      description: typeof tour.description === 'object'
        ? (locale === 'en' ? tour.description.en : tour.description.ar) || tour.description.en
        : tour.description,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Tour | Tourminded',
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
    
    // Fetch guide data if guide ID exists
    let guideData = null;
    if (tour.guide) {
      try {
        // First find the user by ID
        const user = await User.findById(tour.guide);
        if (!user) {
          console.log('No user found for guide');
        } else {
          // Then find the guide document using the user's ID
          const Guide = (await import('@/models/Guide')).default;
          const guide = await Guide.findOne({ user: user._id });
          
          if (!guide) {
            console.log('No guide profile found for user');
            // Even if no guide profile, we can still show basic user info
            guideData = {
              _id: user._id.toString(),
              name: user.name,
              email: user.email || null,
              phone: user.phone || null,
            };
          } else {
            // Combine user and guide data
            guideData = {
              _id: user._id.toString(),
              name: user.name,
              profileImage: guide?.profileImage?.url || null,
              email: user.email || null,
              phone: user.phone || null,
              rating: guide.rating || 4.5,
              reviewCount: guide.reviewCount || 0,
              // Additional guide-specific fields
              about: guide.about || null,
              languages: guide.languages || [],
              expertise: guide.expertise || [],
              certifications: guide.certifications || [],
              experience: guide.experience || null
            };
          }
          
          console.log('Guide data:', guideData);
        }
      } catch (error) {
        console.error('Error fetching guide data:', error);
      }
    }
    
    // Convert Mongoose document to plain object
    const tourData = JSON.parse(JSON.stringify(tour));
    
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
      expertise: tourData.expertise || '',
      transportation: tourData.transportation || 'walking',
      locationNames: tourData.locationNames || [],
      languages: tourData.languages || [],
      handicappedFriendly: tourData.handicappedFriendly || false,
      kidFriendly: tourData.kidFriendly || false,
      rating: tourData.rating || 0,
      reviewCount: tourData.reviewCount || 0,
      images: tourData.images || { cover: { url: null }, gallery: [] }
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
    
    return (
      <MainLayout locale={locale}>
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh]">
          {tourData.images?.cover?.url ? (
            <Image
              src={tourData.images.cover.url}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 text-xl">
                {locale === 'en' ? 'No cover image available' : 'لا توجد صورة غلاف متاحة'}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            <div className="container mx-auto">
              <div className="flex items-center space-x-2 mb-3">
                {tourData.expertise && (
                  <span className="bg-primary-600 text-white text-sm font-medium px-2.5 py-0.5 rounded">
                    {tourData.expertise}
                  </span>
                )}
                {tourData.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="text-yellow-400 w-5 h-5" />
                    <span className="ml-1 font-medium">{tourData.rating.toFixed(1)}</span>
                    <span className="ml-1 text-white/80">({tourData.reviewCount} {locale === 'en' ? 'reviews' : 'تقييمات'})</span>
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
                    <span>{tourData.locationNames.join(', ')}</span>
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
              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-secondary-900">
                  {locale === 'en' ? 'About This Tour' : 'عن هذه الجولة'}
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p>{description}</p>
                </div>
              </div>
              
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
                  <div className="flex items-center">
                    <Briefcase className="text-primary-600 w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium text-secondary-900">
                        {locale === 'en' ? 'Expertise' : 'الخبرة'}
                      </p>
                      <p className="text-secondary-600">{tourData.expertise}</p>
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
                  <div className="flex items-center">
                    <div className="flex space-x-2 mr-3">
                      {tourData.handicappedFriendly && <Accessibility className="text-primary-600 w-5 h-5" />}
                      {tourData.kidFriendly && <Baby className="text-primary-600 w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">
                        {locale === 'en' ? 'Accessibility' : 'إمكانية الوصول'}
                      </p>
                      <p className="text-secondary-600">
                        {tourData.handicappedFriendly && (locale === 'en' ? 'Handicapped Friendly' : 'مناسب لذوي الاحتياجات الخاصة')}
                        {tourData.handicappedFriendly && tourData.kidFriendly && ', '}
                        {tourData.kidFriendly && (locale === 'en' ? 'Kid Friendly' : 'مناسب للأطفال')}
                        {!tourData.handicappedFriendly && !tourData.kidFriendly && (locale === 'en' ? 'Standard' : 'قياسي')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Gallery */}
              {tourData.images?.gallery && tourData.images.gallery.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-secondary-900">
                    {locale === 'en' ? 'Tour Gallery' : 'معرض الصور'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tourData.images.gallery.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={image.url}
                          alt={`Tour image ${index + 1}`}
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
                  <span className="text-3xl font-bold text-primary-600">${tourData.price}</span>
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
                {tourData.guide ? (
                  <>
                    <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                      {locale === 'en' ? 'Your Guide' : 'مرشدك'}
                    </h3>
                    <div className="flex items-center mb-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                        {tourData.guide.profileImage ? (
                          <Image
                            src={tourData.guide.profileImage}
                            alt={tourData.guide.name || ''}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 text-xl">{tourData.guide.name?.charAt(0) || 'G'}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-900">{tourData.guide.name || ''}</h4>
                        <div className="flex items-center">
                          <Star className="text-yellow-400 w-4 h-4" />
                          <span className="ml-1 text-secondary-700">{tourData.guide.rating || 0} ({tourData.guide.reviewCount || 0})</span>
                        </div>
                        <Link 
                          href={`/${locale}/guides/${tourData.guide._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          {locale === 'en' ? 'View Profile' : 'عرض الملف الشخصي'}
                        </Link>
                      </div>
                    </div>
                    
                    {/* Guide Contact Information */}
                    {(tourData.guide.email || tourData.guide.phone) && (
                      <div className="mb-4 bg-secondary-50 p-3 rounded-lg">
                        <h4 className="font-medium text-secondary-900 mb-2">
                          {locale === 'en' ? 'Contact Information' : 'معلومات الاتصال'}
                        </h4>
                        {tourData.guide.email && (
                          <div className="flex items-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href={`mailto:${tourData.guide.email}`} className="text-primary-600 hover:underline">
                              {tourData.guide.email}
                            </a>
                          </div>
                        )}
                        {tourData.guide.phone && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${tourData.guide.phone}`} className="text-primary-600 hover:underline">
                              {tourData.guide.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    
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
                
                {/* Expertise */}
                {tourData.expertise && (
                  <>
                    <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                      {locale === 'en' ? 'Expertise' : 'الخبرة'}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-secondary-100 text-secondary-800 text-sm px-2.5 py-0.5 rounded">
                        {tourData.expertise}
                      </span>
                    </div>
                    <hr className="my-4 border-secondary-200" />
                  </>
                )}
                
                {/* Locations */}
                {tourData.locationNames && tourData.locationNames.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                      {locale === 'en' ? 'Locations' : 'المواقع'}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tourData.locationNames.map((location, index) => (
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
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
} 