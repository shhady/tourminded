'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser as useClerkUser, UserButton } from '@clerk/nextjs';
import { useUser } from '@/contexts/UserContext';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Loader, User, Shield, MapPin, Phone, Mail, Globe, BookOpen, ArrowUpRight, ArrowLeft, Clock, X, Plus } from 'lucide-react';
import GuideProfileUpdateForm from '@/components/guide/GuideProfileUpdateForm';

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
  
  // Add these state variables
  const [languages, setLanguages] = useState([
    { language: 'en', proficiency: 5 }
  ]);

  const [expertiseAreas, setExpertiseAreas] = useState([
    { area: '', licenseIssueDate: '' }
  ]);
  
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
    const fetchGuideData = async () => {
      if (!user || user.role !== 'guide') {
        setIsLoading(false); // Set loading to false if not a guide
        return;
      }
      
      try {
        setIsLoading(true); // Set loading to true before fetching
        const response = await fetch('/api/guides/me');
        if (response.ok) {
          const data = await response.json();
          
          // Set guide data
          setGuideData(data.guide);
          
          // Initialize languages from guide data
          if (data.guide.languages && data.guide.languages.length > 0) {
            setLanguages(data.guide.languages);
          }
          
          // Initialize expertise areas from guide data
          if (data.guide.expertise && data.guide.expertise.length > 0) {
            setExpertiseAreas(data.guide.expertise);
          }
          
          // Initialize names and about sections
          if (data.guide.names) {
            data.guide.names.forEach(name => {
              setFormData(prev => ({
                ...prev,
                [`name_${name.language}`]: name.value
              }));
            });
          }
          
          if (data.guide.aboutSections) {
            data.guide.aboutSections.forEach(about => {
              setFormData(prev => ({
                ...prev,
                [`about_${about.language}`]: about.content
              }));
            });
          }
          
          // Set other guide form data
          setFormData(prev => ({
            ...prev,
            nickname: data.guide.nickname || '',
            phone: data.guide.phone || '',
            address: data.guide.address || '',
          }));
          
          // Set profile image
          if (data.guide.profileImage?.url) {
            setGuideFormData(prev => ({
              ...prev,
              profileImage: { url: data.guide.profileImage.url }
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching guide data:', error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };
    
    // Set loading to false if user data is not yet loaded
    if (userContextLoading) {
      setIsLoading(true);
    } else {
      fetchGuideData();
    }
  }, [user, userContextLoading]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      router.push(`/${locale}/sign-in?callbackUrl=/${locale}/profile`);
    }
  }, [clerkLoaded, isSignedIn, locale, router]);
  
  // Update the useEffect that fetches user data to properly handle the name
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn || !clerkLoaded) {
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch user data from our API
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          
          // Set user form data with proper name handling
          const fullName = data.user.firstName && data.user.lastName 
            ? `${data.user.firstName} ${data.user.lastName}` 
            : clerkUser?.fullName || '';
          
          setFormData({
            name: fullName,
            email: clerkUser?.emailAddresses[0]?.emailAddress || '',
            phone: data.user.phone || '',
            address: data.user.address || '',
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [isSignedIn, clerkLoaded, clerkUser]);
  
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
    setLanguages([...languages, { language: '', proficiency: 5 }]);
  };
  
  const removeLanguage = (index) => {
    if (languages.length > 1) {
      const newLanguages = [...languages];
      const removedLanguage = newLanguages[index].language;
      newLanguages.splice(index, 1);
      setLanguages(newLanguages);
      
      // Clear form values for the removed language
      if (removedLanguage) {
        setValue(`name_${removedLanguage}`, '');
        setValue(`about_${removedLanguage}`, '');
      }
    }
  };
  
  const updateLanguage = (index, field, value) => {
    const newLanguages = [...languages];
    
    // If changing language, clear previous language form values
    if (field === 'language' && newLanguages[index].language) {
      setValue(`name_${newLanguages[index].language}`, '');
      setValue(`about_${newLanguages[index].language}`, '');
    }
    
    newLanguages[index][field] = value;
    setLanguages(newLanguages);
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
  
  const addExpertiseArea = () => {
    setExpertiseAreas([...expertiseAreas, { area: '', licenseIssueDate: expertiseAreas[0].licenseIssueDate }]);
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
    
    // If updating license date on first expertise, update all others too
    if (index === 0 && field === 'licenseIssueDate') {
      newExpertiseAreas.forEach(exp => {
        exp.licenseIssueDate = value;
      });
    }
    
    setExpertiseAreas(newExpertiseAreas);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Handle regular user form submission
      const [firstName, ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const userUpdateData = {
        firstName,
        lastName,
        phone: formData.phone,
        address: formData.address,
      };
      
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userUpdateData),
      });
      
      if (!response.ok) {
        throw new Error(t.error);
      }
      
      setSuccess(t.success);
      
      // No navigation, just show success message
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
                      <BookOpen className="mr-2 h-5 w-5 text-primary-500" />
                      {t.guideInfo}
                    </h2>
                    
                    <GuideProfileUpdateForm 
                      locale={locale} 
                      guideData={guideData} 
                      loading={isLoading} 
                    />
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