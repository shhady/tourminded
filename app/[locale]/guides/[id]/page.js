'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { Star, Languages, MapPin, Award, Mail, Phone, Share2, Download, MessageCircle, Camera, Calendar } from 'lucide-react';

export default function GuideProfilePage() {
  const params = useParams();
  const { id, locale } = params;
  
  const [guide, setGuide] = useState(null);
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
          title: guide?.name?.[locale] || guide?.name?.en || 'Guide Profile',
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
    
    const name = guide.name?.[locale] || guide.name?.en || guide.user?.name || 'Guide';
    const phone = guide.phone || guide.user?.phone || '';
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
  const name = guide.name?.[locale] || guide.name?.en || guide.user?.name || 'Guide';
  const bio = guide.about?.[locale] || guide.about?.en || '';
  const profileImage = guide.profileImage?.url || '/images/default-guide.jpg';
  const coverImage = guide.coverImage?.url || 'https://res.cloudinary.com/tourminded/image/upload/v1689542321/jerusalem-cover_xzbjvf.jpg';
  const rating = guide.rating || 5;
  const reviewCount = guide.reviewCount || 0;
  const languages = guide.languages || [];
  const expertise = guide.expertise || [];
  const address = guide.address || 'Israel';
  const phone = guide.phone || guide.user?.phone || '';
  const email = guide.user?.email || '';
  
  return (
    <MainLayout locale={locale}>
      {/* Hero Cover Image Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        {/* Cover Image */}
        <div className="absolute inset-0">
          <Image 
            src={'/tour-image-1.jpg'}
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
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-gray-800 sticky top-24">
              {/* Profile Info */}
              <div className="p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="bg-primary-50 p-3 rounded-lg">
                    <div className="text-primary-600 font-bold text-xl">{languages.length}</div>
                    <div className="text-xs text-gray-600">{locale === 'en' ? 'Languages' : 'لغات'}</div>
                  </div>
                  <div className="bg-secondary-50 p-3 rounded-lg">
                    <div className="text-secondary-600 font-bold text-xl">{expertise.length}</div>
                    <div className="text-xs text-gray-600">{locale === 'en' ? 'Specialties' : 'تخصصات'}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-yellow-600 font-bold text-xl">{guide.yearsExperience || 5}+</div>
                    <div className="text-xs text-gray-600">{locale === 'en' ? 'Years Exp.' : 'سنوات الخبرة'}</div>
                  </div>
                </div>
                
                {/* Availability Badge */}
                <div className="mb-6 text-center">
                  <span className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{locale === 'en' ? 'Available for Booking' : 'متاح للحجز'}</span>
                  </span>
                </div>
                
                {/* Contact Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {email && (
                    <a 
                      href={`mailto:${email}`}
                      className="flex items-center justify-center bg-primary-100 hover:bg-primary-200 text-primary-800 py-2 px-4 rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{locale === 'en' ? 'Email' : 'البريد الإلكتروني'}</span>
                    </a>
                  )}
                  
                  {phone && (
                    <a 
                      href={`tel:${phone}`}
                      className="flex items-center justify-center bg-secondary-100 hover:bg-secondary-200 text-secondary-800 py-2 px-4 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{locale === 'en' ? 'Call' : 'اتصال'}</span>
                    </a>
                  )}
                </div>
                
                {/* QR Code */}
                <div className="border-t border-gray-100 pt-6 mb-6">
                  <p className="text-sm text-gray-500 mb-3 text-center">
                    {locale === 'en' ? 'Scan to view profile' : 'امسح لعرض الملف الشخصي'}
                  </p>
                  <div className="flex justify-center">
                    <div className="inline-block p-2 bg-white border border-gray-200 rounded-lg">
                      {qrCode && (
                        <img 
                          src={qrCode}
                          alt="QR Code"
                          width={120}
                          height={120}
                          className="rounded"
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Share and Save Contact */}
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={handleShare}
                    className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors relative"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    <span>{copied ? (locale === 'en' ? 'Copied!' : 'تم النسخ!') : (locale === 'en' ? 'Share' : 'مشاركة')}</span>
                    
                    {/* Tooltip for copied state */}
                    {copied && (
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded">
                        {locale === 'en' ? 'Link copied!' : 'تم نسخ الرابط!'}
                      </span>
                    )}
                  </button>
                  
                  <button 
                    onClick={generateVCard}
                    className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span>{locale === 'en' ? 'Save Contact' : 'حفظ جهة الاتصال'}</span>
                  </button>
                </div>
              </div>
              
              {/* Languages */}
              <div className="bg-gray-50 p-6 border-t border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <Languages className="w-5 h-5 mr-2 text-primary-600" />
                  {locale === 'en' ? 'Languages' : 'اللغات'}
                </h2>
                
                <div className="space-y-4">
                  {languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{lang.language}</span>
                      
                      <div className="flex items-center">
                        {/* Proficiency indicator */}
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-2 h-6 rounded-sm ${i < lang.proficiency ? 'bg-primary-500' : 'bg-gray-200'}`}
                            ></div>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {lang.proficiency === 5 ? (locale === 'en' ? 'Native' : 'اللغة الأم') : 
                           lang.proficiency === 4 ? (locale === 'en' ? 'Fluent' : 'طلاقة') :
                           lang.proficiency === 3 ? (locale === 'en' ? 'Advanced' : 'متقدم') :
                           lang.proficiency === 2 ? (locale === 'en' ? 'Intermediate' : 'متوسط') :
                           (locale === 'en' ? 'Basic' : 'أساسي')}
                        </span>
                      </div>
                    </div>
                  ))}
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
                      <span className="font-medium text-secondary-700">{exp.years}</span>
                      <span className="ml-1">
                        {locale === 'en' 
                          ? `year${exp.years !== 1 ? 's' : ''} of experience` 
                          : `سنة${exp.years !== 1 ? '' : ''} من الخبرة`}
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
            
            {/* Gallery Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Camera className="w-5 h-5" />
                </span>
                {locale === 'en' ? 'Gallery' : 'معرض الصور'}
              </h2>
              
              {guide.gallery && guide.gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {guide.gallery.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={image.url}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Placeholder gallery images */}
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <Camera className="w-8 h-8" />
                      </div>
                    </div>
                  ))}
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
                
                <Link 
                  href={`/${locale}/guides/${guide._id}/reviews`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {locale === 'en' ? 'View all' : 'عرض الكل'}
                </Link>
              </div>
              
              {reviewCount > 0 ? (
                <div className="space-y-6">
                  {/* Sample reviews would go here */}
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <h4 className="font-medium">John Doe</h4>
                        <div className="flex items-center text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                          <span className="text-gray-500 text-sm ml-2">2 months ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Amazing guide! Very knowledgeable about the history and culture of the region.
                      Made our trip truly memorable.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <h4 className="font-medium">Jane Smith</h4>
                        <div className="flex items-center text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                          <span className="text-gray-500 text-sm ml-2">3 months ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Excellent experience! Our guide was friendly, professional, and very informative.
                      Highly recommend!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {locale === 'en' 
                      ? 'No reviews yet' 
                      : 'لا توجد تقييمات حتى الآن'}
                  </p>
                  <button className="bg-primary-100 hover:bg-primary-200 text-primary-800 font-medium py-2 px-4 rounded-lg transition-colors">
                    {locale === 'en' ? 'Be the first to review' : 'كن أول من يقيم'}
                  </button>
                </div>
              )}
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