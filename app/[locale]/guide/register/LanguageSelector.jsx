'use client';

import { useState } from 'react';

export default function LanguageSelector({ value, onChange, locale }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // List of predefined languages (top languages + must-have languages)
  const availableLanguages = [
    { code: 'English', name: locale === 'en' ? 'English' : 'الإنجليزية' },
    { code: 'Arabic', name: locale === 'en' ? 'Arabic' : 'العربية' },
    { code: 'Hebrew', name: locale === 'en' ? 'Hebrew' : 'العبرية' },
    { code: 'Spanish', name: locale === 'en' ? 'Spanish' : 'الإسبانية' },
    { code: 'French', name: locale === 'en' ? 'French' : 'الفرنسية' },
    { code: 'German', name: locale === 'en' ? 'German' : 'الألمانية' },
    { code: 'Italian', name: locale === 'en' ? 'Italian' : 'الإيطالية' },
    { code: 'Russian', name: locale === 'en' ? 'Russian' : 'الروسية' },
    
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