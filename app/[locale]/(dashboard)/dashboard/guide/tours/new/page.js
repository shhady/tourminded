'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { Loader, Plus, Minus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useGuide } from '@/contexts/GuideContext';

export default function NewTourPage({ params }) {
  const localeParams = React.use(params);
  const locale = localeParams?.locale || 'en';
  const router = useRouter();
  
  const { user } = useUser();
  const { guide } = useGuide();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [guideLanguages, setGuideLanguages] = useState([]);
  const [tourPlan, setTourPlan] = useState([]);
  const [includesItems, setIncludesItems] = useState(['']);
  
  // Hardcoded locations in Palestine and Israel
  const locations = [
    { _id: 'jerusalem', name: { en: 'Jerusalem', ar: 'القدس' } },
    { _id: 'bethlehem', name: { en: 'Bethlehem', ar: 'بيت لحم' } },
    { _id: 'nazareth', name: { en: 'Nazareth', ar: 'الناصرة' } },
    { _id: 'telaviv', name: { en: 'Tel Aviv', ar: 'تل أبيب' } },
    { _id: 'haifa', name: { en: 'Haifa', ar: 'حيفا' } },
    { _id: 'jericho', name: { en: 'Jericho', ar: 'أريحا' } },
    { _id: 'hebron', name: { en: 'Hebron', ar: 'الخليل' } },
    { _id: 'ramallah', name: { en: 'Ramallah', ar: 'رام الله' } },
    { _id: 'nablus', name: { en: 'Nablus', ar: 'نابلس' } },
    { _id: 'jenin', name: { en: 'Jenin', ar: 'جنين' } },
    { _id: 'akko', name: { en: 'Acre', ar: 'عكا' } },
    { _id: 'tiberias', name: { en: 'Tiberias', ar: 'طبريا' } },
    { _id: 'deadsea', name: { en: 'Dead Sea', ar: 'البحر الميت' } },
    { _id: 'masada', name: { en: 'Masada', ar: 'مسادا' } },
    { _id: 'eilat', name: { en: 'Eilat', ar: 'إيلات' } },
  ];
  
  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();
  
  // Watch duration and durationUnit to update tour plan
  const duration = watch('duration');
  const durationUnit = watch('durationUnit');
  
  // Update tour plan when duration or unit changes
  useEffect(() => {
    if (duration && durationUnit === 'days' && Math.floor(duration) > 0) {
      const days = Math.floor(duration);
      const newTourPlan = [];
      
      for (let i = 1; i <= days; i++) {
        const existingDay = tourPlan.find(day => day.day === i);
        newTourPlan.push({
          day: i,
          title: {
            en: existingDay?.title?.en || '',
            ar: existingDay?.title?.ar || ''
          },
          content: {
            en: existingDay?.content?.en || '',
            ar: existingDay?.content?.ar || ''
          }
        });
      }
      
      setTourPlan(newTourPlan);
    } else {
      setTourPlan([]);
    }
  }, [duration, durationUnit]);
  
  // Handle tour plan updates
  const updateTourPlanDay = (dayIndex, field, language, value) => {
    setTourPlan(prev => {
      const updated = [...prev];
      if (!updated[dayIndex][field]) {
        updated[dayIndex][field] = {};
      }
      updated[dayIndex][field][language] = value;
      return updated;
    });
  };

  // Get the current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch current user');
        }
        
        const data = await response.json();
        setCurrentUser(data.user);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setError(error.message);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Fetch guide languages when component mounts
  useEffect(() => {
    if (guide && guide.languages && guide.languages.length > 0) {
      // Extract language names from guide's languages array for display only
      const languages = guide.languages.map(lang => lang.language).join(', ');
      setGuideLanguages(languages);
    }
  }, [guide]);
  
  const handleCoverImageUploaded = (url) => {
    setCoverImage(url);
  };
  
  const handleGalleryImageUploaded = (url) => {
    setGalleryImages([...galleryImages, url]);
  };
  
  const removeGalleryImage = (index) => {
    const newImages = [...galleryImages];
    newImages.splice(index, 1);
    setGalleryImages(newImages);
  };
  
  const handleLocationChange = (locationId) => {
    setSelectedLocations(prev => {
      if (prev.includes(locationId)) {
        return prev.filter(id => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };
  
  const addIncludesItem = () => {
    setIncludesItems([...includesItems, '']);
  };
  
  const removeIncludesItem = (index) => {
    const newItems = [...includesItems];
    newItems.splice(index, 1);
    setIncludesItems(newItems);
  };
  
  const updateIncludesItem = (index, value) => {
    const newItems = [...includesItems];
    newItems[index] = value;
    setIncludesItems(newItems);
  };
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    if (!coverImage) {
      setError(locale === 'en' ? 'Cover image is required' : 'صورة الغلاف مطلوبة');
      setIsLoading(false);
      return;
    }
    
    if (selectedLocations.length === 0) {
      setError(locale === 'en' ? 'At least one location is required' : 'مطلوب موقع واحد على الأقل');
      setIsLoading(false);
      return;
    }
    
    // Validate tour plan for multi-day tours
    if (data.durationUnit === 'days' && Math.floor(data.duration) > 0) {
      const expectedDays = Math.floor(data.duration);
      
      // Check if tour plan exists and has the correct number of days
      if (!tourPlan || tourPlan.length === 0) {
        setError(locale === 'en' ? 'Tour plan is required for multi-day tours' : 'خطة الجولة مطلوبة للجولات متعددة الأيام');
        setIsLoading(false);
        return;
      }
      
      if (tourPlan.length !== expectedDays) {
        setError(locale === 'en' ? `Tour plan must have exactly ${expectedDays} days` : `يجب أن تحتوي خطة الجولة على ${expectedDays} أيام بالضبط`);
        setIsLoading(false);
        return;
      }
      
      // Check if any day has empty content
      const hasEmptyContent = tourPlan.some(day => 
        !day.content.en.trim() || !day.content.ar.trim()
      );
      
      if (hasEmptyContent) {
        setError(locale === 'en' ? 'All daily activities must be filled in' : 'يجب ملء جميع الأنشطة اليومية');
        setIsLoading(false);
        return;
      }
    }
    
    try {
      // First check if user is authenticated
      const authCheck = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (!authCheck.ok) {
        // If not authenticated, redirect to login
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/dashboard/guide/tours/new`)}`);
        return;
      }
      
      // Get the current user data
      const userData = await authCheck.json();
      
      const tourData = {
        ...data,
        images: {
          cover: {
            url: coverImage
          },
          gallery: galleryImages.map(url => ({ url }))
        },
        // Create multilingual fields
        title: {
          en: data.titleEn,
          ar: data.titleAr || data.titleEn // Fallback to English if Arabic not provided
        },
        description: {
          en: data.descriptionEn,
          ar: data.descriptionAr || data.descriptionEn // Fallback to English if Arabic not provided
        },
        // Add tour plan for multi-day tours
        tourPlan: data.durationUnit === 'days' && Math.floor(data.duration) > 0 ? tourPlan : [],
        // Convert numeric fields
        guide: guide._id,
        price: parseFloat(data.price),
        duration: parseFloat(data.duration),
        maxGroupSize: parseInt(data.maxGroupSize),
        // Convert languages to array from guide profile
        languages: guide.languages ? guide.languages.map(lang => lang.language) : ['en'],
        // Use selected locations
        locationNames: selectedLocations,
        // Add includes items
        includes: includesItems.filter(item => item.trim() !== ''),
        // Set active status
        isActive: true
      };
      
      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tourData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const result = await response.json();
        if (response.status === 401) {
          // Authentication error - redirect to login
          router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/dashboard/guide/tours/new`)}`);
          return;
        }
        throw new Error(result.message || `Tour creation failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Redirect to tours list
      router.push(`/${locale}/dashboard/guide/tours`);
    } catch (error) {
      console.error('Tour creation error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {locale === 'en' ? 'Create New Tour' : 'إنشاء جولة جديدة'}
        </h1>
        <Button 
          href={`/${locale}/dashboard/tours`}
          variant="outline"
        >
          {locale === 'en' ? 'Cancel' : 'إلغاء'}
        </Button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="titleEn" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Title (English)' : 'العنوان (بالإنجليزية)'}*
              </label>
              <input
                id="titleEn"
                type="text"
                {...register('titleEn', {
                  required: locale === 'en' ? 'English title is required' : 'العنوان بالإنجليزية مطلوب',
                })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.titleEn && (
                <p className="mt-1 text-sm text-red-600">{errors.titleEn.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="titleAr" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Title (Arabic)' : 'العنوان (بالعربية)'}
              </label>
              <input
                id="titleAr"
                type="text"
                {...register('titleAr')}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                dir="rtl"
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="descriptionEn" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Description (English)' : 'الوصف (بالإنجليزية)'}*
              </label>
              <textarea
                id="descriptionEn"
                rows="5"
                {...register('descriptionEn', {
                  required: locale === 'en' ? 'English description is required' : 'الوصف بالإنجليزية مطلوب',
                })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              ></textarea>
              {errors.descriptionEn && (
                <p className="mt-1 text-sm text-red-600">{errors.descriptionEn.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="descriptionAr" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Description (Arabic)' : 'الوصف (بالعربية)'}
              </label>
              <textarea
                id="descriptionAr"
                rows="5"
                {...register('descriptionAr')}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                dir="rtl"
              ></textarea>
            </div>
          </div>
          
          {/* Tour Plan - Only show for multi-day tours */}
          {tourPlan.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                {locale === 'en' ? 'Tour Plan' : 'خطة الجولة'}
              </h3>
              <p className="text-sm text-secondary-600 mb-6">
                {locale === 'en' 
                  ? 'Describe what activities and locations will be covered each day of the tour.' 
                  : 'اوصف الأنشطة والمواقع التي سيتم تغطيتها في كل يوم من الجولة.'}
              </p>
              
              <div className="space-y-6">
                {tourPlan.map((day, index) => (
                  <div key={day.day} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-secondary-800 mb-4">
                      {locale === 'en' ? `Day ${day.day}` : `اليوم ${day.day}`}
                    </h4>
                    
                    {/* Day Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          {locale === 'en' ? 'Title (English)' : 'العنوان (بالإنجليزية)'}
                        </label>
                        <input
                          type="text"
                          value={day.title.en}
                          onChange={(e) => updateTourPlanDay(index, 'title', 'en', e.target.value)}
                          placeholder={locale === 'en' ? 'e.g., Jerusalem Old City Tour' : 'مثل: جولة البلدة القديمة في القدس'}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          {locale === 'en' ? 'Title (Arabic)' : 'العنوان (بالعربية)'}
                        </label>
                        <input
                          type="text"
                          value={day.title.ar}
                          onChange={(e) => updateTourPlanDay(index, 'title', 'ar', e.target.value)}
                          placeholder={locale === 'en' ? 'e.g., جولة البلدة القديمة في القدس' : 'مثل: جولة البلدة القديمة في القدس'}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    
                    {/* Day Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          {locale === 'en' ? 'Activities & Details (English)' : 'الأنشطة والتفاصيل (بالإنجليزية)'}*
                        </label>
                        <textarea
                          rows="4"
                          value={day.content.en}
                          onChange={(e) => updateTourPlanDay(index, 'content', 'en', e.target.value)}
                          placeholder={locale === 'en' 
                            ? 'Describe the activities, locations, meals, and experiences for this day...' 
                            : 'اوصف الأنشطة والمواقع والوجبات والتجارب لهذا اليوم...'}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          required
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          {locale === 'en' ? 'Activities & Details (Arabic)' : 'الأنشطة والتفاصيل (بالعربية)'}*
                        </label>
                        <textarea
                          rows="4"
                          value={day.content.ar}
                          onChange={(e) => updateTourPlanDay(index, 'content', 'ar', e.target.value)}
                          placeholder={locale === 'en' 
                            ? 'اوصف الأنشطة والمواقع والوجبات والتجارب لهذا اليوم...' 
                            : 'اوصف الأنشطة والمواقع والوجبات والتجارب لهذا اليوم...'}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          dir="rtl"
                          required
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tour Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Price ($)' : 'السعر ($)'}*
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', {
                  required: locale === 'en' ? 'Price is required' : 'السعر مطلوب',
                  min: {
                    value: 0,
                    message: locale === 'en' ? 'Price must be positive' : 'يجب أن يكون السعر موجبًا',
                  },
                })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Duration' : 'المدة'}*
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="duration"
                  type="number"
                  step="0.5"
                  min="0.5"
                  {...register('duration', {
                    required: locale === 'en' ? 'Duration is required' : 'المدة مطلوبة',
                    min: {
                      value: 0.5,
                      message: locale === 'en' ? 'Duration must be at least 0.5' : 'يجب أن تكون المدة 0.5 على الأقل',
                    },
                  })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  {...register('durationUnit')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="hours">{locale === 'en' ? 'Hours' : 'ساعات'}</option>
                  <option value="days">{locale === 'en' ? 'Days' : 'أيام'}</option>
                </select>
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="maxGroupSize" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Max Group Size' : 'الحد الأقصى لحجم المجموعة'}*
              </label>
              <input
                id="maxGroupSize"
                type="number"
                min="1"
                {...register('maxGroupSize', {
                  required: locale === 'en' ? 'Max group size is required' : 'الحد الأقصى لحجم المجموعة مطلوب',
                  min: {
                    value: 1,
                    message: locale === 'en' ? 'Group size must be at least 1' : 'يجب أن يكون حجم المجموعة 1 على الأقل',
                  },
                })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.maxGroupSize && (
                <p className="mt-1 text-sm text-red-600">{errors.maxGroupSize.message}</p>
              )}
            </div>
          </div>
          
          {/* Tour Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="expertise" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Expertise' : 'الخبرة'}*
              </label>
              <select
                id="expertise"
                {...register('expertise', {
                  required: locale === 'en' ? 'Expertise is required' : 'الخبرة مطلوبة',
                })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{locale === 'en' ? 'Select expertise' : 'اختر الخبرة'}</option>
                <option value="Historical">{locale === 'en' ? 'Historical' : 'تاريخية'}</option>
                <option value="Religious">{locale === 'en' ? 'Religious' : 'دينية'}</option>
                <option value="Cultural">{locale === 'en' ? 'Cultural' : 'ثقافية'}</option>
                <option value="Adventure">{locale === 'en' ? 'Adventure' : 'مغامرة'}</option>
                <option value="Culinary">{locale === 'en' ? 'Culinary' : 'طهي'}</option>
                <option value="Nature">{locale === 'en' ? 'Nature' : 'طبيعة'}</option>
                <option value="Photography">{locale === 'en' ? 'Photography' : 'تصوير'}</option>
                <option value="Jewish">{locale === 'en' ? 'Jewish' : 'يهودية'}</option>
                <option value="Christian">{locale === 'en' ? 'Christian' : 'مسيحية'}</option>
                <option value="Muslim">{locale === 'en' ? 'Muslim' : 'إسلامية'}</option>
                <option value="Political">{locale === 'en' ? 'Political' : 'سياسية'}</option>
              </select>
              {errors.expertise && (
                <p className="mt-1 text-sm text-red-600">{errors.expertise.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="activityLevel" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Activity Level' : 'مستوى النشاط'}*
              </label>
              <select
                id="activityLevel"
                {...register('activityLevel', {
                  required: locale === 'en' ? 'Activity level is required' : 'مستوى النشاط مطلوب',
                })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{locale === 'en' ? 'Select activity level' : 'اختر مستوى النشاط'}</option>
                <option value="easy">{locale === 'en' ? 'Easy' : 'سهل'}</option>
                <option value="moderate">{locale === 'en' ? 'Moderate' : 'متوسط'}</option>
                <option value="challenging">{locale === 'en' ? 'Challenging' : 'صعب'}</option>
              </select>
              {errors.activityLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.activityLevel.message}</p>
              )}
            </div>
          </div>
          
          {/* Languages & Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Languages' : 'اللغات'}
              </label>
              <div className="w-full px-3 py-2 border border-secondary-300 rounded-md bg-secondary-50 text-secondary-700">
                {guide && guide.languages ? 
                  guide.languages.map(lang => lang.language).join(', ') : 
                  (locale === 'en' ? 'Loading languages...' : 'جاري تحميل اللغات...')}
              </div>
              <p className="mt-1 text-xs text-secondary-500">
                {locale === 'en' 
                  ? 'Languages are automatically set from your guide profile' 
                  : 'يتم تعيين اللغات تلقائيًا من ملف الدليل الخاص بك'}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                {locale === 'en' ? 'Locations (select multiple)' : 'المواقع (اختر متعدد)'}*
              </label>
              <div className="border border-secondary-300 rounded-md p-2 h-48 overflow-y-auto">
                {locations.map((location) => (
                  <div key={location._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`location-${location._id}`}
                      checked={selectedLocations.includes(location._id)}
                      onChange={() => handleLocationChange(location._id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor={`location-${location._id}`} className="ml-2 block text-sm text-secondary-700">
                      {locale === 'en' ? location.name.en : location.name.ar}
                    </label>
                  </div>
                ))}
              </div>
              {selectedLocations.length === 0 && errors.locations && (
                <p className="mt-1 text-sm text-red-600">
                  {locale === 'en' ? 'At least one location is required' : 'مطلوب موقع واحد على الأقل'}
                </p>
              )}
            </div>
          </div>
          
          {/* Additional Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="transportation" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Transportation' : 'وسيلة النقل'}
              </label>
              <select
                id="transportation"
                {...register('transportation')}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="walking">{locale === 'en' ? 'Walking' : 'مشي'}</option>
                <option value="public">{locale === 'en' ? 'Public Transport' : 'وسائل النقل العامة'}</option>
                <option value="private">{locale === 'en' ? 'Private Transport' : 'وسائل النقل الخاصة'}</option>
                <option value="mixed">{locale === 'en' ? 'Mixed' : 'مختلط'}</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="handicappedFriendly"
                type="checkbox"
                {...register('handicappedFriendly')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="handicappedFriendly" className="ml-2 block text-sm text-secondary-700">
                {locale === 'en' ? 'Handicapped Friendly' : 'مناسب لذوي الاحتياجات الخاصة'}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="kidFriendly"
                type="checkbox"
                {...register('kidFriendly')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="kidFriendly" className="ml-2 block text-sm text-secondary-700">
                {locale === 'en' ? 'Kid Friendly' : 'مناسب للأطفال'}
              </label>
            </div>
          </div>
          
          {/* Includes */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              {locale === 'en' ? 'What\'s Included' : 'ما هو مشمول'}
            </label>
            
            {includesItems.map((item, index) => (
              <div key={`includes-${index}`} className="mb-4 p-4 border border-secondary-200 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">
                    {locale === 'en' ? `Item ${index + 1}` : `العنصر ${index + 1}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeIncludesItem(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={includesItems.length === 1}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
                
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateIncludesItem(index, e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={locale === 'en' ? 'E.g., Professional guide, Transportation, Lunch' : 'مثال: دليل محترف، النقل، الغداء'}
                />
              </div>
            ))}
            
            <button
              type="button"
              onClick={addIncludesItem}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              {locale === 'en' ? 'Add Included Item' : 'إضافة عنصر مشمول'}
            </button>
          </div>
          
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Cover Image' : 'صورة الغلاف'}*
            </label>
            <ImageUploader
              onImageUploaded={handleCoverImageUploaded}
              folder="tours/covers"
            />
            {!coverImage && (
              <p className="mt-1 text-sm text-secondary-500">
                {locale === 'en' ? 'Please upload a cover image' : 'يرجى تحميل صورة الغلاف'}
              </p>
            )}
          </div>
          
          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Gallery Images' : 'صور المعرض'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {galleryImages.map((image, index) => (
                <div key={index} className="relative h-40 rounded-md overflow-hidden">
                  <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <ImageUploader
              onImageUploaded={handleGalleryImageUploaded}
              folder="tours/gallery"
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="text-black"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader className="animate-spin mr-2 h-4 w-4" />
                  {locale === 'en' ? 'Creating...' : 'جاري الإنشاء...'}
                </span>
              ) : (
                locale === 'en' ? 'Create Tour' : 'إنشاء الجولة'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 