'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser as useClerkUser, UserButton } from '@clerk/nextjs';
import { useUser } from '@/contexts/UserContext';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Loader, User, Shield, MapPin, Phone, Mail, Globe, BookOpen, ArrowUpRight, ArrowLeft, Clock } from 'lucide-react';

export default function ProfilePage({ params }) {
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams?.locale || 'en';
  const router = useRouter();
  
  const { isSignedIn, isLoaded: clerkLoaded, user: clerkUser } = useClerkUser();
  const { user, loading: userContextLoading } = useUser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [guideData, setGuideData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [guideFormData, setGuideFormData] = useState({
    nickname: '',
    about: { en: '', ar: '' },
    languages: [],
    expertise: [],
    profileImage: { url: '' },
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Translations
  const t = {
    en: {
      title: 'My Profile',
      userInfo: 'User Information',
      guideInfo: 'Guide Information',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Address',
      save: 'Save Changes',
      saving: 'Saving...',
      success: 'Profile updated successfully',
      error: 'Failed to update profile',
      loading: 'Loading profile...',
      nickname: 'Nickname',
      aboutEn: 'About (English)',
      aboutAr: 'About (Arabic)',
      languages: 'Languages',
      expertise: 'Areas of Expertise',
      profileImage: 'Profile Image',
      status: 'Guide Status',
      active: 'Active',
      pending: 'Pending Approval',
      accountTab: 'Account',
      guideTab: 'Guide Profile',
      securityTab: 'Security',
      passwordInfo: 'Password management is handled through your Clerk account.',
      manageAccount: 'Manage Account Security',
    },
    ar: {
      title: 'الملف الشخصي',
      userInfo: 'معلومات المستخدم',
      guideInfo: 'معلومات المرشد',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      address: 'العنوان',
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      success: 'تم تحديث الملف الشخصي بنجاح',
      error: 'فشل تحديث الملف الشخصي',
      loading: 'جاري تحميل الملف الشخصي...',
      nickname: 'الاسم المستعار',
      aboutEn: 'نبذة (بالإنجليزية)',
      aboutAr: 'نبذة (بالعربية)',
      languages: 'اللغات',
      expertise: 'مجالات الخبرة',
      profileImage: 'صورة الملف الشخصي',
      status: 'حالة المرشد',
      active: 'نشط',
      pending: 'في انتظار الموافقة',
      accountTab: 'الحساب',
      guideTab: 'ملف المرشد',
      securityTab: 'الأمان',
      passwordInfo: 'تتم إدارة كلمة المرور من خلال حساب Clerk الخاص بك.',
      manageAccount: 'إدارة أمان الحساب',
    }
  }[locale] || {
    en: {
      // Default English translations as fallback
    }
  };
  
  // Fetch user and guide data
  useEffect(() => {
    const fetchData = async () => {
      if (!isSignedIn || !clerkLoaded || userContextLoading) {
        return;
      }
      
      try {
        // Set basic user data from context
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
          });
          
          // If user is a guide, fetch guide data
          if (user.role === 'guide' && user._id) {
            const response = await fetch(`/api/guides/user/${user._id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.guide) {
                setGuideData(data.guide);
                setGuideFormData({
                  nickname: data.guide.nickname || '',
                  about: {
                    en: data.guide.about?.en || '',
                    ar: data.guide.about?.ar || '',
                  },
                  languages: data.guide.languages || [],
                  expertise: data.guide.expertise || [],
                  profileImage: data.guide.profileImage || { url: '' },
                });
                setFormData(prev => ({
                  ...prev,
                  phone: data.guide.phone || user.phone || '',
                  address: data.guide.address || user.address || ''
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isSignedIn, clerkLoaded, user, userContextLoading]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      router.push(`/${locale}/sign-in?callbackUrl=/${locale}/profile`);
    }
  }, [clerkLoaded, isSignedIn, locale, router]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGuideInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'aboutEn' || name === 'aboutAr') {
      setGuideFormData(prev => ({
        ...prev,
        about: {
          ...prev.about,
          [name === 'aboutEn' ? 'en' : 'ar']: value
        }
      }));
    } else {
      setGuideFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleProfileImageUploaded = (url) => {
    setGuideFormData(prev => ({
      ...prev,
      profileImage: { url }
    }));
  };
  
  const handleLanguageChange = (index, field, value) => {
    const updatedLanguages = [...guideFormData.languages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value
    };
    
    setGuideFormData({
      ...guideFormData,
      languages: updatedLanguages
    });
  };
  
  const addLanguage = () => {
    setGuideFormData({
      ...guideFormData,
      languages: [...guideFormData.languages, { language: '', proficiency: 3 }]
    });
  };
  
  const removeLanguage = (index) => {
    const updatedLanguages = [...guideFormData.languages];
    updatedLanguages.splice(index, 1);
    
    setGuideFormData({
      ...guideFormData,
      languages: updatedLanguages
    });
  };
  
  const handleExpertiseChange = (index, field, value) => {
    const updatedExpertise = [...guideFormData.expertise];
    updatedExpertise[index] = {
      ...updatedExpertise[index],
      [field]: value
    };
    
    setGuideFormData({
      ...guideFormData,
      expertise: updatedExpertise
    });
  };
  
  const addExpertise = () => {
    setGuideFormData({
      ...guideFormData,
      expertise: [...guideFormData.expertise, { area: '', years: 1 }]
    });
  };
  
  const removeExpertise = (index) => {
    const updatedExpertise = [...guideFormData.expertise];
    updatedExpertise.splice(index, 1);
    
    setGuideFormData({
      ...guideFormData,
      expertise: updatedExpertise
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Determine which form is being submitted
      const isGuideForm = e.currentTarget.contains(document.querySelector('[name="nickname"]'));
      
      if (isGuideForm && guideData) {
        // Handle guide form submission - update both guide and user data
        
        // First update user data (phone and address)
        const userUpdateData = {
          phone: formData.phone,
          address: formData.address,
        };
        
        console.log('Submitting user update with data:', userUpdateData);
        
        const userResponse = await fetch(`/api/users/${user._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userUpdateData),
        });
        
        if (!userResponse.ok) {
          throw new Error(t.error);
        }
        
        // Then update guide data
        const guideUpdateData = {
          nickname: guideFormData.nickname,
          about: guideFormData.about,
          profileImage: guideFormData.profileImage,
          languages: guideFormData.languages,
          expertise: guideFormData.expertise,
          phone: formData.phone,
          address: formData.address
        };
        
        const guideResponse = await fetch(`/api/guides/${guideData._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(guideUpdateData),
        });
        
        if (!guideResponse.ok) {
          throw new Error(t.error);
        }
        
        setSuccess(t.success);
      } else {
        // Handle regular user form submission
        const userUpdateData = {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        };
        
        console.log('Submitting user update with data:', userUpdateData);
        
        const response = await fetch(`/api/users/${user._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userUpdateData),
        });
        
        if (!response.ok) {
          throw new Error(t.error);
        }
        
        setSuccess(t.success);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || t.error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading || !clerkLoaded || userContextLoading) {
    return (
      <MainLayout locale={locale}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-secondary-700">{t.loading}</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout locale={locale}>
      <div className="py-16 bg-secondary-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-secondary-900 mb-8">
              {t.title}
            </h1>
            
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="account">{t.accountTab}</TabsTrigger>
                {user?.role === 'guide' && (
                  <TabsTrigger value="guide">{t.guideTab}</TabsTrigger>
                )}
                <TabsTrigger value="security">{t.securityTab}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary-500" />
                    {t.userInfo}
                  </h2>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                      {success}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          {t.name}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          {t.email}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          disabled
                        />
                        <p className="text-xs text-secondary-500 mt-1">
                          {locale === 'en' ? 'Email cannot be changed' : 'لا يمكن تغيير البريد الإلكتروني'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          {t.phone}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          {t.address}
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSaving}
                      >
                        {isSaving ? t.saving : t.save}
                      </Button>
                    </div>
                  </form>
                </div>
              </TabsContent>
              
              {user?.role === 'guide' && (
                <TabsContent value="guide">
                  <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
                      <User className="mr-2 h-5 w-5 text-primary-500" />
                      {t.guideInfo}
                    </h2>
                    
                    {guideData?.active === false && (
                      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 flex items-start">
                        <Clock className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{locale === 'en' ? 'Pending Approval' : 'في انتظار الموافقة'}</p>
                          <p className="text-sm mt-1">
                            {locale === 'en' 
                              ? 'Your guide profile is pending approval from administrators. You can still update your information.' 
                              : 'ملف المرشد الخاص بك في انتظار الموافقة من المسؤولين. لا يزال بإمكانك تحديث معلوماتك.'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                        {success}
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            {t.nickname}
                          </label>
                          <input
                            type="text"
                            name="nickname"
                            value={guideFormData.nickname}
                            onChange={handleGuideInputChange}
                            className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            {t.phone}
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            {t.address}
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            {t.profileImage}
                          </label>
                          <div className="flex items-center space-x-4">
                            {guideFormData.profileImage?.url && (
                              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary-100">
                                <img 
                                  src={guideFormData.profileImage.url} 
                                  alt="Profile" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <ImageUploader 
                              onImageUploaded={handleProfileImageUploaded}
                              folder="guides"
                              buttonText={locale === 'en' ? 'Upload Image' : 'رفع صورة'}
                            />
                          </div>
                        </div>
                        
                        {/* Languages section */}
                        <div className="md:col-span-2">
                          <h3 className="text-lg font-medium text-secondary-900 mb-3 flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-primary-500" />
                            {t.languages}
                          </h3>
                          
                          {guideFormData.languages.map((lang, index) => (
                            <div key={index} className="flex items-center gap-4 mb-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  name={`language-${index}`}
                                  value={lang.language}
                                  onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                                  placeholder={locale === 'en' ? 'Language' : 'اللغة'}
                                  className="w-full px-4 py-2 border border-secondary-300 rounded-md"
                                />
                              </div>
                              <div className="flex-1">
                                <select
                                  name={`proficiency-${index}`}
                                  value={lang.proficiency}
                                  onChange={(e) => handleLanguageChange(index, 'proficiency', parseInt(e.target.value))}
                                  className="w-full px-4 py-2 border border-secondary-300 rounded-md"
                                >
                                  <option value="1">{locale === 'en' ? 'Basic' : 'أساسي'}</option>
                                  <option value="2">{locale === 'en' ? 'Intermediate' : 'متوسط'}</option>
                                  <option value="3">{locale === 'en' ? 'Advanced' : 'متقدم'}</option>
                                  <option value="4">{locale === 'en' ? 'Fluent' : 'طلاقة'}</option>
                                  <option value="5">{locale === 'en' ? 'Native' : 'اللغة الأم'}</option>
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeLanguage(index)}
                                className="p-2 text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={addLanguage}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-800 flex items-center"
                          >
                            + {locale === 'en' ? 'Add Language' : 'إضافة لغة'}
                          </button>
                        </div>
                        
                        {/* Expertise section */}
                        <div className="md:col-span-2">
                          <h3 className="text-lg font-medium text-secondary-900 mb-3 flex items-center">
                            <BookOpen className="mr-2 h-4 w-4 text-primary-500" />
                            {t.expertise}
                          </h3>
                          
                          {guideFormData.expertise.map((exp, index) => (
                            <div key={index} className="flex items-center gap-4 mb-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  name={`area-${index}`}
                                  value={exp.area}
                                  onChange={(e) => handleExpertiseChange(index, 'area', e.target.value)}
                                  placeholder={locale === 'en' ? 'Area of Expertise' : 'مجال الخبرة'}
                                  className="w-full px-4 py-2 border border-secondary-300 rounded-md"
                                />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="number"
                                  name={`years-${index}`}
                                  value={exp.years}
                                  onChange={(e) => handleExpertiseChange(index, 'years', parseInt(e.target.value))}
                                  placeholder={locale === 'en' ? 'Years of Experience' : 'سنوات الخبرة'}
                                  min="0"
                                  className="w-full px-4 py-2 border border-secondary-300 rounded-md"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExpertise(index)}
                                className="p-2 text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={addExpertise}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-800 flex items-center"
                          >
                            + {locale === 'en' ? 'Add Expertise' : 'إضافة مجال خبرة'}
                          </button>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            {t.aboutEn}
                          </label>
                          <textarea
                            name="aboutEn"
                            value={guideFormData.about.en}
                            onChange={handleGuideInputChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            {t.aboutAr}
                          </label>
                          <textarea
                            name="aboutAr"
                            value={guideFormData.about.ar}
                            onChange={handleGuideInputChange}
                            rows={4}
                            dir="rtl"
                            className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isSaving}
                        >
                          {isSaving ? t.saving : t.save}
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="security">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary-500" />
                    {locale === 'en' ? 'Security Settings' : 'إعدادات الأمان'}
                  </h2>
                  
                  <p className="text-secondary-700 mb-6">
                    {t.passwordInfo}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <UserButton/> 
                    <ArrowLeft size={16}/>
                    <span className="text-sm text-secondary-600">
                      {locale === 'en' ? 'Click to manage your account' : 'انقر لإدارة حسابك'}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}