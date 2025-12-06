'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader, Plus, X, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';

export default function GuideProfileUpdateForm({ locale, guideData, loading = false }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    address: '',
  });
  
  const [languages, setLanguages] = useState([
    { language: 'en', proficiency: 5 }
  ]);
  
  const [expertiseAreas, setExpertiseAreas] = useState([
    { area: '', licenseIssueDate: '' }
  ]);
  
  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [vehicleImage, setVehicleImage] = useState('');
  const [vehicleData, setVehicleData] = useState({
    type: '',
    model: '',
    year: '',
    capacity: ''
  });
  const [licenseIssueDate, setLicenseIssueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Initialize form with guide data
  useEffect(() => {
    setIsLoading(loading);
    
    if (guideData) {
      // Set basic info
      setFormData({
        nickname: guideData.nickname || '',
        phone: guideData.phone || '',
        address: guideData.address || '',
      });
      
      // Set languages and related fields
      if (guideData.languages && guideData.languages.length > 0) {
        // Ensure each language object has a proficiency (default to 5 if missing)
        setLanguages(
          guideData.languages.map(l => ({
            language: l.language,
            proficiency: l.proficiency || 5
          }))
        );
        
        // Set name and about for each language
        if (guideData.names) {
          guideData.names.forEach(name => {
            setFormData(prev => ({
              ...prev,
              [`name_${name.language}`]: name.value
            }));
          });
        }
        
        if (guideData.aboutSections) {
          guideData.aboutSections.forEach(about => {
            setFormData(prev => ({
              ...prev,
              [`about_${about.language}`]: about.content
            }));
          });
        }
      }
      
      // Set expertise areas with proper license issue date handling
      if (guideData.expertise && guideData.expertise.length > 0) {
        // Format the license issue date if it exists
        const formattedExpertise = guideData.expertise.map(exp => {
          // Format date to YYYY-MM-DD for input[type="date"]
          let formattedDate = '';
          if (exp.licenseIssueDate) {
            try {
              const date = new Date(exp.licenseIssueDate);
              if (!isNaN(date.getTime())) {
                formattedDate = date.toISOString().split('T')[0];
              }
            } catch (error) {
              console.error('Error formatting date:', error);
            }
          }
          
          return {
            ...exp,
            licenseIssueDate: formattedDate
          };
        });
        
        setExpertiseAreas(formattedExpertise);
      }

      // Apply top-level licenseIssueDate (new schema)
      if (guideData.licenseIssueDate) {
        try {
          const d = new Date(guideData.licenseIssueDate);
          if (!isNaN(d.getTime())) {
            const iso = d.toISOString().split('T')[0];
            setLicenseIssueDate(iso);
            setExpertiseAreas(prev => (prev.length > 0
              ? prev.map((e) => ({ ...e, licenseIssueDate: iso }))
              : [{ area: '', licenseIssueDate: iso }]
            ));
          }
        } catch (err) {
          console.error('Error formatting top-level licenseIssueDate:', err);
        }
      }
      
      // Set profile image
      if (guideData.profileImage?.url) {
        setProfileImage(guideData.profileImage.url);
      }
      
      // Set cover image
      if (guideData.coverImage?.url) {
        setCoverImage(guideData.coverImage.url);
      }
      
      // Set vehicle data
      if (guideData.vehicle) {
        setVehicleData({
          type: guideData.vehicle.type || '',
          model: guideData.vehicle.model || '',
          year: guideData.vehicle.year || '',
          capacity: guideData.vehicle.capacity || ''
        });
        
        if (guideData.vehicle.image?.url) {
          setVehicleImage(guideData.vehicle.image.url);
        }
      }
      
      setIsLoading(false);
    }
  }, [guideData, loading]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileImageUploaded = (url) => {
    setProfileImage(url);
  };
  
  const handleCoverImageUploaded = (url) => {
    setCoverImage(url);
  };
  
  const handleVehicleImageUploaded = (url) => {
    setVehicleImage(url);
  };
  
  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Language functions
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
        setFormData(prev => {
          const newData = { ...prev };
          delete newData[`name_${removedLanguage}`];
          delete newData[`about_${removedLanguage}`];
          return newData;
        });
      }
    }
  };
  
  const updateLanguage = (index, field, value) => {
    const newLanguages = [...languages];
    
    // If changing language, clear previous language form values
    if (field === 'language' && newLanguages[index].language) {
      const oldLanguage = newLanguages[index].language;
      setFormData(prev => {
        const newData = { ...prev };
        delete newData[`name_${oldLanguage}`];
        delete newData[`about_${oldLanguage}`];
        return newData;
      });
    }
    
    newLanguages[index][field] = value;
    // Always ensure proficiency is set (default to 5 if missing)
    if (!newLanguages[index].proficiency) {
      newLanguages[index].proficiency = 5;
    }
    setLanguages(newLanguages);
  };
  
  // Expertise functions
  const addExpertiseArea = () => {
    setExpertiseAreas([...expertiseAreas, { 
      area: '', 
      licenseIssueDate: expertiseAreas[0]?.licenseIssueDate || '' 
    }]);
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
  
  // Add this helper function to map language names to codes
  const getLanguageCode = (languageName) => {
    const languageCodeMap = {
      'English': 'en',
      'Arabic': 'ar', 
      'Hebrew': 'he',
      'French': 'fr',
      'Spanish': 'es',
      'German': 'de',
      'Italian': 'it',
      'Russian': 'ru',
      'Chinese': 'zh',
      'Japanese': 'ja',
      'Korean': 'ko',
      'Portuguese': 'pt',
      'Dutch': 'nl',
      'Swedish': 'sv',
      'Norwegian': 'no',
      'Danish': 'da',
      'Turkish': 'tr',
      'Polish': 'pl',
      'Romanian': 'ro',
      'Hungarian': 'hu',
      'Czech': 'cs',
      'Slovak': 'sk',
      'Greek': 'el',
      'Bulgarian': 'bg',
      'Croatian': 'hr',
      'Serbian': 'sr'
    };
    
    return languageCodeMap[languageName] || languageName;
  };
  
  // Add this helper function to get the language name
  const getLanguageName = (code) => {
    const languageNames = {
      en: 'English',
      ar: 'العربية',
      he: 'עברית',
      fr: 'Français', 
      es: 'Español',
      de: 'Deutsch',
      it: 'Italiano',
      ru: 'Русский',
      zh: '中文',
      ja: '日本語',
      ko: '한국어',
      pt: 'Português',
      nl: 'Nederlands',
      sv: 'Svenska',
      no: 'Norsk',
      da: 'Dansk',
      tr: 'Türkçe',
      pl: 'Polski',
      ro: 'Română',
      hu: 'Magyar',
      cs: 'Čeština',
      sk: 'Slovenčina',
      el: 'Ελληνικά',
      bg: 'Български',
      hr: 'Hrvatski',
      sr: 'Српски'
    };
    
    return languageNames[code] || code;
  };
  
  // Add this helper function to calculate years of experience
  const calculateYearsOfExperience = (dateString) => {
    try {
      const licenseDate = new Date(dateString);
      const today = new Date();
      
      if (isNaN(licenseDate.getTime())) {
        return 0;
      }
      
      let years = today.getFullYear() - licenseDate.getFullYear();
      const monthDiff = today.getMonth() - licenseDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < licenseDate.getDate())) {
        years--;
      }
      
      return years;
    } catch (error) {
      console.error('Error calculating years of experience:', error);
      return 0;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate required fields for guide
      if (!profileImage) {
        setError(locale === 'en' ? 'Profile image is required' : 'صورة الملف الشخصي مطلوبة');
        setIsSaving(false);
        return;
      }
      
      // Validate languages
      const validLanguages = languages
        .filter(lang => lang.language.trim() !== '')
        .map(lang => ({
          language: lang.language,
          proficiency: lang.proficiency || 5
        }));
      if (validLanguages.length === 0) {
        setError(locale === 'en' ? 'At least one language is required' : 'مطلوبة لغة واحدة على الأقل');
        setIsSaving(false);
        return;
      }
      
      // Validate license issue date
      if (!licenseIssueDate) {
        setError(locale === 'en' ? 'License issue date is required' : 'تاريخ إصدار الرخصة مطلوب');
        setIsSaving(false);
        return;
      }
      
      // Create names array from language-specific name fields
      const names = validLanguages.map(lang => ({
        language: lang.language,
        value: formData[`name_${lang.language}`] || ''
      })).filter(name => name.value.trim() !== '');
      
      // Create aboutSections array from language-specific about fields
      const aboutSections = validLanguages.map(lang => ({
        language: lang.language,
        content: formData[`about_${lang.language}`] || ''
      })).filter(about => about.content.trim() !== '');
      
      // Create expertise array from expertise fields
      const expertise = expertiseAreas
        .filter(exp => exp.area.trim() !== '')
        .map(exp => ({
          area: exp.area,
          expertiseAreaDescriptionEn: exp.expertiseAreaDescriptionEn || '',
          expertiseAreaDescriptionAr: exp.expertiseAreaDescriptionAr || ''
        }));
      
      const guideData = {
        names: names,
        nickname: formData.nickname,
        address: formData.address,
        phone: formData.phone,
        profileImage: {
          url: profileImage,
        },
        coverImage: coverImage ? {
          url: coverImage,
        } : undefined,
        vehicle: {
          type: vehicleData.type,
          model: vehicleData.model,
          year: vehicleData.year ? parseInt(vehicleData.year) : undefined,
          capacity: vehicleData.capacity ? parseInt(vehicleData.capacity) : undefined,
          image: vehicleImage ? {
            url: vehicleImage,
          } : undefined,
        },
        languages: validLanguages,
        expertise: expertise,
        licenseIssueDate: licenseIssueDate,
        aboutSections: aboutSections
      };
      
      const response = await fetch('/api/guides/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guideData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update guide profile');
      }
      
      setSuccess(locale === 'en' ? 'Guide profile updated successfully' : 'تم تحديث ملف المرشد بنجاح');
      
      // No navigation, just show success message
    } catch (error) {
      console.error('Error updating guide profile:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
        <span className="ml-2 text-secondary-600">
          {locale === 'en' ? 'Loading profile...' : 'جاري تحميل الملف الشخصي...'}
        </span>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {locale === 'en' ? 'Profile Image' : 'صورة الملف الشخصي'}*
        </label>
        {profileImage && (
          <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden">
            <Image 
              src={profileImage} 
              alt="Profile" 
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <ImageUploader
          onImageUploaded={handleProfileImageUploaded}
          folder="guides/profiles"
          buttonText={locale === 'en' ? 'Upload Image' : 'رفع صورة'}
        />
        {!profileImage && (
          <p className="mt-1 text-sm text-red-600">
            {locale === 'en' ? 'Profile image is required' : 'صورة الملف الشخصي مطلوبة'}
          </p>
        )}
      </div>
      
      {/* Cover Image */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {locale === 'en' ? 'Cover Image' : 'صورة الغلاف'}
        </label>
        {coverImage && (
          <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
            <Image 
              src={coverImage} 
              alt="Cover" 
              width={800}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <ImageUploader
          onImageUploaded={handleCoverImageUploaded}
          folder="guides/covers"
          buttonText={locale === 'en' ? 'Upload Cover Image' : 'رفع صورة الغلاف'}
        />
      </div>
      
      {/* Vehicle */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {locale === 'en' ? 'Vehicle (Optional)' : 'المركبة (اختياري)'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Vehicle Type' : 'نوع المركبة'}
            </label>
            <input
              id="vehicleType"
              name="type"
              type="text"
              value={vehicleData.type}
              onChange={handleVehicleInputChange}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="vehicleModel" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Vehicle Model' : 'طراز المركبة'}
            </label>
            <input
              id="vehicleModel"
              name="model"
              type="text"
              value={vehicleData.model}
              onChange={handleVehicleInputChange}
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
              name="year"
              type="number"
              value={vehicleData.year}
              onChange={handleVehicleInputChange}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="vehicleCapacity" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Vehicle Capacity' : 'سعة المركبة'}
            </label>
            <input
              id="vehicleCapacity"
              name="capacity"
              type="number"
              value={vehicleData.capacity}
              onChange={handleVehicleInputChange}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            {locale === 'en' ? 'Vehicle Image' : 'صورة المركبة'}
          </label>
          {vehicleImage && (
            <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
              <Image 
                src={vehicleImage} 
                alt="Vehicle" 
                width={800}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <ImageUploader
            onImageUploaded={handleVehicleImageUploaded}
            folder="guides/vehicles"
            buttonText={locale === 'en' ? 'Upload Vehicle Image' : 'رفع صورة المركبة'}
          />
        </div>
      </div>
      
      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {locale === 'en' ? 'Basic Information' : 'المعلومات الأساسية'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Nickname' : 'اللقب'}
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Phone Number' : 'رقم الهاتف'}*
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-secondary-700 mb-1">
            {/* {locale === 'en' ? 'Address' : 'العنوان'} */}
            {locale === 'en' ? 'City you\'re from (shown on profile)' : 'المدينة التي أنت منها (معروضة على الملف الشخصي)'}*
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
      </div>
      
      {/* Languages & About */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {locale === 'en' ? 'Languages & About' : 'اللغات والنبذة'}
        </h2>
        
        {languages.map((lang, index) => (
          <div key={`lang_${index}`} className="mb-6 p-4 border border-secondary-200 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {getLanguageName(lang.language)}
              </h3>
              
              {languages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Language' : 'اللغة'}*
              </label>
              <select
                value={lang.language}
                onChange={e => updateLanguage(index, 'language', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">{locale === 'en' ? 'Select language' : 'اختر اللغة'}</option>
                <option value="English">English</option>
                <option value="Arabic">Arabic</option>
                <option value="Hebrew">Hebrew</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Russian">Russian</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Dutch">Dutch</option>
                <option value="Swedish">Swedish</option>
                <option value="Norwegian">Norwegian</option>
                <option value="Danish">Danish</option>
                <option value="Turkish">Turkish</option>
                <option value="Polish">Polish</option>
                <option value="Romanian">Romanian</option>
                <option value="Hungarian">Hungarian</option>
                <option value="Czech">Czech</option>
                <option value="Slovak">Slovak</option>
                <option value="Greek">Greek</option>
                <option value="Bulgarian">Bulgarian</option>
                <option value="Croatian">Croatian</option>
                <option value="Serbian">Serbian</option>
              </select>
            </div>
            
            <div>
              <div className="mb-4">
                <label htmlFor={`name_${lang.language}`} className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? `Name (${getLanguageName(lang.language)})` : `الاسم (${getLanguageName(lang.language)})`}*
                </label>
                <input
                  id={`name_${lang.language}`}
                  name={`name_${lang.language}`}
                  type="text"
                  value={formData[`name_${lang.language}`] || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor={`about_${lang.language}`} className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? `About (${getLanguageName(lang.language)})` : `نبذة عني (${getLanguageName(lang.language)})`}*
                </label>
                <textarea
                  id={`about_${lang.language}`}
                  name={`about_${lang.language}`}
                  value={formData[`about_${lang.language}`] || ''}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  minLength={50}
                ></textarea>
                <p className="mt-1 text-xs text-secondary-500">
                  {locale === 'en' ? 'Minimum 50 characters' : 'الحد الأدنى 50 حرفًا'}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addLanguage}
          className="mb-4"
        >
          <div className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>{locale === 'en' ? 'Add Another Language' : 'إضافة لغة أخرى'}</span>
          </div>
        </Button>
      </div>
      
      {/* License Issue Date (separate section) */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {locale === 'en' ? 'License Issue Date' : 'تاريخ إصدار الرخصة'}
        </h2>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            {locale === 'en' ? 'License Issue Date' : 'تاريخ إصدار الرخصة'}*
          </label>
          <input
            type="date"
            value={licenseIssueDate || ''}
            onChange={(e) => setLicenseIssueDate(e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            max={new Date().toISOString().split('T')[0]}
            required
          />
          {licenseIssueDate && (
            <p className="mt-1 text-xs text-secondary-500">
              {locale === 'en' 
                ? `Years of experience: ${calculateYearsOfExperience(licenseIssueDate)}`
                : `سنوات الخبرة: ${calculateYearsOfExperience(licenseIssueDate)}`}
            </p>
          )}
          <p className="mt-1 text-xs text-secondary-500">
            {locale === 'en' 
              ? 'Years of experience will be calculated from this date' 
              : 'سيتم احتساب سنوات الخبرة من هذا التاريخ'}
          </p>
        </div>
      </div>

      {/* Expertise */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {locale === 'en' ? 'Expertise & Experience' : 'الخبرة والتجربة'}
        </h2>
        
        {expertiseAreas.map((exp, index) => (
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
                  value={exp.area}
                  onChange={(e) => updateExpertiseArea(index, 'area', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
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
              </div>
              
              {/* License date removed from per-expertise; controlled above */}
            </div>

            {/* Optional descriptions per expertise area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  {locale === 'en' ? 'Description (English) - optional' : 'الوصف (بالإنجليزية) - اختياري'}
                </label>
                <textarea
                  rows="3"
                  value={exp.expertiseAreaDescriptionEn || ''}
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
                  value={exp.expertiseAreaDescriptionAr || ''}
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
          className="mb-4"
        >
          <div className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>{locale === 'en' ? 'Add Another Expertise Area' : 'إضافة مجال خبرة آخر'}</span>
          </div>
        </Button>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
        >
          <div className="flex items-center gap-1">
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>{locale === 'en' ? 'Saving...' : 'جاري الحفظ...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{locale === 'en' ? 'Save Changes' : 'حفظ التغييرات'}</span>
              </>
            )}
          </div>
        </Button>
      </div>
      
      {/* Success/Error Messages */}
      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </form>
  );
} 