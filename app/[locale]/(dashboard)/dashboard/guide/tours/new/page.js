'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { Loader } from 'lucide-react';

export default function NewTourPage({ params }) {
  const localeParams = React.use(params);
  const locale = localeParams?.locale || 'en';
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
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
  
  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations?all=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        
        const data = await response.json();
        setLocations(data.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    fetchLocations();
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
  
  const handleLocationChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setSelectedLocations(selectedValues);
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
        // Convert numeric fields
        price: parseFloat(data.price),
        duration: parseFloat(data.duration),
        maxGroupSize: parseInt(data.maxGroupSize),
        // Convert languages to array
        languages: data.languages.split(',').map(lang => lang.trim()),
        // Use selected locations
        locationNames: selectedLocations,
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
                <option value="Christian">{locale === 'en' ? 'Christian' : 'مسيحي'}</option>
                <option value="Jewish">{locale === 'en' ? 'Jewish' : 'يهودي'}</option>
                <option value="Muslim">{locale === 'en' ? 'Muslim' : 'إسلامي'}</option>
                <option value="Historical">{locale === 'en' ? 'Historical' : 'تاريخي'}</option>
                <option value="Cultural">{locale === 'en' ? 'Cultural' : 'ثقافي'}</option>
                <option value="Political">{locale === 'en' ? 'Political' : 'سياسي'}</option>
                <option value="Food">{locale === 'en' ? 'Food' : 'طعام'}</option>
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
              <label htmlFor="languages" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Languages (comma separated)' : 'اللغات (مفصولة بفواصل)'}*
              </label>
              <input
                id="languages"
                type="text"
                placeholder={locale === 'en' ? 'English, Arabic, Hebrew' : 'الإنجليزية، العربية، العبرية'}
                {...register('languages', {
                  required: locale === 'en' ? 'Languages are required' : 'اللغات مطلوبة',
                })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.languages && (
                <p className="mt-1 text-sm text-red-600">{errors.languages.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="locations" className="block mb-1 font-medium">
                {locale === 'en' ? 'Locations (select multiple)' : 'المواقع (اختر متعدد)'}*
              </label>
              <select
                id="locations"
                multiple
                {...register('locations', {
                  validate: () => selectedLocations.length > 0 || 
                    (locale === 'en' ? 'At least one location is required' : 'مطلوب موقع واحد على الأقل')
                })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                onChange={handleLocationChange}
                size="4"
              >
                {locations.map((location) => (
                  <option key={location._id} value={location.name[locale]}>
                    {location.name[locale]}
                  </option>
                ))}
              </select>
              {errors.locations && (
                <p className="mt-1 text-sm text-red-600">{errors.locations.message}</p>
              )}
              {locations.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  {locale === 'en' ? 'Loading locations...' : 'جاري تحميل المواقع...'}
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