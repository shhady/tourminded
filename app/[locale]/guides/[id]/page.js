'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { Star, Languages, MapPin, Award, Mail, Phone, Share2, Download, MessageCircle, Camera, Calendar, Car } from 'lucide-react';

export default function GuideProfilePage() {
  const params = useParams();
  const { id, locale } = params;
  
  const [guide, setGuide] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Fetch guide data
  useEffect(() => {
    async function fetchGuide() {
      try {
        const response = await fetch(`/api/guides/${id}`);
        if (!response.ok) {
          throw new Error('Guide not found');
        }
        const data = await response.json();
        setGuide(data);
        
        // Fetch tours by this guide
        const toursResponse = await fetch(`/api/tours?guideId=${id}`);
        if (toursResponse.ok) {
          const toursData = await toursResponse.json();
          setTours(toursData.tours || []);
        }
      } catch (error) {
        console.error('Error fetching guide:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGuide();
  }, [id]);
  
  // Generate QR code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`);
    }
  }, []);
  
  // Handle share functionality
  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: getGuideName(),
          text: `Check out this guide profile on Tourminded`,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Generate vCard data
  const generateVCard = () => {
    if (!guide) return;
    
    const name = getGuideName();
    const phone = guide.phone || '';
    const email = guide.user?.email || '';
    const address = guide.address || 'Israel';
    
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TITLE:Tour Guide
TEL;TYPE=WORK,VOICE:${phone}
EMAIL;TYPE=WORK:${email}
ADR;TYPE=WORK:;;${address};;;;
URL:${window.location.href}
NOTE:Professional tour guide on Tourminded
END:VCARD`;
    
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Helper function to get guide name in current locale
  const getGuideName = () => {
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
    if (nameObj && nameObj.value) return nameObj.value;
    
    // Fallback to English name
    const enNameObj = guide.names?.find(n => n.language === 'English');
    if (enNameObj && enNameObj.value) return enNameObj.value;
    
    // Fallback to first available name
    if (guide.names && guide.names.length > 0 && guide.names[0].value) {
      return guide.names[0].value;
    }
    
    // Last fallback to nickname
    return guide.nickname || 'Guide';
  };
  
  // Helper function to get guide bio in current locale
  const getGuideBio = () => {
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
  
  // Calculate years of experience
  const calculateYearsOfExperience = () => {
    if (!guide || !guide.expertise || guide.expertise.length === 0 || !guide.expertise[0].licenseIssueDate) {
      return 0;
    }
    
    try {
      const licenseDate = new Date(guide.expertise[0].licenseIssueDate);
      const today = new Date();
      
      let years = today.getFullYear() - licenseDate.getFullYear();
      const monthDiff = today.getMonth() - licenseDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < licenseDate.getDate())) {
        years--;
      }
      
      return years;
    } catch (error) {
      console.error('Error calculating years of experience:', error);
      return 0;
    }
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
      'All-inclusive': 'الشاملة'
    };
    
    return arabicAreas[area] || area;
  };
  
  if (loading) {
    return (
      <MainLayout locale={locale}>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!guide) {
    return (
      <MainLayout locale={locale}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {locale === 'en' ? 'Guide Not Found' : 'لم يتم العثور على المرشد'}
          </h1>
          <p className="text-gray-600 mb-8">
            {locale === 'en' 
              ? 'The guide you are looking for does not exist or has been removed.' 
              : 'المرشد الذي تبحث عنه غير موجود أو تمت إزالته.'}
          </p>
          <Link 
            href={`/${locale}/guides`}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {locale === 'en' ? 'Back to Guides' : 'العودة إلى المرشدين'}
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  // Extract guide data
  const name = getGuideName();
  const bio = getGuideBio();
  const profileImage = guide.profileImage?.url || '/images/default-guide.jpg';
  const coverImage = guide.coverImage?.url || '/images/default-cover.jpg';
  const rating = guide.rating || 5;
  const reviewCount = guide.reviewCount || 0;
  const languages = guide.languages || [];
  const expertise = guide.expertise || [];
  const address = guide.address || 'Israel';
  const yearsExperience = calculateYearsOfExperience();
  const vehicle = guide.vehicle || {};
  
  return (
    <MainLayout locale={locale}>
      {/* Hero Cover Image Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        {/* Cover Image */}
        <div className="absolute inset-0">
          <Image 
            src={coverImage}
            alt={`${name} cover`}
            fill
            className="object-cover"
            priority
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
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mr-6">
                <Image 
                  src={profileImage}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">{name}</h1>
                <div className="flex items-center">
                  <div className="flex items-center bg-yellow-400/90 text-gray-900 px-3 py-1 rounded-full shadow-md backdrop-blur-sm mr-4">
                    <Star className="w-4 h-4 mr-1 text-yellow-700 fill-yellow-700" />
                    <span className="font-bold">{rating.toFixed(1)}</span>
                    <span className="text-sm ml-1">
                      ({reviewCount} {locale === 'en' ? 'reviews' : 'تقييمات'})
                    </span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{address}</span>
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
              {/* Languages */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Languages className="w-5 h-5 mr-2 text-primary-600" />
                  {locale === 'en' ? 'Languages' : 'اللغات'}
                </h3>
                
                <div className="space-y-3">
                  {languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{getLanguageName(lang.language)}</span>
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">(12)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
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
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {locale === 'en' ? 'Scan to Share' : 'امسح للمشاركة'}
                </h3>
                
                <div className="bg-white p-2 border border-gray-200 rounded-lg inline-block">
                  {qrCode && (
                    <Image 
                      src={qrCode}
                      alt="QR Code"
                      width={150}
                      height={150}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
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
            
            {/* Expertise Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="w-8 h-8 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mr-3">
                  <Award className="w-5 h-5" />
                </span>
                {locale === 'en' ? 'Areas of Expertise' : 'مجالات الخبرة'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {expertise.map((exp, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
                        <Award className="w-5 h-5 text-secondary-600" />
                      </div>
                      <h3 className="text-lg font-semibold">{exp.area}</h3>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="font-medium text-secondary-700">{yearsExperience}</span>
                      <span className="ml-1">
                        {locale === 'en' 
                          ? `year${yearsExperience !== 1 ? 's' : ''} of experience` 
                          : `سنة${yearsExperience !== 1 ? '' : ''} من الخبرة`}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      {locale === 'en'
                        ? `Specialized knowledge and expertise in ${exp.area} topics and sites.`
                        : `معرفة وخبرة متخصصة في مواضيع ومواقع ${exp.area}.`}
                    </p>
                  </div>
                ))}
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
                  {tours.map((tour, index) => (
                    <Link 
                      key={index} 
                      href={`/${locale}/tours/${tour._id}`}
                      className="block group"
                    >
                      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="relative h-48 w-full">
                          <Image 
                            src={tour.images?.[0]?.url || '/images/default-tour.jpg'}
                            alt={tour.title?.[locale] || tour.title?.en || 'Tour'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
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
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-3">
                    <Star className="w-5 h-5" />
                  </span>
                  {locale === 'en' ? 'Reviews' : 'التقييمات'}
                </h2>
              </div>
              
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {locale === 'en' 
                    ? 'Reviews coming soon!' 
                    : 'التقييمات قادمة قريبًا!'}
                </p>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-gray-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                  <MessageCircle className="w-5 h-5" />
                </span>
                {locale === 'en' ? 'Contact Me' : 'تواصل معي'}
              </h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'en' ? 'Your Name' : 'اسمك'}
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={locale === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'en' ? 'Your Email' : 'بريدك الإلكتروني'}
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={locale === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني'}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Message' : 'الرسالة'}
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={locale === 'en' ? 'What would you like to know?' : 'ماذا تريد أن تعرف؟'}
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {locale === 'en' ? 'Send Message' : 'إرسال رسالة'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}