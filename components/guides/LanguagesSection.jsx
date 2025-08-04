'use client';

import React, { useState, useCallback } from 'react';
import { Star, Languages } from 'lucide-react';
import LanguageRatingPopup from './LanguageRatingPopup';

// Get language name from code
const getLanguageName = (code) => {
  const languageNames = {
    'English': 'English',
    'Arabic': 'العربية', 
    'French': 'Français',
    'Spanish': 'Español',
    'German': 'Deutsch',
    'Italian': 'Italiano',
    'Hebrew': 'עברית',
    'Russian': 'Русский',
    'Portuguese': 'Português',
    'Chinese': '中文',
    'Japanese': '日本語',
    'Korean': '한국어'
  };
  return languageNames[code] || code;
};

// Helper function to calculate average proficiency - moved outside component
const getAverageProficiency = (proficiency) => {
  // Handle backward compatibility: number or array
  if (typeof proficiency === 'number') {
    return proficiency.toFixed(1);
  }
  if (!Array.isArray(proficiency) || proficiency.length === 0) {
    return 0;
  }
  const sum = proficiency.reduce((acc, rating) => acc + rating, 0);
  return (sum / proficiency.length).toFixed(1);
};

// Helper function to get rating count - moved outside component
const getRatingCount = (proficiency) => {
  // Handle backward compatibility: number or array
  if (typeof proficiency === 'number') {
    return 1;
  }
  if (!Array.isArray(proficiency)) {
    return 0;
  }
  return proficiency.length;
};

const LanguagesSection = ({ languages, guideId, locale }) => {
  const [isRatingPopupOpen, setIsRatingPopupOpen] = useState(false);

  const handleRateClick = useCallback(() => {
    setIsRatingPopupOpen(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setIsRatingPopupOpen(false);
  }, []);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Languages className="w-5 h-5 mr-2 text-primary-600" />
            {locale === 'en' ? 'Languages' : 'اللغات'}
          </h3>
          <button
            onClick={handleRateClick}
            className="text-sm bg-primary-100 hover:bg-primary-200 text-primary-800 font-medium py-1 px-3 rounded-full transition-colors"
          >
            {locale === 'en' ? 'Rate' : 'تقييم'}
          </button>
        </div>
        
        <div className="space-y-3">
          {languages.map((lang, index) => {
            const averageProficiency = getAverageProficiency(lang.proficiency);
            const ratingCount = getRatingCount(lang.proficiency);
            
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium">{getLanguageName(lang.language)}</span>
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(averageProficiency) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {ratingCount > 0 ? `${averageProficiency} (${ratingCount})` : '(0)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LanguageRatingPopup
        isOpen={isRatingPopupOpen}
        onClose={handleClosePopup}
        languages={languages}
        guideId={guideId}
        locale={locale}
      />
    </>
  );
};

export default LanguagesSection;