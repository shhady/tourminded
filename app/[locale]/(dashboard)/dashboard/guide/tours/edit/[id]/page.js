'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { Loader, Plus, Minus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

export default function EditTourPage({ params }) {
  const router = useRouter();
  const paramsData = React.use(params);
  const { id, locale } = paramsData;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [includedItems, setIncludedItems] = useState(['']);
  const [excludedItems, setExcludedItems] = useState(['']);
  const [itineraryItems, setItineraryItems] = useState([{ title: '', description: '' }]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [tour, setTour] = useState(null);
  const [tourPlan, setTourPlan] = useState([]);
  
  // Hardcoded locations in Palestine and Israel
  const locations = [
    { _id: 'jerusalem', name: { en: 'Jerusalem', ar: 'القدس' } },
    { _id: 'jaffa', name: { en: 'Jaffa (Tel Aviv)', ar: 'يافا (تل أبيب)' } },
    { _id: 'deadsea', name: { en: 'Dead Sea', ar: 'البحر الميت' } },
    { _id: 'tiberias', name: { en: 'Tiberias and Lake of Galilee', ar: 'طبريا وبحيرة الجليل' } },
    { _id: 'eilat', name: { en: 'Umm al-Rashrash (Eilat)', ar: 'أم الرشراش (إيلات)' } },
    { _id: 'masada', name: { en: 'Masada', ar: 'مسادا' } },
    { _id: 'haifa', name: { en: 'Haifa', ar: 'حيفا' } },
    { _id: 'nazareth', name: { en: 'Nazareth', ar: 'الناصرة' } },
    { _id: 'akko', name: { en: 'Akka (Acre/Akko)', ar: 'عكا' } },
    { _id: 'eingedi', name: { en: 'Ein Gedi', ar: 'عين جدي' } },
    { _id: 'jordanriver', name: { en: 'Jordan River', ar: 'نهر الأردن' } },
    { _id: 'qumran', name: { en: 'Qumran', ar: 'قمران' } },
    { _id: 'banias', name: { en: 'Banias', ar: 'بانياس' } },
    { _id: 'caesarea', name: { en: 'Caesarea', ar: 'قيسارية' } },
    { _id: 'golan', name: { en: 'Golan', ar: 'الجولان' } },
    { _id: 'negev', name: { en: 'Naqab (Negev Desert)', ar: 'النقب' } },
    { _id: 'beersheba', name: { en: 'Beersheba', ar: 'بئر السبع' } },
    { _id: 'ashkelon', name: { en: 'Ascalon (Ashkelon)', ar: 'عسقلان' } },
    { _id: 'safed', name: { en: 'Safed', ar: 'صفد' } },
    { _id: 'kufrKana', name: { en: 'Kufr Kana', ar: 'كفر كنا' } },
    // West Bank Cities
    { _id: 'bethlehem', name: { en: 'Bethlehem', ar: 'بيت لحم' } },
    { _id: 'hebron', name: { en: 'Hebron', ar: 'الخليل' } },
    { _id: 'jericho', name: { en: 'Jericho', ar: 'أريحا' } },
    { _id: 'ramallah', name: { en: 'Ramallah', ar: 'رام الله' } },
    { _id: 'nablus', name: { en: 'Nablus', ar: 'نابلس' } },
    { _id: 'jenin', name: { en: 'Jenin', ar: 'جنين' } },
    { _id: 'taybeh', name: { en: 'Taybeh', ar: 'الطيبة' } },
  ];
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  
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
    } else if (durationUnit === 'hours') {
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
  
  // Fetch tour data
  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`/api/tours/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tour');
        }
        
        const data = await response.json();
        setTour(data.data);
        
        // Set form values
        setCoverImage(data.data.images?.cover?.url || '');
        setGalleryImages(data.data.images?.gallery?.map(img => img.url) || []);
        setSelectedLocations(data.data.locationNames || []);
        setIncludedItems(data.data.includes || ['']);
        setExcludedItems(data.data.excluded || ['']);
        setItineraryItems(data.data.itinerary || [{ title: '', description: '' }]);
        setTourPlan(data.data.tourPlan || []);
        
        // Reset form with tour data
        reset({
          'title.en': data.data.title?.en || '',
          'title.ar': data.data.title?.ar || '',
          'description.en': data.data.description?.en || '',
          'description.ar': data.data.description?.ar || '',
          price: data.data.price || 0,
          duration: data.data.duration || 1,
          durationUnit: data.data.durationUnit || 'hours',
          maxGroupSize: data.data.maxGroupSize || 1,
          activityLevel: data.data.activityLevel || 'easy',
          languages: data.data.languages || [],
          transportation: data.data.transportation || 'walking',
          handicappedFriendly: data.data.handicappedFriendly || false,
          kidFriendly: data.data.kidFriendly || false,
          expertise: data.data.expertise || '',
          isActive: data.data.isActive !== undefined ? data.data.isActive : true,
        });
      } catch (error) {
        console.error('Error fetching tour:', error);
        setError('Failed to load tour data');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchTour();
  }, [id, reset]);
  
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
  
  const addIncludedItem = () => {
    setIncludedItems([...includedItems, '']);
  };
  
  const removeIncludedItem = (index) => {
    const newItems = [...includedItems];
    newItems.splice(index, 1);
    setIncludedItems(newItems);
  };
  
  const updateIncludedItem = (index, value) => {
    const newItems = [...includedItems];
    newItems[index] = value;
    setIncludedItems(newItems);
  };
  
  const addExcludedItem = () => {
    setExcludedItems([...excludedItems, '']);
  };
  
  const removeExcludedItem = (index) => {
    const newItems = [...excludedItems];
    newItems.splice(index, 1);
    setExcludedItems(newItems);
  };
  
  const updateExcludedItem = (index, value) => {
    const newItems = [...excludedItems];
    newItems[index] = value;
    setExcludedItems(newItems);
  };
  
  const addItineraryItem = () => {
    setItineraryItems([...itineraryItems, { title: '', description: '' }]);
  };
  
  const removeItineraryItem = (index) => {
    const newItems = [...itineraryItems];
    newItems.splice(index, 1);
    setItineraryItems(newItems);
  };
  
  const updateItineraryItem = (index, field, value) => {
    const newItems = [...itineraryItems];
    newItems[index][field] = value;
    setItineraryItems(newItems);
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
      // Prepare tour data
      const tourData = {
        title: {
          en: data['title.en'],
          ar: data['title.ar'],
        },
        description: {
          en: data['description.en'],
          ar: data['description.ar'],
        },
        // Add tour plan for multi-day tours
        tourPlan: data.durationUnit === 'days' && Math.floor(data.duration) > 0 ? tourPlan : [],
        price: parseFloat(data.price),
        duration: parseInt(data.duration),
        durationUnit: data.durationUnit,
        maxGroupSize: parseInt(data.maxGroupSize),
        activityLevel: data.activityLevel,
        languages: Array.isArray(data.languages) ? data.languages : [data.languages],
        transportation: data.transportation,
        handicappedFriendly: data.handicappedFriendly,
        kidFriendly: data.kidFriendly,
        expertise: data.expertise,
        isActive: data.isActive,
        locationNames: selectedLocations,
        includes: includedItems.filter(item => item.trim() !== ''),
        excluded: excludedItems.filter(item => item.trim() !== ''),
        itinerary: itineraryItems.filter(item => item.title.trim() !== '' || item.description.trim() !== ''),
        images: {
          cover: {
            url: coverImage,
          },
          gallery: galleryImages.map(url => ({ url })),
        },
      };
      
      // Update tour
      const response = await fetch(`/api/tours/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tourData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tour');
      }
      
      // Redirect to tours page
      router.push(`/${locale}/dashboard/guide/tours`);
      router.refresh();
    } catch (error) {
      console.error('Error updating tour:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }
  
  if (error && !tour) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {locale === 'en' ? 'Edit Tour' : 'تعديل الجولة'}
      </h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="basic">
              {locale === 'en' ? 'Basic Info' : 'معلومات أساسية'}
            </TabsTrigger>
            <TabsTrigger value="details">
              {locale === 'en' ? 'Details' : 'تفاصيل'}
            </TabsTrigger>
            <TabsTrigger value="itinerary">
              {locale === 'en' ? 'Itinerary' : 'البرنامج'}
            </TabsTrigger>
            <TabsTrigger value="media">
              {locale === 'en' ? 'Media' : 'الوسائط'}
            </TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title.en" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Title (English)' : 'العنوان (بالإنجليزية)'}*
                </label>
                <input
                  id="title.en"
                  type="text"
                  {...register('title.en', { required: true })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors['title.en'] && (
                  <p className="mt-1 text-sm text-red-600">
                    {locale === 'en' ? 'Title in English is required' : 'العنوان بالإنجليزية مطلوب'}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="title.ar" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Title (Arabic)' : 'العنوان (بالعربية)'}*
                </label>
                <input
                  id="title.ar"
                  type="text"
                  {...register('title.ar', { required: true })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors['title.ar'] && (
                  <p className="mt-1 text-sm text-red-600">
                    {locale === 'en' ? 'Title in Arabic is required' : 'العنوان بالعربية مطلوب'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="description.en" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Description (English)' : 'الوصف (بالإنجليزية)'}*
                </label>
                <textarea
                  id="description.en"
                  {...register('description.en', { required: true })}
                  rows={5}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
                {errors['description.en'] && (
                  <p className="mt-1 text-sm text-red-600">
                    {locale === 'en' ? 'Description in English is required' : 'الوصف بالإنجليزية مطلوب'}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="description.ar" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Description (Arabic)' : 'الوصف (بالعربية)'}*
                </label>
                <textarea
                  id="description.ar"
                  {...register('description.ar', { required: true })}
                  rows={5}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
                {errors['description.ar'] && (
                  <p className="mt-1 text-sm text-red-600">
                    {locale === 'en' ? 'Description in Arabic is required' : 'الوصف بالعربية مطلوب'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Price and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Price ($)' : 'السعر ($)'}*
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('price', { required: true, min: 0 })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {locale === 'en' ? 'Valid price is required' : 'السعر الصحيح مطلوب'}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Duration' : 'المدة'}*
                </label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  {...register('duration', { required: true, min: 1 })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">
                    {locale === 'en' ? 'Valid duration is required' : 'المدة الصحيحة مطلوبة'}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="durationUnit" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Duration Unit' : 'وحدة المدة'}*
                </label>
                <select
                  id="durationUnit"
                  {...register('durationUnit', { required: true })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="hours">{locale === 'en' ? 'Hours' : 'ساعات'}</option>
                  <option value="days">{locale === 'en' ? 'Days' : 'أيام'}</option>
                </select>
              </div>
            </div>
            
            {/* Group Size and Activity Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxGroupSize" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Max Group Size' : 'الحد الأقصى لحجم المجموعة'}*
                </label>
                <input
                  id="maxGroupSize"
                  type="number"
                  min="1"
                  {...register('maxGroupSize', { required: true, min: 1 })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.maxGroupSize && (
                  <p className="mt-1 text-sm text-red-600">
                    {locale === 'en' ? 'Valid group size is required' : 'حجم المجموعة الصحيح مطلوب'}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="activityLevel" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Activity Level' : 'مستوى النشاط'}*
                </label>
                <select
                  id="activityLevel"
                  {...register('activityLevel', { required: true })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="easy">{locale === 'en' ? 'Easy' : 'سهل'}</option>
                  <option value="moderate">{locale === 'en' ? 'Moderate' : 'متوسط'}</option>
                  <option value="challenging">{locale === 'en' ? 'Challenging' : 'صعب'}</option>
                </select>
              </div>
            </div>
            
            {/* Status */}
            <div>
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-secondary-700">
                  {locale === 'en' ? 'Active (visible to customers)' : 'نشط (مرئي للعملاء)'}
                </label>
              </div>
            </div>
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Languages & Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Languages' : 'اللغات'}*
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="language-en"
                      type="checkbox"
                      value="en"
                      {...register('languages', { required: true })}
                      defaultChecked={tour?.languages?.includes('en')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="language-en" className="ml-2 block text-sm text-secondary-700">
                      {locale === 'en' ? 'English' : 'الإنجليزية'}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="language-ar"
                      type="checkbox"
                      value="ar"
                      {...register('languages', { required: true })}
                      defaultChecked={tour?.languages?.includes('ar')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="language-ar" className="ml-2 block text-sm text-secondary-700">
                      {locale === 'en' ? 'Arabic' : 'العربية'}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="language-he"
                      type="checkbox"
                      value="he"
                      {...register('languages', { required: true })}
                      defaultChecked={tour?.languages?.includes('he')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="language-he" className="ml-2 block text-sm text-secondary-700">
                      {locale === 'en' ? 'Hebrew' : 'العبرية'}
                    </label>
                  </div>
                </div>
                {errors.languages && (
                  <p className="mt-1 text-sm text-red-600">
                    {locale === 'en' ? 'At least one language is required' : 'مطلوب لغة واحدة على الأقل'}
                  </p>
                )}
              </div>
              
              <div>
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
            
            {/* Expertise */}
            <div>
              <label htmlFor="expertise" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Expertise' : 'الخبرة'}
              </label>
              <select
                id="expertise"
                {...register('expertise')}
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
            </div>
            
            {/* Included Items */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'What\'s Included' : 'ما هو مشمول'}
              </label>
              {includedItems.map((item, index) => (
                <div key={`included-${index}`} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateIncludedItem(index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={locale === 'en' ? 'E.g., Entrance fees' : 'مثال: رسوم الدخول'}
                  />
                  <button
                    type="button"
                    onClick={() => removeIncludedItem(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    disabled={includedItems.length === 1}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIncludedItem}
                className="mt-2 flex items-center text-primary-600 hover:text-primary-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                {locale === 'en' ? 'Add Item' : 'إضافة عنصر'}
              </button>
            </div>
            
            {/* Excluded Items */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                              {locale === 'en' ? 'What\'s Not Included' : 'ما هو غير مشمول'}
              </label>
              {excludedItems.map((item, index) => (
                <div key={`excluded-${index}`} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateExcludedItem(index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={locale === 'en' ? 'E.g., Personal expenses' : 'مثال: المصاريف الشخصية'}
                  />
                  <button
                    type="button"
                    onClick={() => removeExcludedItem(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    disabled={excludedItems.length === 1}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExcludedItem}
                className="mt-2 flex items-center text-primary-600 hover:text-primary-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                {locale === 'en' ? 'Add Item' : 'إضافة عنصر'}
              </button>
            </div>
            
            {/* Transportation & Accessibility */}
            <div className="space-y-4">
              <div>
                <label htmlFor="transportation" className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Transportation' : 'وسائل النقل'}
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
          </TabsContent>
          
          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            {/* Tour Plan - Only show for multi-day tours */}
            {tourPlan.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  {locale === 'en' ? 'Daily Tour Plan' : 'خطة الجولة اليومية'}
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
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                {locale === 'en' ? 'Tour Itinerary' : 'جدول الجولة'}
              </label>
              
              {itineraryItems.map((item, index) => (
                <div key={`itinerary-${index}`} className="mb-4 p-4 border border-secondary-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">
                      {locale === 'en' ? `Stop ${index + 1}` : `المحطة ${index + 1}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItineraryItem(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={itineraryItems.length === 1}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <label htmlFor={`itinerary-title-${index}`} className="block text-sm text-secondary-700 mb-1">
                      {locale === 'en' ? 'Title' : 'العنوان'}
                    </label>
                    <input
                      id={`itinerary-title-${index}`}
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItineraryItem(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={locale === 'en' ? 'E.g., Visit the Old City' : 'مثال: زيارة المدينة القديمة'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`itinerary-description-${index}`} className="block text-sm text-secondary-700 mb-1">
                      {locale === 'en' ? 'Description' : 'الوصف'}
                    </label>
                    <textarea
                      id={`itinerary-description-${index}`}
                      value={item.description}
                      onChange={(e) => updateItineraryItem(index, 'description', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={locale === 'en' ? 'Describe this stop...' : 'وصف هذه المحطة...'}
                    ></textarea>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addItineraryItem}
                className="mt-2 flex items-center text-primary-600 hover:text-primary-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                {locale === 'en' ? 'Add Stop' : 'إضافة محطة'}
              </button>
            </div>
          </TabsContent>
          
          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Cover Image' : 'صورة الغلاف'}*
              </label>
              {coverImage && (
                <div className="mb-2 relative h-40 w-full md:w-1/2 rounded-md overflow-hidden">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
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
          </TabsContent>
        </Tabs>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {activeTab !== 'basic' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabs = ['basic', 'details', 'itinerary', 'media'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex - 1]);
              }}
            >
              {locale === 'en' ? 'Previous' : 'السابق'}
            </Button>
          )}
          
          <div className="ml-auto">
            {activeTab !== 'media' ? (
              <Button
                type="button"
                variant="primary"
                className="text-black"
                onClick={() => {
                  const tabs = ['basic', 'details', 'itinerary', 'media'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex + 1]);
                }}
              >
                {locale === 'en' ? 'Next' : 'التالي'}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                className="text-black"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin mr-2 h-4 w-4" />
                    {locale === 'en' ? 'Updating...' : 'جاري التحديث...'}
                  </span>
                ) : (
                  locale === 'en' ? 'Update Tour' : 'تحديث الجولة'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}