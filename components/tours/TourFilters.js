'use client';
import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function TourFilters({ locale, initialFilters = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    location: initialFilters.location ? 
      (Array.isArray(initialFilters.location) ? initialFilters.location : [initialFilters.location]) 
      : [],
    duration: initialFilters.duration || '',
    expertise: initialFilters.expertise || '',
    language: initialFilters.language || '',
    travelers: initialFilters.travelers || '',
    pricePer: initialFilters.pricePer || '',
    priceRange: initialFilters.priceRange || '',
  });

  // Track input value separately from filters state
  const [searchInput, setSearchInput] = useState(initialFilters.search || '');
  
  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  
  // Location options
  const locationOptions = [
    { value: '', label: locale === 'en' ? 'All Locations' : 'جميع المواقع' },
    { value: 'jerusalem', label: locale === 'en' ? 'Jerusalem' : 'القدس' },
    { value: 'jaffa', label: locale === 'en' ? 'Jaffa (Tel Aviv)' : 'يافا (تل أبيب)' },
    { value: 'Dead Sea', label: locale === 'en' ? 'Dead Sea' : 'البحر الميت' },
    { value: 'tiberias', label: locale === 'en' ? 'Tiberias and Lake of Galilee' : 'طبريا وبحيرة الجليل' },
    { value: 'eilat', label: locale === 'en' ? 'Umm al-Rashrash (Eilat)' : 'أم الرشراش (إيلات)' },
    { value: 'masada', label: locale === 'en' ? 'Masada' : 'مسادا' },
    { value: 'haifa', label: locale === 'en' ? 'Haifa' : 'حيفا' },
    { value: 'nazareth', label: locale === 'en' ? 'Nazareth' : 'الناصرة' },
    { value: 'akko', label: locale === 'en' ? 'Akka (Acre/Akko)' : 'عكا' },
    { value: 'eingedi', label: locale === 'en' ? 'Ein Gedi' : 'عين جدي' },
    { value: 'jordanriver', label: locale === 'en' ? 'Jordan River' : 'نهر الأردن' },
    { value: 'qumran', label: locale === 'en' ? 'Qumran' : 'قمران' },
    { value: 'banias', label: locale === 'en' ? 'Banias' : 'بانياس' },
    { value: 'caesarea', label: locale === 'en' ? 'Caesarea' : 'قيسارية' },
    { value: 'golan', label: locale === 'en' ? 'Golan' : 'الجولان' },
    { value: 'negev', label: locale === 'en' ? 'Naqab (Negev Desert)' : 'النقب' },
    { value: 'beersheba', label: locale === 'en' ? 'Beersheba' : 'بئر السبع' },
    { value: 'ashkelon', label: locale === 'en' ? 'Ascalon (Ashkelon)' : 'عسقلان' },
    { value: 'safed', label: locale === 'en' ? 'Safed' : 'صفد' },
    { value: 'kufrKana', label: locale === 'en' ? 'Kufr Kana' : 'كفر كنا' },
    { value: 'bethlehem', label: locale === 'en' ? 'Bethlehem' : 'بيت لحم' },
    { value: 'hebron', label: locale === 'en' ? 'Hebron' : 'الخليل' },
    { value: 'jericho', label: locale === 'en' ? 'Jericho' : 'أريحا' },
    { value: 'ramallah', label: locale === 'en' ? 'Ramallah' : 'رام الله' },
    { value: 'nablus', label: locale === 'en' ? 'Nablus' : 'نابلس' },
    { value: 'jenin', label: locale === 'en' ? 'Jenin' : 'جنين' },
    { value: 'taybeh', label: locale === 'en' ? 'Taybeh' : 'الطيبة' },
    
  ];
  
  // Duration options
  const durationOptions = [
    { value: '', label: locale === 'en' ? 'Any Duration' : 'أي مدة' },
    { value: '1', label: locale === 'en' ? '1 Day' : 'يوم واحد' },
    { value: '2', label: locale === 'en' ? '2 Days' : 'يومان' },
    { value: '3', label: locale === 'en' ? '3 Days' : '3 أيام' },
    { value: '4', label: locale === 'en' ? '4 Days' : '4 أيام' },
    { value: '5', label: locale === 'en' ? '5 Days' : '5 أيام' },
    { value: '6', label: locale === 'en' ? '6 Days' : '6 أيام' },
    { value: '7', label: locale === 'en' ? '7 Days' : '7 أيام' },
    { value: '8', label: locale === 'en' ? '8 Days' : '8 أيام' },
    { value: '9', label: locale === 'en' ? '9 Days' : '9 أيام' },
    { value: '10', label: locale === 'en' ? '10 Days' : '10 أيام' },
    { value: '11', label: locale === 'en' ? '11 Days' : '11 أيام' },
    { value: '12', label: locale === 'en' ? '12 Days' : '12 أيام' },
    { value: '13', label: locale === 'en' ? '13 Days' : '13 أيام' },
    { value: '14', label: locale === 'en' ? '14 Days' : '14 أيام' },
    { value: '15', label: locale === 'en' ? '15+ Days' : '15+ أيام' },
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
    { value: '500-750', label: '$500 - $750' },
    { value: '750-1000', label: '$750 - $1,000' },
    { value: '1000-1500', label: '$1,000 - $1,500' },
    { value: '1500-2000', label: '$1,500 - $2,000' },
    { value: '2000-3000', label: '$2,000 - $3,000' },
    { value: '3000+', label: '$3,000+' },
  ];
  
  // Create query string from filters
  const createQueryString = (params) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          value.forEach(val => {
            if (val) searchParams.append(key, val);
          });
        }
      } else if (value) {
        searchParams.set(key, value);
      }
    });
    
    return searchParams.toString();
  };

  // Apply filters - updates URL and triggers page refresh
  const applyFilters = useCallback((updatedFilters) => {
    const queryString = createQueryString(updatedFilters);
    startTransition(() => {
      router.push(`${pathname}?${queryString}`);
    });
  }, [pathname, router]);

  // Handle search input change - just update the input value, don't apply filters yet
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };
  
  // Check if input is a location name
  const findLocationMatch = (input) => {
    if (!input) return null;
    const searchTerm = input.trim().toLowerCase();
    
    // Try exact match first
    let match = locationOptions.find(loc => 
      loc.value.toLowerCase() === searchTerm ||
      loc.label.toLowerCase() === searchTerm
    );
    
    // Then try partial matches
    if (!match) {
      match = locationOptions.find(loc => 
        loc.value.toLowerCase().includes(searchTerm) ||
        loc.label.toLowerCase().includes(searchTerm)
      );
    }
    
    return match;
  };
  
  // Process search - called when search button is clicked
  const processSearch = () => {
    if (!searchInput.trim()) {
      return; // No search input provided
    }
    
    const updatedFilters = { ...filters };
    updatedFilters.search = searchInput.trim();
    
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };
  
  // Handle location checkbox toggle
  const handleLocationToggle = (locationValue) => {
    let updatedLocations;
    
    if (filters.location.includes(locationValue)) {
      // Remove location if already selected
      updatedLocations = filters.location.filter(loc => loc !== locationValue);
    } else {
      // Add location if not selected
      updatedLocations = [...filters.location, locationValue];
    }
    
    const updatedFilters = { ...filters, location: updatedLocations };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };
  
  // Handle non-search filter changes
  const handleFilterChange = (name, value) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };
  
  // Handle price range change
  const handlePriceRangeChange = (range, min, max) => {
    const updatedFilters = {
      ...filters,
      priceRange: range,
      minPrice: min,
      maxPrice: max
    };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };
  
  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      location: [],
      duration: '',
      expertise: '',
      language: '',
      travelers: '',
      pricePer: '',
      minPrice: '',
      maxPrice: '',
      priceRange: '',
    };
    setSearchInput('');
    setFilters(emptyFilters);
    applyFilters(emptyFilters);
  };
  
  // Location Filter with custom dropdown and checkboxes
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // Toggle location dropdown
  const toggleLocationDropdown = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLocationDropdownOpen && !event.target.closest('#location-dropdown-container')) {
        setIsLocationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLocationDropdownOpen]);

  // Close location dropdown when submitting form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Process the search input first
    if (searchInput.trim() !== '') {
      processSearch();
    } else {
      // If search input is empty, just apply the current filters
      applyFilters(filters);
    }
    
    // Close location dropdown
    setIsLocationDropdownOpen(false);
    
    // On mobile, collapse the filter after submission
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
  };

  // Function to get text for selected locations
  const getSelectedLocationsText = () => {
    if (filters.location.length === 0) {
      return locale === 'en' ? 'All Locations' : 'جميع المواقع';
    }
    
    if (filters.location.length === 1) {
      const selectedOption = locationOptions.find(option => option.value === filters.location[0]);
      return selectedOption ? selectedOption.label : locale === 'en' ? 'All Locations' : 'جميع المواقع';
    }
    
    return `${filters.location.length} ${locale === 'en' ? 'locations selected' : 'مواقع مختارة'}`;
  };
  
  // Update filter initialization from URL
  useEffect(() => {
    if (!searchParams) return;
    
    // Extract filters from URL
    const urlFilters = {
      search: searchParams.get('search') || '',
      location: [], // Initialize as empty array
      duration: searchParams.get('duration') || '',
      expertise: searchParams.get('expertise') || '',
      language: searchParams.get('language') || '',
      travelers: searchParams.get('travelers') || '',
      priceRange: searchParams.get('priceRange') || ''
    };
    
    // Handle location specially since it can have multiple values
    const locationParams = searchParams.getAll('location');
    if (locationParams && locationParams.length > 0) {
      urlFilters.location = locationParams.filter(Boolean); // Filter out empty values
    }

    // Only update if filters actually changed to prevent infinite loop
    const hasChanged = Object.keys(urlFilters).some(key => {
      if (key === 'location') {
        // Compare arrays
        const current = filters.location || [];
        const fromUrl = urlFilters.location || [];
        if (current.length !== fromUrl.length) return true;
        return current.some(val => !fromUrl.includes(val)) || fromUrl.some(val => !current.includes(val));
      }
      return filters[key] !== urlFilters[key];
    });

    if (hasChanged) {
      console.log('Updating filters from URL:', urlFilters);
      setFilters(urlFilters);
      
      // Also update the search input if search filter is applied
      if (urlFilters.search && urlFilters.search !== searchInput) {
        setSearchInput(urlFilters.search);
      }
    }
  }, [searchParams]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm mb-8">
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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          {/* Search Input - Full width at the top */}
          <div className="col-span-1 md:col-span-3">
            <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Search tours' : 'البحث عن الجولات'}
            </label>
            <div className="flex items-stretch">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder={locale === 'en' ? 'Search by tour name, guide or location...' : 'البحث حسب اسم الجولة، المرشد، أو الموقع...'}
                  className="w-full pl-10 px-3 py-2 border border-secondary-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="rounded-l-none px-4"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></span>
                ) : (
                  locale === 'en' ? 'Search' : 'بحث'
                )}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {locale === 'en' 
                ? 'Tip: If you search for a location name, we\'ll auto-filter by that location' 
                : 'نصيحة: إذا بحثت عن اسم موقع، سنقوم بتصفية تلقائية حسب ذلك الموقع'}
            </p>
            
            {/* Show visual indication if location filters are active */}
            {filters.location.length > 0 && (
              <div className="mt-2 text-sm text-primary-600">
                <span className="font-medium">
                  {locale === 'en' 
                    ? `Filtering by ${filters.location.length > 1 ? 'locations' : 'location'}: ` 
                    : `تصفية حسب ${filters.location.length > 1 ? 'المواقع' : 'الموقع'}: `}
                </span>
                <span>
                  {filters.location.map((locValue, index) => {
                    const label = locationOptions.find(o => o.value === locValue)?.label || locValue;
                    return (
                      <span key={locValue}>
                        {label}
                        {index < filters.location.length - 1 ? ', ' : ''}
                      </span>
                    );
                  })}
                </span>
                {filters.location.length > 1 && (
                  <div className="mt-1 text-xs text-gray-600">
                    {locale === 'en' 
                      ? 'Showing tours that include ALL selected locations' 
                      : 'عرض الجولات التي تشمل جميع المواقع المحددة'}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Filter */}
            <div id="location-dropdown-container" className="relative" style={{ zIndex: 100 }}>
              <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Locations (select multiple)' : 'المواقع (يمكن اختيار أكثر من موقع)'}
              </label>
              <button
                type="button"
                onClick={toggleLocationDropdown}
                className="w-full flex items-center justify-between bg-white border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                aria-expanded={isLocationDropdownOpen}
                aria-haspopup="listbox"
              >
                <span className={`block truncate ${filters.location.length === 0 ? 'text-black' : 'text-gray-900'}`}>
                  {getSelectedLocationsText()}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute z-[1000] mt-1 w-full rounded-md bg-white shadow-xl border border-gray-200">
                  <div className="p-2">
                    <div className="px-2 py-2 mb-2 text-xs text-gray-600 border-b border-gray-100">
                      {locale === 'en' 
                        ? 'Select multiple locations to find tours that include ALL of them' 
                        : 'حدد مواقع متعددة للعثور على الجولات التي تشمل جميعها'}
                    </div>
                    {/* All Locations option */}
                    <div 
                      className="flex  items-center px-2 py-2 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100 mb-1"
                      onClick={() => {
                        const updatedFilters = {...filters, location: []};
                        setFilters(updatedFilters);
                        applyFilters(updatedFilters);
                        setIsLocationDropdownOpen(false);
                      }}
                    >
                      <span className={`text-black block text-sm ${filters.location.length === 0 ? 'font-medium' : ''}`}>
                        {locale === 'en' ? 'All Locations' : 'جميع المواقع'}
                      </span>
                    </div>
                    
                    {/* Container for location options with single scrollbar */}
                    <div className="max-h-60 overflow-y-auto py-1">
                      {/* Individual location options */}
                      {locationOptions.slice(1).map((option) => (
                        <div 
                          key={option.value} 
                          className="flex items-center px-2 py-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => handleLocationToggle(option.value)}
                        >
                          <input
                            type="checkbox"
                            id={`location-${option.value}`}
                            checked={filters.location.includes(option.value)}
                            onChange={() => {}} // Handle the change in the onClick handler of the parent div
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label 
                            htmlFor={`location-${option.value}`} 
                            className="ml-2 block text-sm w-full cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {filters.location.length > 0 && (
                    <div className="border-t border-gray-200 p-2 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedFilters = {...filters, location: []};
                          setFilters(updatedFilters);
                          applyFilters(updatedFilters);
                          setIsLocationDropdownOpen(false);
                        }}
                        className="w-full text-center py-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {locale === 'en' ? 'Clear selections' : 'مسح الاختيارات'}
                      </button>
                    </div>
                  )}
                </div>
              )}
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
            
            {/* Expertise (Tour Type) Filter */}
            <div>
              <label htmlFor="expertise" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Expertise' : 'الخبرة'}
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
                {locale === 'en' ? 'Travelers' : 'المسافرون'}
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

            {/* Price Per Filter */}
            <div>
              <label htmlFor="pricePer" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Price Per' : 'السعر لكل'}
              </label>
              <select
                id="pricePer"
                name="pricePer"
                value={filters.pricePer}
                onChange={(e) => handleFilterChange('pricePer', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{locale === 'en' ? 'Any' : 'أي'}</option>
                <option value="person">{locale === 'en' ? 'Per person' : 'للفرد'}</option>
                <option value="group">{locale === 'en' ? 'Per group' : 'للمجموعة'}</option>
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
                  // Extract min and max values from the range
                  const range = e.target.value;
                  let min = '', max = '';
                  
                  if (range) {
                    if (range.includes('-')) {
                      [min, max] = range.split('-');
                    } else if (range.includes('+')) {
                      min = range.replace('+', '');
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
          </div>
          
          {/* Action Buttons - Apply Filters & Clear Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <span className="w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span>
                  {locale === 'en' ? 'Applying...' : 'جاري التطبيق...'}
                </span>
              ) : (
                locale === 'en' ? 'Apply Filters' : 'تطبيق الفلاتر'
              )}
            </Button>
            
            {/* Clear Filters Button - Only show on mobile if filters are active */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 md:hidden flex items-center justify-center"
                onClick={clearFilters}
                disabled={isPending}
              >
                <X size={16} className="mr-1" />
                {locale === 'en' ? 'Clear Filters' : 'مسح الفلاتر'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}