'use client';

import React, { useState, useCallback } from 'react';
import { Star, X, Languages, Check } from 'lucide-react';
import Button from '@/components/ui/Button';

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

const LanguageRatingPopup = ({ isOpen, onClose, languages, guideId, locale }) => {
  const [ratings, setRatings] = useState({});
  const [hoveredStars, setHoveredStars] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleStarHover = useCallback((languageIndex, starIndex) => {
    setHoveredStars(prev => ({ ...prev, [languageIndex]: starIndex }));
  }, []);

  const handleStarLeave = useCallback((languageIndex) => {
    setHoveredStars(prev => ({ ...prev, [languageIndex]: null }));
  }, []);

  const handleStarClick = useCallback((languageIndex, rating) => {
    setRatings(prev => ({ ...prev, [languageIndex]: rating }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (Object.keys(ratings).length === 0) {
      alert(locale === 'en' ? 'Please rate at least one language.' : 'يرجى تقييم لغة واحدة على الأقل.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit ratings for each language
      for (const [languageIndex, proficiency] of Object.entries(ratings)) {
        const response = await fetch('/api/guides/update-proficiency', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guideId: guideId,
            languageIndex: parseInt(languageIndex),
            proficiency: proficiency
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update language rating');
        }
      }

      setSuccessMessage(locale === 'en' ? 'Language ratings updated successfully!' : 'تم تحديث تقييمات اللغة بنجاح!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
        // Refresh the page to show updated ratings
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error updating language ratings:', error);
      alert(locale === 'en' ? 'Failed to update language ratings. Please try again.' : 'فشل في تحديث تقييمات اللغة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  }, [ratings, guideId, locale, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center">
            <Languages className="w-6 h-6 mr-2 text-primary-600" />
            {locale === 'en' ? 'Rate Languages' : 'تقييم اللغات'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successMessage ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 font-medium">{successMessage}</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                {locale === 'en' 
                  ? 'Rate this guide\'s proficiency in different languages (1-5 stars)' 
                  : 'قيم إتقان هذا المرشد للغات المختلفة (1-5 نجوم)'}
              </p>

              <div className="space-y-6">
                {languages.map((lang, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">
                        {getLanguageName(lang.language)}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {locale === 'en' ? 'Current:' : 'الحالي:'} {getAverageProficiency(lang.proficiency)}/5 ({getRatingCount(lang.proficiency)} {locale === 'en' ? 'ratings' : 'تقييمات'})
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((starIndex) => {
                        const isHovered = hoveredStars[index] >= starIndex;
                        const isSelected = ratings[index] >= starIndex;
                        const showFilled = isSelected || (isHovered && !ratings[index]);
                        
                        return (
                          <button
                            key={starIndex}
                            className="focus:outline-none"
                            onMouseEnter={() => handleStarHover(index, starIndex)}
                            onMouseLeave={() => handleStarLeave(index)}
                            onClick={() => handleStarClick(index, starIndex)}
                          >
                            <Star 
                              className={`w-8 h-8 transition-colors ${
                                showFilled 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              } hover:text-yellow-400`}
                            />
                          </button>
                        );
                      })}
                      {ratings[index] && (
                        <span className="ml-2 text-sm font-medium text-gray-600">
                          {ratings[index]}/5
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {locale === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || Object.keys(ratings).length === 0}
                  className="min-w-[100px]"
                >
                  {isSubmitting 
                    ? (locale === 'en' ? 'Updating...' : 'جاري التحديث...') 
                    : (locale === 'en' ? 'Submit' : 'إرسال')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageRatingPopup;