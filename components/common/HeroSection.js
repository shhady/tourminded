'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import Image from 'next/image';
import { Search, Calendar, Users, GraduationCap, Languages } from 'lucide-react';

const HeroSection = ({ locale }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [expertise, setExpertise] = useState('');
  const [language, setLanguage] = useState('');
  const [currentBg, setCurrentBg] = useState(0);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Background images for carousel
  const bgImages = [
    '/hero-bg-1.jpg',
    '/hero-bg-2.jpg',
    '/hero-bg-3.jpg',
  ];

  // Set initial date only on client-side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setStartDate(new Date().toISOString().split('T')[0]);

    // Background image carousel
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append('date', startDate);
    if (travelers) searchParams.append('travelers', travelers);
    if (expertise) searchParams.append('expertise', expertise);
    if (language) searchParams.append('language', language);
    
    router.push(`/${locale}/tours?${searchParams.toString()}`);
  };

  const toggleFormExpansion = () => {
    setIsFormExpanded(!isFormExpanded);
  };

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
    <div className="relative min-h-[500px] sm:min-h-[600px] md:h-[85vh] overflow-hidden bg-gray-100">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 w-full h-full">
        {bgImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentBg ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Placeholder div until we have actual images */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100" />
            <Image 
              src={img} 
              alt="Hero background" 
              fill 
              priority
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-black opacity-30 md:opacity-20" />
          </div>
        ))}
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 py-8 md:py-0 h-full flex flex-col justify-center relative z-20">
        <div className="max-w-3xl mx-auto text-center mb-6 md:mb-12 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white md:text-secondary-900 leading-tight drop-shadow-md md:drop-shadow-none">
            {locale === 'en' 
              ? 'Make your visit to the Holy Land the trip of a lifetime' 
              : 'اجعل زيارتك للأرض المقدسة رحلة العمر'}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white md:text-secondary-700 opacity-90 mb-6 md:mb-8 drop-shadow-md md:drop-shadow-none">
            {locale === 'en'
              ? 'Tourminded matches you directly to expert local guides based on your interests and language'
              : 'تربطك توورمايندد مباشرة بمرشدين محليين خبراء بناءً على اهتماماتك ولغتك'}
          </p>
         
        </div>

        {/* Search Form - Mobile Collapsed Version */}
        <div className="md:hidden bg-white rounded-xl shadow-lg mb-4 animate-slide-up">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={toggleFormExpansion}
          >
            <div className="flex items-center">
              <Search className="text-primary-600 mr-2" size={20} />
              <span className="font-medium text-secondary-900">
                {locale === 'en' ? 'Find Your Perfect Tour' : 'ابحث عن جولتك المثالية'}
              </span>
            </div>
            <div className={`transition-transform duration-300 ${isFormExpanded ? 'rotate-180' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
          
          {isFormExpanded && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Date Input */}
                <div>
                  <label className="text-secondary-900 text-sm font-medium mb-1 flex items-center">
                    <Calendar className="mr-2 text-primary-500" size={16} />
                    {locale === 'en' ? 'Travel Date' : 'تاريخ السفر'}
                  </label>
                  {isClient && (
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  )}
                </div>

                {/* Travelers */}
                <div>
                  <label className="text-secondary-900 text-sm font-medium mb-1 flex items-center">
                    <Users className="mr-2 text-primary-500" size={16} />
                    {locale === 'en' ? '# Of Travelers' : 'عدد المسافرين'}
                  </label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
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
                  <label className="text-secondary-900 text-sm font-medium mb-1 flex items-center">
                    <GraduationCap className="mr-2 text-primary-500" size={16} />
                    {locale === 'en' ? 'Guide Expertise' : 'خبرة المرشد'}
                  </label>
                  <select
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
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
                  <label className=" text-secondary-900 text-sm font-medium mb-1 flex items-center">
                    <Languages className="mr-2 text-primary-500" size={16} />
                    {locale === 'en' ? 'Languages' : 'اللغات'}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
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
                  className="w-full py-2 text-base font-semibold"
                  variant="primary"
                  icon={<Search size={18} />}
                >
                  {locale === 'en' ? 'Search Tours' : 'البحث عن الجولات'}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Search Form - Desktop Version */}
        <div className="hidden md:block bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Date Input */}
            <div>
              <label className="text-secondary-900 text-sm font-medium mb-2 flex items-center">
                <Calendar className="mr-2 text-primary-500" size={16} />
                {locale === 'en' ? 'Travel Date' : 'تاريخ السفر'}
              </label>
              {isClient && (
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              )}
            </div>

            {/* Travelers */}
            <div>
              <label className=" text-secondary-900 text-sm font-medium mb-2 flex items-center">
                <Users className="mr-2 text-primary-500" size={16} />
                {locale === 'en' ? '# Of Travelers' : 'عدد المسافرين'}
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
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
              <label className=" text-secondary-900 text-sm font-medium mb-2 flex items-center">
                <GraduationCap className="mr-2 text-primary-500" size={16} />
                {locale === 'en' ? 'Guide Expertise' : 'خبرة المرشد'}
              </label>
              <select
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
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
              <label className=" text-secondary-900 text-sm font-medium mb-2 flex items-center">
                <Languages className="mr-2 text-primary-500" size={16} />
                {locale === 'en' ? 'Languages' : 'اللغات'}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
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
            <div className="md:col-span-2 lg:col-span-4 mt-2">
              <Button 
                type="submit" 
                className="w-full py-3 text-lg font-semibold"
                variant="primary"
                icon={<Search />}
              >
                {locale === 'en' ? 'Search Tours' : 'البحث عن الجولات'}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Mobile Quiz Button */}
        {/* <div className="md:hidden text-center mt-4">
          <Button 
            href={`/${locale}/guides`} 
            size="lg" 
            variant="secondary"
            className="font-bold bg-white text-black shadow-lg"
          >
            {locale === 'en' ? 'Our Guides' : 'المرشدين'}
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default HeroSection; 