'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Loader } from 'lucide-react';


export default function GuideProfilePage({ params }) {
  const localeParams = React.use(params);
  const locale = localeParams?.locale || 'en';
  const router = useRouter();
  const { user, isLoaded: isClerkLoaded } = useUser();
  
  const [guide, setGuide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
 
  useEffect(() => {
    const fetchGuideProfile = async () => {
      if (!isClerkLoaded || !user) {
        return;
      }
      
      try {
        const response = await fetch('/api/guides/me');
        
        if (!response.ok) {
          throw new Error('Failed to fetch guide profile');
        }
        
        const data = await response.json();
        setGuide(data.guide);
      } catch (error) {
        console.error('Error fetching guide profile:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGuideProfile();
  }, [isClerkLoaded, user]);
  
  // Helper function to get name in current locale or first available
  const getLocalizedName = () => {
    if (!guide || !guide.names || guide.names.length === 0) return '';
    
    // Try to find name in current locale
    const localeName = guide.names.find(name => name.language.toLowerCase() === locale);
    if (localeName) return localeName.value;
    
    // Fallback to first available name
    return guide.names[0].value;
  };
  
  // Helper function to get about in current locale or first available
  const getLocalizedAbout = () => {
    if (!guide || !guide.aboutSections || guide.aboutSections.length === 0) return '';
    
    // Try to find about in current locale
    const localeAbout = guide.aboutSections.find(about => about.language.toLowerCase() === locale);
    if (localeAbout) return localeAbout.content;
    
    // Fallback to first available about
    return guide.aboutSections[0].content;
  };
  
  // Calculate years of experience
  const calculateYearsOfExperience = () => {
    if (!guide || !guide.licenseIssueDate) {
      return 0;
    }
    const issueDate = new Date(guide.licenseIssueDate);
    const today = new Date();
    return Math.floor((today - issueDate) / (365.25 * 24 * 60 * 60 * 1000));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push(`/${locale}/dashboard/guide`)}>
            {locale === 'en' ? 'Back to Dashboard' : 'العودة إلى لوحة التحكم'}
          </Button>
        </div>
      </div>
    );
  }
  
  if (!guide) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {locale === 'en' ? 'Guide Profile' : 'الملف الشخصي للمرشد'}
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900">
            {locale === 'en' ? 'Profile Not Found' : 'لم يتم العثور على الملف الشخصي'}
          </h2>
          <p className="text-secondary-600 mb-6">
            {locale === 'en' 
              ? 'You need to create your guide profile to start offering tours.' 
              : 'تحتاج إلى إنشاء ملف المرشد الخاص بك لبدء تقديم الجولات.'}
          </p>
          <Button 
            href={`/${locale}/guide/register`}
            variant="primary"
            className="text-black"
          >
            {locale === 'en' ? 'Create Profile' : 'إنشاء ملف شخصي'}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {locale === 'en' ? 'Guide Profile' : 'الملف الشخصي للمرشد'}
        </h1>
        <Button 
          href={`/${locale}/profile`}
          variant="primary"
          className="text-black"
        >
          {locale === 'en' ? 'Edit Profile' : 'تعديل الملف الشخصي'}
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary-600 p-6 text-black">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
              {guide.profileImage?.url ? (
                <img 
                  src={guide.profileImage.url} 
                  alt={getLocalizedName() || 'Guide'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
                  <span className="text-secondary-400 text-4xl">
                    {(getLocalizedName()?.[0] || '').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">
                {getLocalizedName()}
              </h2>
              <p className="text-primary-100 mb-2">
                {guide.nickname || ''}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {guide.active ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                    {locale === 'en' ? 'Active' : 'نشط'}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                    {locale === 'en' ? 'Pending Approval' : 'في انتظار الموافقة'}
                  </span>
                )}
                
                {guide.verified && (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                    {locale === 'en' ? 'Verified' : 'موثق'}
                  </span>
                )}
                
                {guide.featured && (
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                    {locale === 'en' ? 'Featured' : 'مميز'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* About Section */}
            <div>
              {/* <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                {locale === 'en' ? 'About' : 'نبذة عني'}
              </h3>
              <p className="text-secondary-600 whitespace-pre-line">
                {getLocalizedAbout() || (locale === 'en' ? 'No information provided.' : 'لم يتم تقديم معلومات.')}
              </p>
               */}
              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary-900">
                {locale === 'en' ? 'Contact Information' : 'معلومات الاتصال'}
              </h3>
              <ul className="space-y-2 text-secondary-600">
                <li className="flex items-start">
                  <span className="font-medium mr-2">{locale === 'en' ? 'Email:' : 'البريد الإلكتروني:'}</span>
                  <span>{guide.user?.email || ''}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">{locale === 'en' ? 'Phone:' : 'الهاتف:'}</span>
                  <span>{guide.phone || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">{locale === 'en' ? 'Address:' : 'العنوان:'}</span>
                  <span>{guide.address || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                </li>
              </ul>
              
              {/* All language versions */}
              {guide.aboutSections && guide.aboutSections.length > 1 && (
                <div className="mt-6 border-t border-secondary-200 pt-4">
                  <h3 className="text-lg font-medium mb-3">
                    {locale === 'en' ? 'All Language Versions' : 'جميع إصدارات اللغة'}
                  </h3>
                  
                  <div className="space-y-4">
                    {guide.aboutSections.map((about, index) => (
                      <div key={index} className="border-b border-secondary-100 pb-3 last:border-0 last:pb-0">
                        <h4 className="font-medium text-primary-600 mb-1">{about.language}</h4>
                        <p className="text-secondary-700">{about.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Expertise & Languages */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                {locale === 'en' ? 'Expertise' : 'الخبرات'}
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                    {guide.expertise.map((exp, index) => (
                      <div key={index} className="bg-secondary-100  py-1 rounded-full text-secondary-800 text-sm">
                        {exp.area}
                      </div>
                    ))}
                  </div>
              {guide.expertise && guide.expertise.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-secondary-700">
                      {locale === 'en' ? 'Years of Experience' : 'سنوات الخبرة'}
                    </h4>
                    <p className="text-2xl font-bold text-primary-600">
                      {calculateYearsOfExperience()} {locale === 'en' ? 'years' : 'سنوات'}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {guide.licenseIssueDate && (
                        locale === 'en' 
                          ? `Since ${new Date(guide.licenseIssueDate).getFullYear()}`
                          : `منذ ${new Date(guide.licenseIssueDate).getFullYear()}`
                      )}
                    </p>
                  </div>
                  
                  
                </div>
              ) : (
                <p className="text-secondary-500 mb-6">
                  {locale === 'en' ? 'No expertise listed.' : 'لم يتم إدراج أي خبرات.'}
                </p>
              )}
              
              <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                {locale === 'en' ? 'Languages' : 'اللغات'}
              </h3>
              {guide.languages && guide.languages.length > 0 ? (
                <div className="space-y-2 mb-6">
                  {guide.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{lang.language}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`w-4 h-4 rounded-full mx-0.5 ${
                              i < lang.proficiency 
                                ? 'bg-primary-500' 
                                : 'bg-secondary-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-500 mb-6">
                  {locale === 'en' ? 'No languages listed.' : 'لم يتم إدراج أي لغات.'}
                </p>
              )}
              
              {/* Vehicle Information */}
              {guide.vehicle && (guide.vehicle.type || guide.vehicle.model) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                    {locale === 'en' ? 'Vehicle Information' : 'معلومات المركبة'}
                  </h3>
                  
                  {guide.vehicle.image?.url && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
                      <img 
                        src={guide.vehicle.image.url} 
                        alt="Vehicle" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <ul className="space-y-2 text-secondary-600">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'Type:' : 'النوع:'}</span>
                      <span>{guide.vehicle.type || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'Model:' : 'الطراز:'}</span>
                      <span>{guide.vehicle.model || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'Year:' : 'السنة:'}</span>
                      <span>{guide.vehicle.year || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'Capacity:' : 'السعة:'}</span>
                      <span>
                        {guide.vehicle.capacity 
                          ? `${guide.vehicle.capacity} ${locale === 'en' ? 'passengers' : 'ركاب'}`
                          : (locale === 'en' ? 'Not provided' : 'غير متوفر')}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
              
              {/* Statistics */}
              {/* <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                  {locale === 'en' ? 'Statistics' : 'الإحصائيات'}
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-secondary-500">
                      {locale === 'en' ? 'Tours' : 'الجولات'}
                    </h4>
                    <p className="text-2xl font-bold text-secondary-900">{guide.tourCount || 0}</p>
                  </div>
                  
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-secondary-500">
                      {locale === 'en' ? 'Reviews' : 'التقييمات'}
                    </h4>
                    <p className="text-2xl font-bold text-secondary-900">{guide.reviewCount || 0}</p>
                  </div>
                  
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-secondary-500">
                      {locale === 'en' ? 'Rating' : 'التقييم'}
                    </h4>
                    <p className="text-2xl font-bold text-secondary-900">
                      {guide.averageRating ? guide.averageRating.toFixed(1) : '-'}
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 