'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import MainLayout from '@/components/layout/MainLayout';
import ImageUploader from '@/components/ui/ImageUploader';
import Button from '@/components/ui/Button';
import { Loader, Plus, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import LanguageSelector from './LanguageSelector';

export default function GuideRegistrationPage({ params }) {
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams?.locale || 'en';
  const router = useRouter();
  
  const { user, isLoaded: isClerkLoaded } = useUser();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [redirectNeeded, setRedirectNeeded] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [vehicleImage, setVehicleImage] = useState('');
  
  // State for multiple languages
  const [languages, setLanguages] = useState([
    { language: '', proficiency: 5 }
  ]);
  
  // State for registration steps
  const [currentStep, setCurrentStep] = useState(1);
  const [languagesConfirmed, setLanguagesConfirmed] = useState(false);
  
  // Add this state for multiple expertise areas
  const [expertiseAreas, setExpertiseAreas] = useState([
    { area: '' }
  ]);
  const [licenseIssueDate, setLicenseIssueDate] = useState('');
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm();
  
  // Add a new language field
  const addLanguage = () => {
    setLanguages([...languages, { language: '', proficiency: 5 }]);
  };
  
  // Remove a language field
  const removeLanguage = (index) => {
    if (languages.length > 1) {
      const newLanguages = [...languages];
      newLanguages.splice(index, 1);
      setLanguages(newLanguages);
    }
  };
  
  // Update language value
  const updateLanguage = (index, field, value) => {
    const newLanguages = [...languages];
    newLanguages[index][field] = value;
    setLanguages(newLanguages);
  };
  
  // Confirm languages and move to next step
  const confirmLanguages = async () => {
    // Validate languages
    const validLanguages = languages.filter(lang => lang.language.trim() !== '');
    if (validLanguages.length === 0) {
      setError(locale === 'en' ? 'At least one language is required' : 'مطلوبة لغة واحدة على الأقل');
      return;
    }
    
    setLanguagesConfirmed(true);
    setCurrentStep(2);
    setError('');
  };
  
  // Go back to languages step
  const goBackToLanguages = () => {
    setLanguagesConfirmed(false);
    setCurrentStep(1);
  };
  
  // Move to next step
  const goToNextStep = async () => {
    let isValid = false;
    
    if (currentStep === 2) {
      // Validate name and about fields for each language
      const validLanguages = languages.filter(lang => lang.language.trim() !== '');
      const fieldsToValidate = validLanguages.flatMap(lang => [`name_${lang.language}`, `about_${lang.language}`]);
      
      isValid = await trigger(fieldsToValidate);
      
      if (isValid) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      // Validate expertise fields for all expertise areas
      const fieldsToValidate = expertiseAreas.flatMap((_, index) => [`expertise_${index}_area`]);
      // Also validate licenseIssueDate field
      fieldsToValidate.push('licenseIssueDate');
      
      isValid = await trigger(fieldsToValidate);
      
      if (isValid) {
        setCurrentStep(4);
      }
    }
  };
  
  // Go back to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Sync and get the current user from MongoDB using Clerk ID
  useEffect(() => {
    const syncAndFetchUser = async () => {
      if (!isClerkLoaded || !user) {
        setIsPageLoading(false);
        return;
      }
      
      try {
        // First, sync the user to MongoDB
        const syncResponse = await fetch('/api/users/sync');
        
        if (!syncResponse.ok) {
          throw new Error('Failed to sync user data');
        }
        
        const syncData = await syncResponse.json();
        console.log('User synced:', syncData);
        
        // Now fetch the MongoDB user
        const response = await fetch(`/api/users/clerk/${user.id}`);
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData.user);
          
          // Check if user is already a guide
          if (userData.user.role === 'guide') {
            setRedirectNeeded(true);
          }
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsPageLoading(false);
      }
    };
    
    syncAndFetchUser();
  }, [isClerkLoaded, user]);
  
  // Handle redirect if needed
  useEffect(() => {
    if (redirectNeeded) {
      router.push(`/${locale}/dashboard/guide`);
    }
  }, [redirectNeeded, router, locale]);
  
  // Replace the direct router.push call with useEffect
  // Add this useEffect near your other useEffect hooks
  useEffect(() => {
    if (isClerkLoaded && !user) {
      router.push(`/${locale}/sign-in`);
    }
  }, [isClerkLoaded, user, router, locale]);
  
  const handleProfileImageUploaded = (url) => {
    setProfileImage(url);
  };
  
  const handleCoverImageUploaded = (url) => {
    setCoverImage(url);
  };
  
  const handleVehicleImageUploaded = (url) => {
    setVehicleImage(url);
  };
  
  // Add functions to manage expertise areas
  const addExpertiseArea = () => {
    setExpertiseAreas([...expertiseAreas, { area: '' }]);
  };
  
  const removeExpertiseArea = (index) => {
    if (expertiseAreas.length > 1) {
      const newExpertiseAreas = [...expertiseAreas];
      newExpertiseAreas.splice(index, 1);
      setExpertiseAreas(newExpertiseAreas);
    }
  };
  
  const updateExpertiseArea = (index, field, value) => {
    const newExpertiseAreas = [...expertiseAreas];
    newExpertiseAreas[index][field] = value;
    setExpertiseAreas(newExpertiseAreas);
  };
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    if (!profileImage) {
      setError(locale === 'en' ? 'Profile image is required' : 'صورة الملف الشخصي مطلوبة');
      setIsLoading(false);
      return;
    }
    
    // Validate languages
    const validLanguages = languages.filter(lang => lang.language.trim() !== '');
    if (validLanguages.length === 0) {
      setError(locale === 'en' ? 'At least one language is required' : 'مطلوبة لغة واحدة على الأقل');
      setIsLoading(false);
      return;
    }
    
    try {
      // Create names array from language-specific name fields
      const names = validLanguages.map(lang => ({
        language: lang.language,
        value: data[`name_${lang.language}`]
      }));
      
      // Create aboutSections array from language-specific about fields
      const aboutSections = validLanguages.map(lang => ({
        language: lang.language,
        content: data[`about_${lang.language}`]
      }));
      
      // Create expertise array from state (areas and optional descriptions)
      const expertise = expertiseAreas.map((exp) => ({
        area: exp.area,
        expertiseAreaDescriptionEn: exp.expertiseAreaDescriptionEn || '',
        expertiseAreaDescriptionAr: exp.expertiseAreaDescriptionAr || ''
      }));
      
      const guideData = {
        names: names,
        nickname: data.nickname,
        address: data.address,
        phone: data.phone,
        profileImage: {
          url: profileImage,
        },
        coverImage: {
          url: coverImage,
        },
        vehicle: {
          type: data.vehicleType,
          model: data.vehicleModel,
          year: data.vehicleYear ? parseInt(data.vehicleYear) : undefined,
          capacity: data.vehicleCapacity ? parseInt(data.vehicleCapacity) : undefined,
          image: {
            url: vehicleImage,
          },
        },
        // Only send language codes, not numeric proficiency (server computes ratings later)
        languages: validLanguages.map(l => ({ language: l.language })),
        expertise: expertise,
        licenseIssueDate: data['licenseIssueDate'],
        aboutSections: aboutSections
      };
      
      console.log('Submitting guide data:', guideData);
      
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guideData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to register as guide');
      }
      
      // Redirect to registration success page instead of dashboard
      router.push(`/${locale}/guide/registration-success`);
      
    } catch (error) {
      console.error('Error registering guide:', error);
      setError(error.message || (locale === 'en' ? 'Failed to register as guide' : 'فشل التسجيل كمرشد'));
      setIsLoading(false);
    }
  };
  
  // Then change your render condition to just return null without the router.push
  // If user is not authenticated, show nothing while redirect happens
  if (!user && isClerkLoaded) {
    return null;
  }
  
  // If page is loading, show loading spinner
  if (isPageLoading) {
    return (
      <MainLayout locale={locale}>
        <div className="flex justify-center items-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </MainLayout>
    );
  }
  
  // If we couldn't fetch the MongoDB user, show an error
  if (!user && !isPageLoading && !currentUser) {
    return (
      <MainLayout locale={locale}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-secondary-800 mb-4">
                {locale === 'en' ? 'User Not Found' : 'المستخدم غير موجود'}
              </h1>
              <p className="text-secondary-600 mb-6">
                {locale === 'en'
                  ? "We couldn't find your user profile. Please try again or contact support."
                  : "لم نتمكن من العثور على ملف المستخدم الخاص بك. يرجى المحاولة مرة أخرى أو الاتصال بالدعم."}
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="mr-4"
                >
                  {locale === 'en' ? 'Try Again' : 'حاول مرة أخرى'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${locale}`)}
                >
                  {locale === 'en' ? 'Go Home' : 'الذهاب إلى الصفحة الرئيسية'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout locale={locale}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-secondary-800 mb-4">
              {locale === 'en' ? 'Guide Registration' : 'تسجيل المرشد'}
            </h1>
            
            <div className="mb-6">
              <div className="flex items-center mb-6">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-gray-500 text-white' : 'bg-secondary-200 text-secondary-600'} mr-2`}>
                  1
                </div>
                <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-gray-500' : 'bg-secondary-200'} mx-2`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-gray-500 text-white' : 'bg-secondary-200 text-secondary-600'} mx-2`}>
                  2
                </div>
                <div className={`h-1 flex-1 ${currentStep >= 3 ? 'bg-gray-500' : 'bg-secondary-200'} mx-2`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-gray-500 text-white' : 'bg-secondary-200 text-secondary-600'} mx-2`}>
                  3
                </div>
                <div className={`h-1 flex-1 ${currentStep >= 4 ? 'bg-gray-500' : 'bg-secondary-200'} mx-2`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 4 ? 'bg-gray-500 text-white' : 'bg-secondary-200 text-secondary-600'} ml-2`}>
                  4
                </div>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="bg-secondary-50 p-4 rounded-lg mb-6">
                <p className="text-secondary-700">
                  {locale === 'en'
                    ? 'Complete this form to register as a guide. You will need to provide your personal information, expertise, and upload necessary documents.'
                    : 'أكمل هذا النموذج للتسجيل كمرشد. ستحتاج إلى تقديم معلوماتك الشخصية وخبرتك وتحميل المستندات اللازمة.'}
                </p>
              </div>
              
              <div className="bg-white">
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Step 1: Languages */}
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">
                        {locale === 'en' ? 'Languages' : 'اللغات'}
                      </h2>
                      <p className="text-secondary-600 mb-4">
                        {locale === 'en'
                          ? 'Add all languages you speak and your proficiency level.'
                          : 'أضف جميع اللغات التي تتحدثها ومستوى إتقانك.'}
                      </p>
                      
                      {languages.map((lang, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 mb-4 p-4 border border-secondary-200 rounded-lg">
                          <div className="flex-1">
                            <label htmlFor={`language-${index}`} className="block text-sm font-medium text-secondary-700 mb-1">
                              {locale === 'en' ? 'Language' : 'اللغة'}*
                            </label>
                            <LanguageSelector 
                              value={lang.language}
                              onChange={(value) => updateLanguage(index, 'language', value)}
                              locale={locale}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <label htmlFor={`proficiency-${index}`} className="block text-sm font-medium text-secondary-700 mb-1">
                              {locale === 'en' ? 'Proficiency (1-5)' : 'مستوى الإتقان (1-5)'}
                            </label>
                            <select
                              id={`proficiency-${index}`}
                              value={lang.proficiency}
                              onChange={(e) => updateLanguage(index, 'proficiency', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="1">1 - {locale === 'en' ? 'Basic' : 'أساسي'}</option>
                              <option value="2">2 - {locale === 'en' ? 'Elementary' : 'مبتدئ'}</option>
                              <option value="3">3 - {locale === 'en' ? 'Intermediate' : 'متوسط'}</option>
                              <option value="4">4 - {locale === 'en' ? 'Advanced' : 'متقدم'}</option>
                              <option value="5">5 - {locale === 'en' ? 'Fluent/Native' : 'طلاقة/لغة أم'}</option>
                            </select>
                          </div>
                          
                          {languages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLanguage(index)}
                              className="inline-flex items-center justify-center p-2 text-red-500 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <div className="mb-6">
                            <Button
                 type="button"
                variant="outline"
                onClick={addLanguage}
               >
                <div className="flex items-center gap-1">
           <Plus className="w-4 h-4" />
           <span className="text-sm">{locale === 'en' ? 'Add Another Language' : 'إضافة لغة أخرى'}</span>
           </div>
                </Button>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={confirmLanguages}
                        >
                          <div className="flex items-center gap-1">
                          {locale === 'en' ? 'Continue' : 'متابعة'}
                          <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Personal Information */}
                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">
                        {locale === 'en' ? 'Personal Information' : 'المعلومات الشخصية'}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="nickname" className="block text-sm font-medium text-secondary-700 mb-1">
                            {locale === 'en' ? 'Nickname (Optional)' : 'اللقب (اختياري)'}
                          </label>
                          <input
                            id="nickname"
                            type="text"
                            {...register('nickname')}
                            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        
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
                      
                      <div className="mb-6">
                        <label htmlFor="address" className="block text-sm font-medium text-secondary-700 mb-1">
                          {locale === 'en' ? 'City you\'re from (shown on profile)' : 'المدينة التي أنت منها (معروضة على الملف الشخصي)'}*
                        </label>
                        <input
                          id="address"
                          type="text"
                          {...register('address', {
                            required: locale === 'en' ? 'City is required' : 'المدينة مطلوبة',
                          })}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                        )}
                      </div>
                      
                      {/* Dynamic Name and About fields based on selected languages */}
                      {languages.filter(lang => lang.language.trim() !== '').map((lang, index) => (
                        <div key={`name_about_${index}`} className="border-t border-secondary-200 pt-6 mt-6">
                          <h3 className="text-lg font-medium mb-4">
                            {locale === 'en' 
                              ? `Information in ${lang.language}` 
                              : `المعلومات باللغة ${lang.language}`}
                          </h3>
                          
                          <div className="mb-4">
                            <label htmlFor={`name_${lang.language}`} className="block text-sm font-medium text-secondary-700 mb-1">
                              {locale === 'en' ? `Name in ${lang.language}` : `الاسم باللغة ${lang.language}`}*
                            </label>
                            <input
                              id={`name_${lang.language}`}
                              type="text"
                              {...register(`name_${lang.language}`, {
                                required: locale === 'en' 
                                  ? `Name in ${lang.language} is required` 
                                  : `الاسم باللغة ${lang.language} مطلوب`
                              })}
                              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {errors[`name_${lang.language}`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`name_${lang.language}`].message}</p>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor={`about_${lang.language}`} className="block text-sm font-medium text-secondary-700 mb-1">
                              {locale === 'en' ? `About in ${lang.language}` : `نبذة عنك باللغة ${lang.language}`}*
                            </label>
                            <textarea
                              id={`about_${lang.language}`}
                              {...register(`about_${lang.language}`, {
                                required: locale === 'en' 
                                  ? `About section in ${lang.language} is required` 
                                  : `النبذة باللغة ${lang.language} مطلوبة`
                              })}
                              rows="5"
                              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            ></textarea>
                            {errors[`about_${lang.language}`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`about_${lang.language}`].message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goBackToLanguages}
                        >
                          <div className="flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          {locale === 'en' ? 'Back' : 'رجوع'}
                          </div>
                        </Button>
                        
                        <Button
                          type="button"
                          onClick={goToNextStep}
                        >
                          <div className="flex items-center gap-1">
                          {locale === 'en' ? 'Continue' : 'متابعة'}
                          <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Expertise */}
                  {currentStep === 3 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">
                        {locale === 'en' ? 'Expertise & Experience' : 'الخبرة والتجربة'}
                      </h2>

                      {/* License Issue Date (separate) */}
                      <div className="mb-6 p-4 border border-secondary-200 rounded-md">
                        <label htmlFor="licenseIssueDate" className="block text-sm font-medium text-secondary-700 mb-1">
                          {locale === 'en' ? 'License Issue Date' : 'تاريخ إصدار الرخصة'}*
                        </label>
                        <input
                          id="licenseIssueDate"
                          type="date"
                          {...register('licenseIssueDate', {
                            required: locale === 'en' ? 'License issue date is required' : 'تاريخ إصدار الرخصة مطلوب',
                            validate: value => {
                              const issueDate = new Date(value);
                              const today = new Date();
                              return issueDate <= today || 
                                (locale === 'en' ? 'Issue date cannot be in the future' : 'لا يمكن أن يكون تاريخ الإصدار في المستقبل');
                            }
                          })}
                          value={licenseIssueDate}
                          onChange={(e) => setLicenseIssueDate(e.target.value)}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          max={new Date().toISOString().split('T')[0]}
                        />
                        {errors['licenseIssueDate'] && (
                          <p className="mt-1 text-sm text-red-600">{errors['licenseIssueDate'].message}</p>
                        )}
                        <p className="mt-1 text-xs text-secondary-500">
                          {locale === 'en' 
                            ? 'Years of experience will be calculated from this date' 
                            : 'سيتم احتساب سنوات الخبرة من هذا التاريخ'}
                        </p>
                      </div>
                      
                      {/* Multiple Expertise Areas */}
                      {expertiseAreas.map((expertise, index) => (
                        <div key={`expertise_${index}`} className="mb-6 p-4 border border-secondary-200 rounded-md">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">
                              {locale === 'en' ? `Expertise Area ${index + 1}` : `مجال الخبرة ${index + 1}`}
                            </h3>
                            
                            {expertiseAreas.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExpertiseArea(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label htmlFor={`expertise_${index}_area`} className="block text-sm font-medium text-secondary-700 mb-1">
                                {locale === 'en' ? 'Expertise Area' : 'مجال الخبرة'}*
                              </label>
                              <select
                                id={`expertise_${index}_area`}
                                {...register(`expertise_${index}_area`, {
                                  required: locale === 'en' ? 'Expertise area is required' : 'مجال الخبرة مطلوب',
                                })}
                                value={expertise.area}
                                onChange={(e) => updateExpertiseArea(index, 'area', e.target.value)}
                                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <option value="">{locale === 'en' ? 'Select expertise' : 'اختر الخبرة'}</option>
                                <option value="Christian">{locale === 'en' ? 'Christian' : 'مسيحي'}</option>
                                <option value="Jewish">{locale === 'en' ? 'Jewish' : 'يهودي'}</option>
                                <option value="Muslim">{locale === 'en' ? 'Muslim' : 'إسلامي'}</option>
                                <option value="Political">{locale === 'en' ? 'Political' : 'سياسي'}</option>
                                <option value="Historical">{locale === 'en' ? 'Historical' : 'تاريخي'}</option>
                                <option value="Cultural">{locale === 'en' ? 'Cultural' : 'ثقافي'}</option>
                                <option value="Food">{locale === 'en' ? 'Food' : 'طعام'}</option>
                                <option value="Adventure">{locale === 'en' ? 'Adventure' : 'مغامرة'}</option>
                                <option value="Nature">{locale === 'en' ? 'Nature' : 'طبيعة'}</option>
                                <option value="Photography">{locale === 'en' ? 'Photography' : 'تصوير'}</option>
                                <option value="Culinary">{locale === 'en' ? 'Culinary' : 'طهي'}</option>
                                <option value="All-inclusive">{locale === 'en' ? 'All-inclusive' : 'شامل'}</option>
                              </select>
              
                              {errors[`expertise_${index}_area`] && (
                                <p className="mt-1 text-sm text-red-600">{errors[`expertise_${index}_area`].message}</p>
                              )}
                            </div>
                            
                            {/* Optional descriptions per expertise area */}
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                {locale === 'en' ? 'Description (English) - optional' : 'الوصف (بالإنجليزية) - اختياري'}
                              </label>
                              <textarea
                                rows="3"
                                value={expertise.expertiseAreaDescriptionEn || ''}
                                onChange={(e) => updateExpertiseArea(index, 'expertiseAreaDescriptionEn', e.target.value)}
                                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder={locale === 'en' ? 'Describe this expertise (optional)...' : 'صف مجال الخبرة (اختياري)...'}
                              ></textarea>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                {locale === 'en' ? 'Description (Arabic) - optional' : 'الوصف (بالعربية) - اختياري'}
                              </label>
                              <textarea
                                rows="3"
                                dir="rtl"
                                value={expertise.expertiseAreaDescriptionAr || ''}
                                onChange={(e) => updateExpertiseArea(index, 'expertiseAreaDescriptionAr', e.target.value)}
                                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder={locale === 'en' ? 'Optional Arabic description...' : 'وصف اختياري بالعربية...'}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addExpertiseArea}
                        className="mb-6"
                      >
                        <div className="flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          <span className="text-sm">{locale === 'en' ? 'Add Another Expertise Area' : 'إضافة مجال خبرة آخر'}</span>
                        </div>
                      </Button>
                      
                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goToPreviousStep}
                        >
                          <div className="flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            {locale === 'en' ? 'Back' : 'رجوع'}
                          </div>
                        </Button>
                        
                        <Button
                          type="button"
                          onClick={goToNextStep}
                        >
                          <div className="flex items-center gap-1">
                            {locale === 'en' ? 'Continue' : 'متابعة'}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 4: Images and Vehicle */}
                  {currentStep === 4 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">
                        {locale === 'en' ? 'Images & Vehicle' : 'الصور والمركبة'}
                      </h2>
                      
                      {/* Profile Image */}
                      <div className="mb-6">
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
                      
                      {/* Cover Image */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          {locale === 'en' ? 'Cover Image' : 'صورة الغلاف'}
                        </label>
                        <ImageUploader
                          onImageUploaded={handleCoverImageUploaded}
                          folder="guides/covers"
                        />
                      </div>
                      
                      {/* Vehicle */}
                      <div className="border-t border-secondary-200 pt-6">
                        <h3 className="text-lg font-medium mb-4">
                          {locale === 'en' ? 'Vehicle (Optional)' : 'المركبة (اختياري)'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <label htmlFor="vehicleType" className="block text-sm font-medium text-secondary-700 mb-1">
                              {locale === 'en' ? 'Vehicle Type' : 'نوع المركبة'}
                            </label>
                            <input
                              id="vehicleType"
                              type="text"
                              {...register('vehicleType')}
                              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="vehicleModel" className="block text-sm font-medium text-secondary-700 mb-1">
                              {locale === 'en' ? 'Vehicle Model' : 'موديل المركبة'}
                            </label>
                            <input
                              id="vehicleModel"
                              type="text"
                              {...register('vehicleModel')}
                              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <label htmlFor="vehicleYear" className="block text-sm font-medium text-secondary-700 mb-1">
                              {locale === 'en' ? 'Vehicle Year' : 'سنة المركبة'}
                            </label>
                            <input
                              id="vehicleYear"
                              type="text"
                              {...register('vehicleYear')}
                              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="vehicleCapacity" className="block text-sm font-medium text-secondary-700 mb-1">
                              {locale === 'en' ? 'Vehicle Capacity' : 'السعة المركبة'}
                            </label>
                            <input
                              id="vehicleCapacity"
                              type="text"
                              {...register('vehicleCapacity')}
                              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            {locale === 'en' ? 'Vehicle Image' : 'صورة المركبة'}
                          </label>
                          <ImageUploader
                            onImageUploaded={handleVehicleImageUploaded}
                            folder="guides/vehicles"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goToPreviousStep}
                        >
                          <div className="flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          {locale === 'en' ? 'Back' : 'رجوع'}
                          </div>
                        </Button>
                        
                        <Button
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading
                            ? (locale === 'en' ? 'Submitting...' : 'جاري الإرسال...')
                            : (locale === 'en' ? 'Complete Registration' : 'إكمال التسجيل')}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
        </div>
      </MainLayout>
    );
}