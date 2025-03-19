'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function TourFilters({ locale, initialFilters = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    location: initialFilters.location || '',
    duration: initialFilters.duration || '',
    expertise: initialFilters.expertise || '', // Changed from type to expertise
    language: initialFilters.language || '',
    travelers: initialFilters.travelers || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    priceRange: initialFilters.priceRange || '',
  });
  
  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  
  // Location options
  const locationOptions = [
    { value: '', label: locale === 'en' ? 'All Locations' : 'جميع المواقع' },
    { value: 'telaviv', label: locale === 'en' ? 'Tel Aviv' : 'تل أبيب' },
    { value: 'nazareth', label: locale === 'en' ? 'Nazareth' : 'الناصرة' },
    { value: 'bethlehem', label: locale === 'en' ? 'Bethlehem' : 'بيت لحم' },
    { value: 'jerusalem', label: locale === 'en' ? 'Jerusalem' : 'القدس' },
    { value: 'deadsea', label: locale === 'en' ? 'Dead Sea' : 'البحر الميت' },
  ];
  
  // Duration options
  const durationOptions = [
    { value: '', label: locale === 'en' ? 'Any Duration' : 'أي مدة' },
    { value: '1', label: locale === 'en' ? '1 Day' : 'يوم واحد' },
    { value: '2', label: locale === 'en' ? '2 Days' : 'يومان' },
    { value: '3', label: locale === 'en' ? '3 Days' : '3 أيام' },
    { value: '4', label: locale === 'en' ? '4 Days' : '4 أيام' },
    { value: '5', label: locale === 'en' ? '5+ Days' : '5+ أيام' },
  ];
  
  // Expertise options (previously Tour type options)
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
  
  // Language options
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
  
  // Travelers options
  const travelersOptions = [
    { value: '', label: locale === 'en' ? 'Any Size' : 'أي حجم' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
    { value: '11+', label: locale === 'en' ? '11+' : '+11' },
  ];
  
  // Price range options
  const priceRangeOptions = [
    { value: '', label: locale === 'en' ? 'Any Price' : 'أي سعر' },
    { value: '0-100', label: '$0 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200-300', label: '$200 - $300' },
    { value: '300-500', label: '$300 - $500' },
    { value: '500+', label: '$500+' },
  ];
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new URLSearchParams object
    const params = new URLSearchParams();
    
    // Add all non-empty filters to the params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    // Navigate to the tours page with the filters
    router.push(`${pathname}?${params.toString()}`);
    
    // On mobile, collapse the filter after submission
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle price range change
  const handlePriceRangeChange = (range, min, max) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range,
      minPrice: min,
      maxPrice: max
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      location: '',
      duration: '',
      expertise: '', // Changed from type to expertise
      language: '',
      travelers: '',
      minPrice: '',
      maxPrice: '',
      priceRange: '',
    });
    
    router.push(pathname);
  };
  
  // Initialize filters from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters = { ...filters };
    
    // Update filters from URL params
    for (const [key, value] of params.entries()) {
      if (key in newFilters) {
        newFilters[key] = value;
      }
    }
    
    setFilters(newFilters);
  }, [searchParams]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
      {/* Mobile Header - Clickable to expand/collapse */}
      <div 
        className="md:hidden p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold text-secondary-900">
          {locale === 'en' ? 'Filter Tours' : 'تصفية الجولات'}
        </h2>
        <div className="flex items-center">
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
              {locale === 'en' ? 'Filters Applied' : 'تم تطبيق الفلاتر'}
            </span>
          )}
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-secondary-900">
          {locale === 'en' ? 'Filter Tours' : 'تصفية الجولات'}
        </h2>
        
        {/* Clear Filters Button - Only show if filters are active */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
          >
            <X size={16} className="mr-1" />
            {locale === 'en' ? 'Clear Filters' : 'مسح الفلاتر'}
          </button>
        )}
      </div>
      
      {/* Filter Form - Visible on desktop or when expanded on mobile */}
      <div className={`${isExpanded || 'md:block hidden'} p-4`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Filter */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Location' : 'الموقع'}
            </label>
            <select
              id="location"
              name="location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Duration Filter */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Duration' : 'المدة'}
            </label>
            <select
              id="duration"
              name="duration"
              value={filters.duration}
              onChange={(e) => handleFilterChange('duration', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Expertise Filter (previously Tour Type) */}
          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Tour Guide Expertise' : 'خبرة المرشد'}
            </label>
            <select
              id="expertise"
              name="expertise"
              value={filters.expertise}
              onChange={(e) => handleFilterChange('expertise', e.target.value)}
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
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Travelers Filter */}
          <div>
            <label htmlFor="travelers" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Travelers' : 'المسافرين'}
            </label>
            <select
              id="travelers"
              name="travelers"
              value={filters.travelers}
              onChange={(e) => handleFilterChange('travelers', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {travelersOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <label htmlFor="priceRange" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Price Range' : 'نطاق السعر'}
            </label>
            <select
              id="priceRange"
              name="priceRange"
              value={filters.priceRange}
              onChange={(e) => {
                const range = e.target.value;
                let min = '';
                let max = '';
                
                if (range) {
                  if (range === '500+') {
                    min = '500';
                    max = '10000'; // Some high value
                  } else {
                    [min, max] = range.split('-');
                  }
                }
                
                handlePriceRangeChange(range, min, max);
              }}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {priceRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Submit and Clear Buttons */}
          <div className="md:col-span-3 mt-2 flex space-x-2">
            <Button type="submit" className="flex-1 md:flex-none md:w-auto">
              {locale === 'en' ? 'Apply Filters' : 'تطبيق الفلاتر'}
            </Button>
            
            {/* Clear button - Only show if filters are active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 md:flex-none md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors text-center"
              >
                {locale === 'en' ? 'Clear' : 'مسح'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}