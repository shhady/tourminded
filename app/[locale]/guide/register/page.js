'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import MainLayout from '@/components/layout/MainLayout';
import ImageUploader from '@/components/ui/ImageUploader';
import Button from '@/components/ui/Button';
import { Loader } from 'lucide-react';

export default function GuideRegistrationPage({ params }) {
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams?.locale || 'en';
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [licenseImage, setLicenseImage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // Get the current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData.user);
          
          // If user is not a guide, redirect to home
          if (userData.user && userData.user.role !== 'guide') {
            console.log('User is not a guide, redirecting to home');
            router.push(`/${locale}`);
          }
        } else {
          console.log('User not authenticated, redirecting to login');
          // Redirect to login if not authenticated
          router.push(`/${locale}/auth/login?callbackUrl=/${locale}/guide/register`);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setError(locale === 'en' ? 'Failed to authenticate user' : 'فشل في مصادقة المستخدم');
      } finally {
        setIsPageLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, [locale, router]);
  
  const handleProfileImageUploaded = (url) => {
    setProfileImage(url);
  };
  
  const handleLicenseImageUploaded = (url) => {
    setLicenseImage(url);
  };
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    if (!profileImage) {
      setError(locale === 'en' ? 'Profile image is required' : 'صورة الملف الشخصي مطلوبة');
      setIsLoading(false);
      return;
    }
    
    if (!currentUser || !currentUser._id) {
      setError(locale === 'en' ? 'User authentication failed' : 'فشل مصادقة المستخدم');
      setIsLoading(false);
      return;
    }
    
    try {
      const guideData = {
        ...data,
        userId: currentUser._id,
        profileImage: {
          url: profileImage,
        },
        driverLicense: {
          ...data.driverLicense,
          image: {
            url: licenseImage,
          },
        },
        languages: [
          {
            language: data.primaryLanguage,
            proficiency: parseInt(data.primaryLanguageProficiency),
          },
        ],
        expertise: [
          {
            area: data.primaryExpertise,
            years: parseInt(data.primaryExpertiseYears),
          },
        ],
      };
      
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guideData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || `Guide registration failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Redirect to dashboard
      router.push(`/${locale}/dashboard/guide`);
    } catch (error) {
      console.error('Guide registration error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading state while fetching user
  if (isPageLoading) {
    return (
      <MainLayout locale={locale}>
        <div className="py-16 bg-secondary-50 min-h-screen">
          <div className="container mx-auto px-4 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <Loader className="w-12 h-12 text-primary-500 animate-spin mb-4" />
              <p className="text-lg text-secondary-700">
                {locale === 'en' ? 'Loading...' : 'جار التحميل...'}
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // If user is not authenticated or not a guide, the useEffect will handle redirection
  if (!currentUser || currentUser.role !== 'guide') {
    return null;
  }
  
  return (
    <MainLayout locale={locale} user={currentUser}>
      <div className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-secondary-900">
              {locale === 'en' ? 'Complete Your Guide Profile' : 'أكمل ملف المرشد الخاص بك'}
            </h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name (English) */}
                  <div>
                    <label htmlFor="nameEn" className="block text-sm font-medium text-secondary-700 mb-1">
                      {locale === 'en' ? 'Name (English)' : 'الاسم (بالإنجليزية)'}*
                    </label>
                    <input
                      id="nameEn"
                      type="text"
                      {...register('name.en', {
                        required: locale === 'en' ? 'Name in English is required' : 'الاسم بالإنجليزية مطلوب',
                      })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.name?.en && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.en.message}</p>
                    )}
                  </div>
                  
                  {/* Name (Arabic) */}
                  <div>
                    <label htmlFor="nameAr" className="block text-sm font-medium text-secondary-700 mb-1">
                      {locale === 'en' ? 'Name (Arabic)' : 'الاسم (بالعربية)'}*
                    </label>
                    <input
                      id="nameAr"
                      type="text"
                      {...register('name.ar', {
                        required: locale === 'en' ? 'Name in Arabic is required' : 'الاسم بالعربية مطلوب',
                      })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.name?.ar && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.ar.message}</p>
                    )}
                  </div>
                  
                  {/* Nickname */}
                  <div>
                    <label htmlFor="nickname" className="block text-sm font-medium text-secondary-700 mb-1">
                      {locale === 'en' ? 'Nickname' : 'اللقب'}
                    </label>
                    <input
                      id="nickname"
                      type="text"
                      {...register('nickname')}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1">
                      {locale === 'en' ? 'Phone Number' : 'رقم الهاتف'}*
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone', {
                        required: locale === 'en' ? 'Phone number is required' : 'رقم الهاتف مطلوب',
                      })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-secondary-700 mb-1">
                    {locale === 'en' ? 'Address' : 'العنوان'}*
                  </label>
                  <input
                    id="address"
                    type="text"
                    {...register('address', {
                      required: locale === 'en' ? 'Address is required' : 'العنوان مطلوب',
                    })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
                
                {/* About (English) */}
                <div>
                  <label htmlFor="aboutEn" className="block text-sm font-medium text-secondary-700 mb-1">
                    {locale === 'en' ? 'About (English)' : 'نبذة عنك (بالإنجليزية)'}*
                  </label>
                  <textarea
                    id="aboutEn"
                    rows="4"
                    {...register('about.en', {
                      required: locale === 'en' ? 'About section in English is required' : 'النبذة بالإنجليزية مطلوبة',
                    })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  ></textarea>
                  {errors.about?.en && (
                    <p className="mt-1 text-sm text-red-600">{errors.about.en.message}</p>
                  )}
                </div>
                
                {/* About (Arabic) */}
                <div>
                  <label htmlFor="aboutAr" className="block text-sm font-medium text-secondary-700 mb-1">
                    {locale === 'en' ? 'About (Arabic)' : 'نبذة عنك (بالعربية)'}*
                  </label>
                  <textarea
                    id="aboutAr"
                    rows="4"
                    {...register('about.ar', {
                      required: locale === 'en' ? 'About section in Arabic is required' : 'النبذة بالعربية مطلوبة',
                    })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  ></textarea>
                  {errors.about?.ar && (
                    <p className="mt-1 text-sm text-red-600">{errors.about.ar.message}</p>
                  )}
                </div>
                
                {/* Primary Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="primaryLanguage" className="block text-sm font-medium text-secondary-700 mb-1">
                      {locale === 'en' ? 'Primary Language' : 'اللغة الأساسية'}*
                    </label>
                    <select
                      id="primaryLanguage"
                      {...register('primaryLanguage', {
                        required: locale === 'en' ? 'Primary language is required' : 'اللغة الأساسية مطلوبة',
                      })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">{locale === 'en' ? 'Select a language' : 'اختر لغة'}</option>
                      <option value="English">{locale === 'en' ? 'English' : 'الإنجليزية'}</option>
                      <option value="Arabic">{locale === 'en' ? 'Arabic' : 'العربية'}</option>
                      <option value="Hebrew">{locale === 'en' ? 'Hebrew' : 'العبرية'}</option>
                      <option value="Spanish">{locale === 'en' ? 'Spanish' : 'الإسبانية'}</option>
                      <option value="French">{locale === 'en' ? 'French' : 'الفرنسية'}</option>
                    </select>
                    {errors.primaryLanguage && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryLanguage.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="primaryLanguageProficiency" className="block text-sm font-medium text-secondary-700 mb-1">
                      {locale === 'en' ? 'Proficiency Level' : 'مستوى الإتقان'}*
                    </label>
                    <select
                      id="primaryLanguageProficiency"
                      {...register('primaryLanguageProficiency', {
                        required: locale === 'en' ? 'Proficiency level is required' : 'مستوى الإتقان مطلوب',
                      })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">{locale === 'en' ? 'Select level' : 'اختر المستوى'}</option>
                      <option value="5">{locale === 'en' ? 'Native (5)' : 'اللغة الأم (5)'}</option>
                      <option value="4">{locale === 'en' ? 'Fluent (4)' : 'طلاقة (4)'}</option>
                      <option value="3">{locale === 'en' ? 'Advanced (3)' : 'متقدم (3)'}</option>
                      <option value="2">{locale === 'en' ? 'Intermediate (2)' : 'متوسط (2)'}</option>
                      <option value="1">{locale === 'en' ? 'Basic (1)' : 'أساسي (1)'}</option>
                    </select>
                    {errors.primaryLanguageProficiency && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryLanguageProficiency.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Primary Expertise */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="primaryExpertise" className="block text-sm font-medium text-secondary-700 mb-1">
                      {locale === 'en' ? 'Primary Expertise' : 'الخبرة الأساسية'}*
                    </label>
                    <select
                      id="primaryExpertise"
                      {...register('primaryExpertise', {
                        required: locale === 'en' ? 'Primary expertise is required' : 'الخبرة الأساسية مطلوبة',
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
                    {errors.primaryExpertise && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryExpertise.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="primaryExpertiseYears" className="block text-sm font-medium text-secondary-700 mb-1">
                      {locale === 'en' ? 'Years of Experience' : 'سنوات الخبرة'}*
                    </label>
                    <input
                      id="primaryExpertiseYears"
                      type="number"
                      min="1"
                      {...register('primaryExpertiseYears', {
                        required: locale === 'en' ? 'Years of experience is required' : 'سنوات الخبرة مطلوبة',
                        min: {
                          value: 1,
                          message: locale === 'en' ? 'Must be at least 1 year' : 'يجب أن تكون سنة واحدة على الأقل',
                        },
                      })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.primaryExpertiseYears && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryExpertiseYears.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    {locale === 'en' ? 'Profile Image' : 'صورة الملف الشخصي'}*
                  </label>
                  <ImageUploader
                    onImageUploaded={handleProfileImageUploaded}
                    folder="guides/profiles"
                  />
                  {!profileImage && (
                    <p className="mt-1 text-sm text-secondary-500">
                      {locale === 'en' ? 'Please upload a profile image' : 'يرجى تحميل صورة الملف الشخصي'}
                    </p>
                  )}
                </div>
                
                {/* Driver License */}
                <div className="border-t border-secondary-200 pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    {locale === 'en' ? 'Driver License (Optional)' : 'رخصة القيادة (اختياري)'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-secondary-700 mb-1">
                        {locale === 'en' ? 'License Number' : 'رقم الرخصة'}
                      </label>
                      <input
                        id="licenseNumber"
                        type="text"
                        {...register('driverLicense.number')}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="licenseDate" className="block text-sm font-medium text-secondary-700 mb-1">
                        {locale === 'en' ? 'Expiry Date' : 'تاريخ انتهاء الصلاحية'}
                      </label>
                      <input
                        id="licenseDate"
                        type="date"
                        {...register('driverLicense.date')}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      {locale === 'en' ? 'License Image' : 'صورة الرخصة'}
                    </label>
                    <ImageUploader
                      onImageUploaded={handleLicenseImageUploaded}
                      folder="guides/licenses"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? (locale === 'en' ? 'Submitting...' : 'جاري الإرسال...')
                      : (locale === 'en' ? 'Complete Registration' : 'إكمال التسجيل')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 