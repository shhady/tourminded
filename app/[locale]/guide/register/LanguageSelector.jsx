'use client';

import { useState } from 'react';

export default function LanguageSelector({ value, onChange, locale }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // List of predefined languages (top languages + must-have languages)
  const availableLanguages = [
    { code: 'Arabic', name: locale === 'en' ? 'Arabic' : 'العربية' },
    { code: 'Belarusian', name: locale === 'en' ? 'Belarusian' : 'البيلاروسية' },
    { code: 'Czech', name: locale === 'en' ? 'Czech' : 'التشيكية' },
    { code: 'Danish', name: locale === 'en' ? 'Danish' : 'الدنماركية' },
    { code: 'Dutch', name: locale === 'en' ? 'Dutch' : 'الهولندية' },
    { code: 'English', name: locale === 'en' ? 'English' : 'الإنجليزية' },
    { code: 'Filipino', name: locale === 'en' ? 'Filipino' : 'الفلبينية' },
    { code: 'Finnish', name: locale === 'en' ? 'Finnish' : 'الفنلندية' },
    { code: 'French', name: locale === 'en' ? 'French' : 'الفرنسية' },
    { code: 'German', name: locale === 'en' ? 'German' : 'الألمانية' },
    { code: 'Greek', name: locale === 'en' ? 'Greek' : 'اليونانية' },
    { code: 'Hebrew', name: locale === 'en' ? 'Hebrew' : 'العبرية' },
    { code: 'Hindi', name: locale === 'en' ? 'Hindi' : 'الهندية' },
    { code: 'Hungarian', name: locale === 'en' ? 'Hungarian' : 'المجرية' },
    { code: 'Italian', name: locale === 'en' ? 'Italian' : 'الإيطالية' },
    { code: 'Japanese', name: locale === 'en' ? 'Japanese' : 'اليابانية' },
    { code: 'Kazakh', name: locale === 'en' ? 'Kazakh' : 'الكازاخية' },
    { code: 'Korean', name: locale === 'en' ? 'Korean' : 'الكورية' },
    { code: 'Latvian', name: locale === 'en' ? 'Latvian' : 'اللاتفية' },
    { code: 'Lithuanian', name: locale === 'en' ? 'Lithuanian' : 'الليتوانية' },
    { code: 'Malay', name: locale === 'en' ? 'Malay' : 'الملايو' },
    { code: 'Mandarin Chinese', name: locale === 'en' ? 'Mandarin Chinese' : 'الصينية الماندرين' },
    { code: 'Norwegian', name: locale === 'en' ? 'Norwegian' : 'النرويجية' },
    { code: 'Polish', name: locale === 'en' ? 'Polish' : 'البولندية' },
    { code: 'Portuguese', name: locale === 'en' ? 'Portuguese' : 'البرتغالية' },
    { code: 'Romanian', name: locale === 'en' ? 'Romanian' : 'الرومانية' },
    { code: 'Russian', name: locale === 'en' ? 'Russian' : 'الروسية' },
    { code: 'Slovak', name: locale === 'en' ? 'Slovak' : 'السلوفاكية' },
    { code: 'Spanish', name: locale === 'en' ? 'Spanish' : 'الإسبانية' },
    { code: 'Swedish', name: locale === 'en' ? 'Swedish' : 'السويدية' },
    { code: 'Turkish', name: locale === 'en' ? 'Turkish' : 'التركية' },
    { code: 'Ukrainian', name: locale === 'en' ? 'Ukrainian' : 'الأوكرانية' },
    
  ];
  
  const selectLanguage = (language) => {
    onChange(language);
    setIsOpen(false);
  };
  
  const selectedLanguage = availableLanguages.find(lang => lang.code === value);
  
  return (
    <div className="relative">
      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
      >
        {selectedLanguage ? selectedLanguage.name : (locale === 'en' ? 'Select a language' : 'اختر لغة')}
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-secondary-200">
          {availableLanguages.map(language => (
            <div
              key={language.code}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-50 ${
                value === language.code ? 'bg-primary-100' : ''
              }`}
              onClick={() => selectLanguage(language.code)}
            >
              <span className={value === language.code ? 'font-medium' : 'font-normal'}>
                {language.name}
              </span>
              {value === language.code && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 