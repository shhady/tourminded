'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Languages } from 'lucide-react';

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

const LanguageStatsSection = ({ guideId, locale }) => {
  const [languageStats, setLanguageStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLanguageStats = async () => {
      if (!guideId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/guides/${guideId}/language-stats`);
        
        if (response.ok) {
          const data = await response.json();
          setLanguageStats(data.languages || []);
        } else {
          setError('Failed to load language statistics');
        }
      } catch (err) {
        console.error('Error fetching language stats:', err);
        setError('Failed to load language statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchLanguageStats();
  }, [guideId]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Languages className="w-5 h-5 mr-2 text-primary-600" />
            {locale === 'en' ? 'Languages' : 'اللغات'}
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Languages className="w-5 h-5 mr-2 text-primary-600" />
            {locale === 'en' ? 'Languages' : 'اللغات'}
          </h3>
        </div>
        <div className="text-center py-4 text-gray-500 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Languages className="w-5 h-5 mr-2 text-primary-600" />
          {locale === 'en' ? 'Languages' : 'اللغات'}
        </h3>
        <Link
          href={`/${locale}/guides/${guideId}/rate`}
          className="text-sm bg-primary-100 hover:bg-primary-200 text-primary-800 font-medium py-1 px-3 rounded-full transition-colors border border-primary-600"
        >
          {locale === 'en' ? 'Rate Languages' : 'تقييم اللغات'}
        </Link>
      </div>
      
      <div className="space-y-3">
        {languageStats.length > 0 ? (
          languageStats.map((lang, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium">{getLanguageName(lang.language)}</span>
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < lang.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  ({lang.count})
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            {locale === 'en' ? 'No language ratings yet' : 'لا توجد تقييمات لغوية بعد'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageStatsSection;