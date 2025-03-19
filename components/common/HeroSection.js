'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import Image from 'next/image';
import { Search, Users, GraduationCap, Languages, ChevronDown } from 'lucide-react';

const HeroSection = ({ locale }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [travelers, setTravelers] = useState(2);
  const [expertise, setExpertise] = useState('');
  const [language, setLanguage] = useState('');
  const [currentBg, setCurrentBg] = useState(0);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Background images for carousel
  const bgImages = [
    '/hero-bg-1.jpg',
    '/hero-bg-2.jpg',
    '/hero-bg-3.jpg',
  ];

  // Set initial client-side state and handle scroll effects
  useEffect(() => {
    setIsClient(true);

    // Background image carousel
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 6000);

    // Add scroll listener for subtle parallax effect
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [bgImages.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Create a URLSearchParams object to build the query string
    const searchParams = new URLSearchParams();
    
    // Use the same parameter names as in the TourFilters component
    if (travelers && travelers !== 2) {
      searchParams.append('travelers', travelers);
      console.log('Adding travelers:', travelers);
    }
    
    if (expertise) {
      searchParams.append('expertise', expertise);
      console.log('Adding expertise:', expertise);
    }
    
    if (language) {
      searchParams.append('language', language);
      console.log('Adding language:', language);
    }
    
    // Navigate to the tours page with the search parameters
    const queryString = searchParams.toString();
    const url = `/${locale}/tours${queryString ? `?${queryString}` : ''}`;
    
    console.log('Navigating to:', url);
    router.push(url);
  };

  const toggleFormExpansion = () => {
    setIsFormExpanded(!isFormExpanded);
  };

  const expertiseOptions = [
    { value: '', label: locale === 'en' ? 'All Expertise' : 'جميع الخبرات' },
    { value: 'christian', label: locale === 'en' ? 'Christian' : 'مسيحي' },
    { value: 'jewish', label: locale === 'en' ? 'Jewish' : 'يهودي' },
    { value: 'muslim', label: locale === 'en' ? 'Muslim' : 'إسلامي' },
    { value: 'political', label: locale === 'en' ? 'Political' : 'سياسي' },
    { value: 'historical', label: locale === 'en' ? 'Historical' : 'تاريخي' },
    { value: 'cultural', label: locale === 'en' ? 'Cultural' : 'ثقافي' },
    { value: 'food', label: locale === 'en' ? 'Food' : 'طعام' },
    { value: 'adventure', label: locale === 'en' ? 'Adventure' : 'مغامرة' },
    { value: 'nature', label: locale === 'en' ? 'Nature' : 'طبيعة' },
    { value: 'photography', label: locale === 'en' ? 'Photography' : 'تصوير' },
    { value: 'culinary', label: locale === 'en' ? 'Culinary' : 'طهي' },
    { value: 'all-inclusive', label: locale === 'en' ? 'All-inclusive' : 'شامل' },
  ];

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
    <div className="relative min-h-[550px] sm:min-h-[650px] md:min-h-[80vh] overflow-hidden">
      {/* Background Image Carousel with subtle parallax */}
      <div className="absolute inset-0 w-full h-full">
        {bgImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-2000 ${
              index === currentBg ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              transform: isScrolled ? 'scale(1.03) translateY(-1%)' : 'scale(1)',
              transition: 'transform 0.8s ease-out'
            }}
          >
            <Image 
              src={img} 
              alt="Holy Land scenery" 
              fill 
              priority
              className="object-cover" 
              quality={90}
            />
            {/* Softer gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/40" />
          </div>
        ))}
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 py-8 md:py-0 h-full flex flex-col justify-center relative z-20">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
            {locale === 'en' 
              ? 'Discover the Holy Land with Expert Guides' 
              : 'اكتشف الأرض المقدسة مع مرشدين خبراء'}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            {locale === 'en'
              ? 'Personalized tours with guides who share your interests and speak your language'
              : 'جولات مخصصة مع مرشدين يشاركونك اهتماماتك ويتحدثون لغتك'}
          </p>
        </div>

        {/* Search Form - Mobile Collapsed Version */}
        <div className="md:hidden bg-white/90 backdrop-blur-sm rounded-xl shadow-lg mb-4 animate-fade-in overflow-hidden">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={toggleFormExpansion}
          >
            <div className="flex items-center">
              <Search className="text-primary-600 mr-3" size={20} />
              <span className="font-medium text-secondary-900">
                {locale === 'en' ? 'Find Your Tour' : 'ابحث عن جولتك'}
              </span>
            </div>
            <ChevronDown 
              className={`text-secondary-600 transition-transform duration-300 ${isFormExpanded ? 'rotate-180' : ''}`} 
              size={20} 
            />
          </div>
          
          {isFormExpanded && (
            <div className="p-4 pt-0 border-t border-gray-100">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Travelers */}
                <div>
                  <label className="text-secondary-800 text-sm font-medium mb-1 block">
                    {locale === 'en' ? 'Number of Travelers' : 'عدد المسافرين'}
                  </label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className={`${locale === "en" ? "":"pr-8"} w-full px-3 py-2 border border-gray-200 rounded-lg text-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white`}
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                    <option value="11+">{locale === 'en' ? '11+' : '+11'}</option>
                  </select>
                </div>

                {/* Expertise */}
                <div>
                  <label className="text-secondary-800 text-sm font-medium mb-1 block">
                    {locale === 'en' ? 'Tour Type' : 'نوع الجولة'}
                  </label>
                  <select
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    className={`${locale === "en" ? "":"pr-8"} w-full px-3 py-2 border border-gray-200 rounded-lg text-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white`}
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
                  >
                    {expertiseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Languages */}
                <div>
                  <label className="text-secondary-800 text-sm font-medium mb-1 block">
                    {locale === 'en' ? 'Languages' : 'اللغات'}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`${locale === "en" ? "":"pr-8"} w-full px-3 py-2 border border-gray-200 rounded-lg text-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white`}
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <Button 
                  type="submit" 
                  className="w-full py-2.5 px-4 text-base font-medium bg-primary-600 hover:bg-primary-700 text-black rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Search size={18} />
                    <span>{locale === 'en' ? 'Search Tours' : 'البحث عن الجولات'}</span>
                  </div>
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Search Form - Desktop Version */}
        <div className="hidden md:block bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 max-w-4xl mx-auto animate-fade-in">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Travelers */}
            <div>
              <label className="text-secondary-800 text-sm font-medium mb-2 flex items-center">
                <Users className="text-primary-600 mr-2" size={16} />
                <span>{locale === 'en' ? 'Number of Travelers' : 'عدد المسافرين'}</span>
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className={`${locale === "en" ? "":"pr-8"} w-full px-4 py-3 border border-gray-200 rounded-lg text-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white hover:border-primary-300 transition-colors`}
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
                <option value="11+">{locale === 'en' ? '11+' : '+11'}</option>
              </select>
            </div>

            {/* Expertise */}
            <div>
              <label className="text-secondary-800 text-sm font-medium mb-2 flex items-center">
                <GraduationCap className="text-primary-600 mr-2" size={16} />
                <span>{locale === 'en' ? 'Tour Type' : 'نوع الجولة'}</span>
              </label>
              <select
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className={`${locale === "en" ? "":"pr-8"} w-full px-4 py-3 border border-gray-200 rounded-lg text-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white hover:border-primary-300 transition-colors`}
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
              >
                {expertiseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Languages */}
            <div>
              <label className="text-secondary-800 text-sm font-medium mb-2 flex items-center">
                <Languages className="text-primary-600 mr-2" size={16} />
                <span>{locale === 'en' ? 'Languages' : 'اللغات'}</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`${locale === "en" ? "":"pr-8"} w-full px-4 py-3 border border-gray-200 rounded-lg text-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white hover:border-primary-300 transition-colors`}
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-3 mt-1">
              <Button 
                type="submit" 
                className="w-full py-3 px-6 text-base font-medium bg-primary-600 hover:bg-primary-700 text-black rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <Search size={18} />
                  <span>{locale === 'en' ? 'Find Your Perfect Tour' : 'ابحث عن جولتك المثالية'}</span>
                </div>
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Add subtle animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;