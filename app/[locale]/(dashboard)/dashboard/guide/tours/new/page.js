'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { Loader, Plus, Minus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function NewTourPage({ params }) {
  // Use React.use() to unwrap params in Next.js 15+
  const resolvedParams = use(params);
  const locale = resolvedParams?.locale || 'en';
  const router = useRouter();
  
  const { user } = useUser();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [guideLanguages, setGuideLanguages] = useState('');
  const [guideLanguagesArray, setGuideLanguagesArray] = useState([]);
  const [guideId, setGuideId] = useState(null);
  const [tourPlan, setTourPlan] = useState([]);
  const [includesItems, setIncludesItems] = useState(['']);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [faqs, setFaqs] = useState([{ question: { en: '', ar: '' }, answer: { en: '', ar: '' } }]);
  
  // ReactQuill modules and formats
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'link'
  ];

  // Hardcoded locations in Palestine and Israel
  const locations = [
    { _id: 'Jerusalem', name: { en: 'Jerusalem', ar: 'القدس' } },
    { _id: 'Jaffa', name: { en: 'Jaffa (Tel Aviv)', ar: 'يافا (تل أبيب)' } },
    { _id: 'Dead Sea', name: { en: 'Dead Sea', ar: 'البحر الميت' } },
    { _id: 'Tiberias', name: { en: 'Tiberias and Lake of Galilee', ar: 'طبريا وبحيرة الجليل' } },
    { _id: 'Eilat', name: { en: 'Umm al-Rashrash (Eilat)', ar: 'أم الرشراش (إيلات)' } },
    { _id: 'Masada', name: { en: 'Masada', ar: 'مسادا' } },
    { _id: 'Haifa', name: { en: 'Haifa', ar: 'حيفا' } },
    { _id: 'Nazareth', name: { en: 'Nazareth', ar: 'الناصرة' } },
    { _id: 'Akko', name: { en: 'Akka (Acre/Akko)', ar: 'عكا' } },
    { _id: 'Eingedi', name: { en: 'Ein Gedi', ar: 'عين جدي' } },
    { _id: 'Jordanriver', name: { en: 'Jordan River', ar: 'نهر الأردن' } },
    { _id: 'Qumran', name: { en: 'Qumran', ar: 'قمران' } },
    { _id: 'Banias', name: { en: 'Banias', ar: 'بانياس' } },
    { _id: 'Caesarea', name: { en: 'Caesarea', ar: 'قيسارية' } },
    // { _id: 'Golan', name: { en: 'Golan', ar: 'الجولان' } },
    { _id: 'Negev', name: { en: 'Naqab (Negev Desert)', ar: 'النقب' } },
    { _id: 'Beersheba', name: { en: 'Beersheba', ar: 'بئر السبع' } },
    { _id: 'Ashkelon', name: { en: 'Ascalon (Ashkelon)', ar: 'عسقلان' } },
    { _id: 'Safed', name: { en: 'Safed', ar: 'صفد' } },
    { _id: 'KufrKana', name: { en: 'Kufr Kana', ar: 'كفر كنا' } },
    // West Bank Cities
    { _id: 'Bethlehem', name: { en: 'Bethlehem', ar: 'بيت لحم' } },
    { _id: 'Hebron', name: { en: 'Hebron', ar: 'الخليل' } },
    { _id: 'Jericho', name: { en: 'Jericho', ar: 'أريحا' } },
    { _id: 'Ramallah', name: { en: 'Ramallah', ar: 'رام الله' } },
    { _id: 'Nablus', name: { en: 'Nablus', ar: 'نابلس' } },
    { _id: 'Jenin', name: { en: 'Jenin', ar: 'جنين' } },
    { _id: 'Taybeh', name: { en: 'Taybeh', ar: 'الطيبة' } },
  ];

  const expertiseOptions = [
    'Religious',
    'Christian',
    'Jewish',
    'Muslim',
    'Political',
    'Historical',
    'Cultural',
    'Food',
    'Adventure',
    'Nature',
    'Photography',
    'Culinary',
    'All-inclusive',
  ];

  const expertiseLabels = {
    'Religious': { en: 'Religious', ar: 'دينية' },
    'Christian': { en: 'Christian', ar: 'مسيحية' },
    'Jewish': { en: 'Jewish', ar: 'يهودية' },
    'Muslim': { en: 'Muslim', ar: 'إسلامية' },
    'Political': { en: 'Political', ar: 'سياسية' },
    'Historical': { en: 'Historical', ar: 'تاريخية' },
    'Cultural': { en: 'Cultural', ar: 'ثقافية' },
    'Food': { en: 'Food', ar: 'طعام' },
    'Adventure': { en: 'Adventure', ar: 'مغامرة' },
    'Nature': { en: 'Nature', ar: 'طبيعة' },
    'Photography': { en: 'Photography', ar: 'تصوير' },
    'Culinary': { en: 'Culinary', ar: 'طهي' },
    'All-inclusive': { en: 'All-inclusive', ar: 'شامل' },
  };
  
  const { register, handleSubmit, setValue, control, formState: { errors }, watch } = useForm();
  
  // Set default pricePer
  useEffect(() => {
    setValue('pricePer', 'group');
  }, [setValue]);

  // Watch duration and durationUnit to update tour plan
  const duration = watch('duration');
  const durationUnit = watch('durationUnit');
  const pricePer = watch('pricePer');
  
  // Update tour plan when duration or unit changes
  useEffect(() => {
    if (duration && durationUnit === 'days' && Math.floor(duration) > 0) {
      const days = Math.floor(duration);
      
      // Prevent infinite loop by checking if we need to update
      if (tourPlan.length === days) return;

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
    } else if (durationUnit === 'hours') {
      if (tourPlan.length > 0) {
        setTourPlan([]);
      }
    }
  }, [duration, durationUnit, tourPlan]);
  
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
    const fetchGuideProfile = async () => {
      try {
        const res = await fetch('/api/guides/me', { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Failed to fetch guide profile');
        }
        const data = await res.json();
        if (data?.guide) {
          setGuideId(data.guide._id);
          const langs = Array.isArray(data.guide.languages)
            ? data.guide.languages.map((l) => (typeof l === 'string' ? l : (l?.language || ''))).filter(Boolean)
            : [];
          setGuideLanguagesArray(langs);
          setGuideLanguages(langs.join(', '));
        } else {
          setGuideLanguages('');
          setGuideLanguagesArray([]);
        }
      } catch (e) {
        console.error('Error fetching guide profile:', e);
        setGuideLanguages('');
        setGuideLanguagesArray([]);
      }
    };
    fetchGuideProfile();
  }, []);
  
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

  const toggleExpertise = (value) => {
    setSelectedExpertise(prev => prev.includes(value)
      ? prev.filter(v => v !== value)
      : [...prev, value]
    );
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: { en: '', ar: '' }, answer: { en: '', ar: '' } }]);
  };

  const removeFaq = (index) => {
    const next = [...faqs];
    next.splice(index, 1);
    setFaqs(next.length ? next : [{ question: { en: '', ar: '' }, answer: { en: '', ar: '' } }]);
  };

  const updateFaq = (index, section, lang, value) => {
    setFaqs(prev => {
      const updated = [...prev];
      if (!updated[index][section]) updated[index][section] = {};
      updated[index][section][lang] = value;
      return updated;
    });
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

    if (!selectedExpertise.length) {
      setError(locale === 'en' ? 'Select at least one expertise' : 'اختر نوع خبرة واحدًا على الأقل');
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
        expertise: selectedExpertise,
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
        // Price unit selection
        pricePer: data.pricePer,
        // Add tour plan for multi-day tours
        tourPlan: data.durationUnit === 'days' && Math.floor(data.duration) > 0 ? tourPlan : [],
        // Convert numeric fields
        guide: guideId,
        price: parseFloat(data.price),
        duration: parseFloat(data.duration),
        maxGroupSize: parseInt(data.maxGroupSize),
        // Convert languages to array from guide profile via NextAuth-backed API
        languages: guideLanguagesArray.length ? guideLanguagesArray : ['en'],
        // Use selected locations
        locationNames: selectedLocations,
        // Add includes items
        includes: includesItems.filter(item => item.trim() !== ''),
        // FAQs: only include items with at least question or answer
        faqs: faqs
          .map(f => ({
            question: { en: (f.question?.en || '').trim(), ar: (f.question?.ar || '').trim() },
            answer: { en: (f.answer?.en || '').trim(), ar: (f.answer?.ar || '').trim() },
          }))
          .filter(f => f.question.en || f.question.ar || f.answer.en || f.answer.ar),
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
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
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
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
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
              <Controller
                name="descriptionEn"
                control={control}
                rules={{ 
                  required: locale === 'en' ? 'English description is required' : 'الوصف بالإنجليزية مطلوب' 
                }}
                defaultValue=""
                render={({ field }) => (
                  <div className="bg-white text-black">
                    <ReactQuill 
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={modules}
                      formats={formats}
                      className="h-64 mb-12"
                    />
                  </div>
                )}
              />
              {errors.descriptionEn && (
                <p className="mt-1 text-sm text-red-600">{errors.descriptionEn.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="descriptionAr" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Description (Arabic)' : 'الوصف (بالعربية)'}
              </label>
              <Controller
                name="descriptionAr"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div className="bg-white text-black" dir="rtl">
                    <ReactQuill 
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={modules}
                      formats={formats}
                      className="h-64 mb-12"
                    />
                  </div>
                )}
              />
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
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
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
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
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
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
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
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
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
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            
          {/* Price Per - selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Price applies to' : 'السعر ينطبق على'}*
            </label>
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <input
                  id="pricePerPerson"
                  type="checkbox"
                  checked={pricePer === 'person'}
                  onChange={() => setValue('pricePer', 'person', { shouldValidate: true })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="pricePerPerson" className="ml-2 block text-sm text-secondary-700">
                  {locale === 'en' ? 'Per person' : 'للشخص'}
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="pricePerGroup"
                  type="checkbox"
                  checked={pricePer === 'group'}
                  onChange={() => setValue('pricePer', 'group', { shouldValidate: true })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="pricePerGroup" className="ml-2 block text-sm text-secondary-700">
                  {locale === 'en' ? 'Per group' : 'للمجموعة'}
                </label>
              </div>
            </div>
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
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
                />
                <select
                  {...register('durationUnit')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
              />
              {errors.maxGroupSize && (
                <p className="mt-1 text-sm text-red-600">{errors.maxGroupSize.message}</p>
              )}
            </div>
          </div>
          
          {/* Tour Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Expertise (select multiple)' : 'الخبرة (اختر متعدد)'}*
              </label>
              <div className="border border-secondary-300 rounded-md p-3 max-h-48 overflow-y-auto">
                {expertiseOptions.map((opt) => (
                  <div key={opt} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`exp-${opt}`}
                      checked={selectedExpertise.includes(opt)}
                      onChange={() => toggleExpertise(opt)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor={`exp-${opt}`} className="ml-2 block text-sm text-secondary-700">
                      {locale === 'en' ? expertiseLabels[opt].en : expertiseLabels[opt].ar}
                    </label>
                  </div>
                ))}
              </div>
              {selectedExpertise.length === 0 && (
                <p className="mt-1 text-sm text-red-600">{locale === 'en' ? 'Select at least one expertise' : 'اختر نوع خبرة واحدًا على الأقل'}</p>
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
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                {guideLanguages || (locale === 'en' ? 'Loading languages...' : 'جاري تحميل اللغات...')}
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
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
              <div key={`includes-${index}`} className="mb-4 p-4 border border-secondary-200 rounded-md text-black">
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
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"
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

          {/* FAQs */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              {locale === 'en' ? 'Frequently Asked Questions' : 'الأسئلة الشائعة'}
            </label>
            <p className="text-xs text-secondary-500 mb-3">
              {locale === 'en' ? 'Add common questions travelers ask. Either language is fine.' : 'أضف الأسئلة الشائعة. أي لغة مقبولة.'}
            </p>
            {faqs.map((f, idx) => (
              <div key={`faq-${idx}`} className="mb-4 p-4 border border-secondary-200 rounded-md text-black">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{locale === 'en' ? `FAQ ${idx + 1}` : `سؤال ${idx + 1}`}</h3>
                  <button type="button" onClick={() => removeFaq(idx)} className="text-red-500 hover:text-red-700" disabled={faqs.length === 1}>
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">{locale === 'en' ? 'Question (English)' : 'السؤال (بالإنجليزية)'}</label>
                    <input type="text" value={f.question.en} onChange={(e) => updateFaq(idx, 'question', 'en', e.target.value)} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">{locale === 'en' ? 'Question (Arabic)' : 'السؤال (بالعربية)'}</label>
                    <input type="text" value={f.question.ar} onChange={(e) => updateFaq(idx, 'question', 'ar', e.target.value)} dir="rtl" className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">{locale === 'en' ? 'Answer (English)' : 'الإجابة (بالإنجليزية)'}</label>
                    <textarea rows="3" value={f.answer.en} onChange={(e) => updateFaq(idx, 'answer', 'en', e.target.value)} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">{locale === 'en' ? 'Answer (Arabic)' : 'الإجابة (بالعربية)'}</label>
                    <textarea rows="3" value={f.answer.ar} onChange={(e) => updateFaq(idx, 'answer', 'ar', e.target.value)} dir="rtl" className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder:text-gray-900"></textarea>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addFaq} className="flex items-center text-primary-600 hover:text-primary-700">
              <Plus className="h-5 w-5 mr-2" />
              {locale === 'en' ? 'Add FAQ' : 'إضافة سؤال'}
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
                  <Image 
                    src={image} 
                    alt={`Gallery ${index + 1}`} 
                    width={800}
                    height={160}
                    className="w-full h-full object-cover" 
                  />
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
              resetAfterUpload
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="text-white"
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
