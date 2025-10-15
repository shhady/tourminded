'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import Image from 'next/image';
import { Search, Users, GraduationCap, Languages, ChevronDown } from 'lucide-react';
import TravelerCounter from './TravelerCounter.js';
import TravelDatesDropdown from '../ui/TravelDatesDropdown';
import { MdOutlineTravelExplore } from "react-icons/md";

const HeroSection = ({ locale }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [travelers, setTravelers] = useState(0);
  const [travelerCounts, setTravelerCounts] = useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0
  });
  const [hasServiceAnimal, setHasServiceAnimal] = useState(false);
  const [expertise, setExpertise] = useState('');
  const [language, setLanguage] = useState('');
  const [travelDates, setTravelDates] = useState('');
  const [currentBg, setCurrentBg] = useState(0);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTravelerCounter, setShowTravelerCounter] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  
  // Ref for handling click outside
  const travelerDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

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
    
    // Add click outside listener
    const handleClickOutside = (event) => {
      if (travelerDropdownRef.current && !travelerDropdownRef.current.contains(event.target)) {
        setShowTravelerCounter(false);
      }
      // Only close language dropdown if click is outside the WHOLE dropdown (including input and options)
      if (
        showLanguageDropdown &&
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setShowLanguageDropdown(false);
        setLanguageSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [bgImages.length, showLanguageDropdown]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Create a URLSearchParams object to build the query string
    const searchParams = new URLSearchParams();
    
    // Use the same parameter names as in the TourFilters component
    if (travelers) {
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
    
    if (hasServiceAnimal) {
      searchParams.append('serviceAnimal', 'true');
      console.log('Adding service animal');
    }
    
    if (travelDates) {
      searchParams.append('travelDates', travelDates);
      console.log('Adding travel dates:', travelDates);
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

  const handleTravelerChange = (total, counts, serviceAnimal) => {
    setTravelers(total);
    setTravelerCounts(counts);
    setHasServiceAnimal(serviceAnimal);
  };

  const toggleTravelerCounter = (e) => {
    e.stopPropagation();
    setShowTravelerCounter(!showTravelerCounter);
  };

  const toggleLanguageDropdown = (e) => {
    e.stopPropagation();
    setShowLanguageDropdown(!showLanguageDropdown);
    if (!showLanguageDropdown) {
      setLanguageSearchTerm('');
    }
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageDropdown(false);
    setLanguageSearchTerm('');
  };

  // Get summary text for travelers
  const getTravelersText = () => {
    if (travelers === 0) {
      return locale === 'en' ? 'Add travelers' : 'إضافة مسافرين';
    }
    
    // Simply return the total number of travelers
    return `${travelers} ${locale === 'en' ? 'traveler' : 'مسافر'}${travelers !== 1 && locale === 'en' ? 's' : ''}`;
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
      { value: 'Arabic', label: locale === 'en' ? 'Arabic' : 'العربية' },
    { value: 'Belarusian', label: locale === 'en' ? 'Belarusian' : 'البيلاروسية' },
    { value: 'Czech', label: locale === 'en' ? 'Czech' : 'التشيكية' },
    { value: 'Danish', label: locale === 'en' ? 'Danish' : 'الدنماركية' },
    { value: 'Dutch', label: locale === 'en' ? 'Dutch' : 'الهولندية' },
    { value: 'English', label: locale === 'en' ? 'English' : 'الإنجليزية' },
    { value: 'Filipino', label: locale === 'en' ? 'Filipino' : 'الفلبينية' },
    { value: 'Finnish', label: locale === 'en' ? 'Finnish' : 'الفنلندية' },
    { value: 'French', label: locale === 'en' ? 'French' : 'الفرنسية' },
    { value: 'German', label: locale === 'en' ? 'German' : 'الألمانية' },
    { value: 'Greek', label: locale === 'en' ? 'Greek' : 'اليونانية' },
    { value: 'Hebrew', label: locale === 'en' ? 'Hebrew' : 'العبرية' },
    { value: 'Hindi', label: locale === 'en' ? 'Hindi' : 'الهندية' },
    { value: 'Hungarian', label: locale === 'en' ? 'Hungarian' : 'المجرية' },
    { value: 'Italian', label: locale === 'en' ? 'Italian' : 'الإيطالية' },
    { value: 'Japanese', label: locale === 'en' ? 'Japanese' : 'اليابانية' },
    { value: 'Kazakh', label: locale === 'en' ? 'Kazakh' : 'الكازاخية' },
    { value: 'Korean', label: locale === 'en' ? 'Korean' : 'الكورية' },
    { value: 'Latvian', label: locale === 'en' ? 'Latvian' : 'اللاتفية' },
    { value: 'Lithuanian', label: locale === 'en' ? 'Lithuanian' : 'الليتوانية' },
    { value: 'Malay', label: locale === 'en' ? 'Malay' : 'الملايو' },
    { value: 'Mandarin Chinese', label: locale === 'en' ? 'Mandarin Chinese' : 'الصينية الماندرين' },
    { value: 'Norwegian', label: locale === 'en' ? 'Norwegian' : 'النرويجية' },
    { value: 'Polish', label: locale === 'en' ? 'Polish' : 'البولندية' },
    { value: 'Portuguese', label: locale === 'en' ? 'Portuguese' : 'البرتغالية' },
    { value: 'Romanian', label: locale === 'en' ? 'Romanian' : 'الرومانية' },
    { value: 'Russian', label: locale === 'en' ? 'Russian' : 'الروسية' },
    { value: 'Slovak', label: locale === 'en' ? 'Slovak' : 'السلوفاكية' },
    { value: 'Spanish', label: locale === 'en' ? 'Spanish' : 'الإسبانية' },
    { value: 'Swedish', label: locale === 'en' ? 'Swedish' : 'السويدية' },
    { value: 'Turkish', label: locale === 'en' ? 'Turkish' : 'التركية' },
    { value: 'Ukrainian', label: locale === 'en' ? 'Ukrainian' : 'الأوكرانية' },
  ];

  // Filter languages based on search term
  const filteredLanguages = languageOptions.filter(lang =>
    lang.label.toLowerCase().includes(languageSearchTerm.toLowerCase())
  );

  // Get selected language label
  const selectedLanguage = languageOptions.find(lang => lang.value === language);

  return (
    <div className="relative min-h-[550px] sm:min-h-[650px] md:min-h-[80vh]">
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
              sizes='100vw'
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
      <div className="container mx-auto px-4 py-10 h-full flex flex-col justify-between items-center relative z-20 max-w-6xl">
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
        <div className="md:hidden bg-white/90 backdrop-blur-sm rounded-xl shadow-lg mb-4 animate-fade-in">
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
                  <label className="text-gray-800 text-sm font-medium mb-1 block">
                    {locale === 'en' ? 'Number of Travelers' : 'عدد المسافرين'}
                  </label>
                  <div className="relative" ref={travelerDropdownRef}>
                    <button
                      type="button"
                      onClick={toggleTravelerCounter}
                      className={`w-full py-2 px-3 border border-gray-200 rounded-lg text-gray-800 flex justify-between items-center bg-white hover:border-primary-300 transition-colors ${showTravelerCounter ? 'border-primary-400 ring-1 ring-primary-300' : ''}`}
                    >
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-primary-600 mr-2" />
                        <span className="text-sm">
                          {getTravelersText()}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTravelerCounter ? 'rotate-180' : ''}`} />
                    </button>

                    {hasServiceAnimal && travelers > 0 && (
                      <div className="flex items-center mt-1 ml-2 text-primary-600 text-xs">
                        <span>+ {locale === 'en' ? 'Service animal' : 'حيوان خدمة'}</span>
                      </div>
                    )}

                    {showTravelerCounter && (
                      <div className="absolute top-full left-0 z-50 shadow-xl rounded-lg w-full max-w-md bg-white">
                        <TravelerCounter 
                          onChange={handleTravelerChange} 
                          locale={locale} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Travel Dates */}
                <TravelDatesDropdown
                  value={travelDates}
                  onChange={setTravelDates}
                  locale={locale}
                />

                {/* Expertise */}
                <div>
                  <label className="text-gray-800 text-sm font-medium mb-1 block">
                    {locale === 'en' ? 'Tour Type' : 'نوع الجولة'}
                  </label>
                  <select
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    className={`${locale === "en" ? "":"pr-8"} w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white hover:border-primary-300 transition-colors`}
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
                  <label className="text-gray-800 text-sm font-medium mb-1 block">
                    {locale === 'en' ? 'Languages' : 'اللغات'}
                  </label>
                  <div className="relative" ref={languageDropdownRef} tabIndex={-1}>
                    <button
                      type="button"
                      onClick={toggleLanguageDropdown}
                      className={`w-full py-2 px-3 border border-gray-200 rounded-lg text-gray-800 flex justify-between items-center bg-white hover:border-primary-300 transition-colors ${showLanguageDropdown ? 'border-primary-400 ring-1 ring-primary-300' : ''}`}
                    >
                      <div className="flex items-center">
                        <span className="text-sm">
                          {selectedLanguage ? selectedLanguage.label : 'Select Language'}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showLanguageDropdown && (
                      <div className="absolute top-full left-0 z-50 shadow-xl rounded-lg w-full max-w-md bg-white">
                        <input
                          type="text"
                          value={languageSearchTerm}
                          onChange={(e) => setLanguageSearchTerm(e.target.value)}
                          placeholder="Search languages"
                          className="w-full py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <div className="mt-2 max-h-[200px] overflow-y-auto">
                          {filteredLanguages.map((lang) => (
                            <div
                              key={lang.value}
                              className="py-1 px-3 cursor-pointer hover:bg-primary-100 bg-white"
                              onMouseDown={() => handleLanguageSelect(lang.value)}
                            >
                              {lang.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
        <div className="hidden md:block bg-white/70 rounded-xl shadow-lg p-6 max-w-5xl mx-auto animate-fade-in">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Travelers */}
            <div className="relative">
              <label className="text-gray-800 text-sm font-medium mb-2 flex items-center">
                <Users className="text-primary-600 mr-2" size={16} />
                <span>{locale === 'en' ? 'Number of Travelers' : 'عدد المسافرين'}</span>
              </label>
              <div className="relative" ref={travelerDropdownRef}>
                <button
                  type="button"
                  onClick={toggleTravelerCounter}
                  className={`w-full py-3 px-4 border border-gray-200 rounded-lg text-gray-800 flex justify-between items-center bg-white hover:border-primary-300 transition-colors ${showTravelerCounter ? 'border-primary-400 ring-1 ring-primary-300' : ''}`}
                >
                  <div className="flex items-center">
                    <span>
                      {getTravelersText()}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTravelerCounter ? 'rotate-180' : ''}`} />
                </button>

                {hasServiceAnimal && travelers > 0 && (
                  <div className="flex items-center mt-1 ml-2 text-primary-600 text-sm">
                    <span>+ {locale === 'en' ? 'Service animal' : 'حيوان خدمة'}</span>
                  </div>
                )}

                {showTravelerCounter && (
                  <div className="absolute top-full left-0 mt-1 z-50 shadow-xl rounded-lg bg-white" style={{ width: '320px' }}>
                    <TravelerCounter 
                      onChange={handleTravelerChange} 
                      locale={locale} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Travel Dates */}
            <TravelDatesDropdown
              value={travelDates}
              onChange={setTravelDates}
              locale={locale}
            />

            {/* Expertise */}
            <div>
              <label className="text-gray-800 text-sm font-medium mb-2 flex items-center">
                <MdOutlineTravelExplore className="text-primary-600 mr-2" size={16} />
                <span>{locale === 'en' ? 'Tour Type' : 'نوع الجولة'}</span>
              </label>
              <select
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className={`${locale === "en" ? "":"pr-8"} w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white hover:border-primary-300 transition-colors`}
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
              <label className="text-gray-800 text-sm font-medium mb-2 flex items-center">
                <Languages className="text-primary-600 mr-2" size={16} />
                <span>{locale === 'en' ? 'Languages' : 'اللغات'}</span>
              </label>
              <div className="relative" ref={languageDropdownRef} tabIndex={-1}>
                <button
                  type="button"
                  onClick={toggleLanguageDropdown}
                  className={`w-full py-3 px-4 border border-gray-200 rounded-lg text-gray-800 flex justify-between items-center bg-white hover:border-primary-300 transition-colors ${showLanguageDropdown ? 'border-primary-400 ring-1 ring-primary-300' : ''}`}
                >
                  <div className="flex items-center">
                    <span>
                      {selectedLanguage ? selectedLanguage.label : 'Select Language'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 mt-1 z-50 shadow-xl rounded-lg bg-white" style={{ width: '320px' }}>
                    <input
                      type="text"
                      value={languageSearchTerm}
                      onChange={(e) => setLanguageSearchTerm(e.target.value)}
                      placeholder="Search languages"
                      className="w-full py-2 px-3 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="mt-2 max-h-[200px] overflow-y-auto">
                      {filteredLanguages.map((lang) => (
                        <div
                          key={lang.value}
                          className="py-1 px-3 cursor-pointer hover:bg-primary-100"
                          onMouseDown={() => handleLanguageSelect(lang.value)}
                        >
                          {lang.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-4 mt-1">
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