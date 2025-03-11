'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { locales } from '@/lib/i18n';

export default function LanguageSwitcher({ currentLocale }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const changeLanguage = (locale) => {
    // Get the current path without the locale prefix
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, '/');
    
    // Navigate to the same page but with the new locale
    router.push(`/${locale}${pathWithoutLocale}`);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">
          {currentLocale === 'en' ? 'English' : 'العربية'}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => changeLanguage(locale)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                currentLocale === locale 
                  ? 'bg-primary-50 text-primary-600 font-medium' 
                  : 'text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              {locale === 'en' ? 'English' : 'العربية'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 