'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { Star, X, Languages, Check, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
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

// Helper function to calculate average proficiency
const getAverageProficiency = (proficiency) => {
  if (!Array.isArray(proficiency) || proficiency.length === 0) {
    return 0;
  }
  // Handle new format with userId and rating
  if (proficiency[0] && typeof proficiency[0] === 'object' && proficiency[0].rating !== undefined) {
    const sum = proficiency.reduce((acc, item) => acc + item.rating, 0);
    return (sum / proficiency.length).toFixed(1);
  }
  // Handle old format (numbers only)
  if (typeof proficiency[0] === 'number') {
    const sum = proficiency.reduce((acc, rating) => acc + rating, 0);
    return (sum / proficiency.length).toFixed(1);
  }
  return 0;
};

// Helper function to get rating count
const getRatingCount = (proficiency) => {
  if (!Array.isArray(proficiency)) {
    return 0;
  }
  return proficiency.length;
};

// Helper function to get current user's rating
const getCurrentUserRating = (proficiency, userId) => {
  if (!Array.isArray(proficiency) || !userId) {
    return null;
  }
  // Handle new format with userId and rating
  if (proficiency[0] && typeof proficiency[0] === 'object' && proficiency[0].rating !== undefined) {
    const userRating = proficiency.find(item => item.userId === userId);
    return userRating ? userRating.rating : null;
  }
  return null;
};

export default function RateLanguagesPage({ params }) {
  const router = useRouter();
  const { isSignedIn, isLoaded: clerkLoaded, user: clerkUser } = useClerkUser();
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [guide, setGuide] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [hoveredStars, setHoveredStars] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setUnwrappedParams(resolvedParams);
    };
    unwrapParams();
  }, [params]);

  const locale = unwrappedParams?.locale || 'en';
  const guideId = unwrappedParams?.id;

  // Authentication check
  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      router.push(`/${locale}/sign-in?redirect_url=${encodeURIComponent(`/${locale}/guides/${guideId}/rate`)}`);
    }
  }, [clerkLoaded, isSignedIn, locale, guideId, router]);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!isSignedIn || !clerkLoaded) return;
      
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, [isSignedIn, clerkLoaded]);

  // Fetch guide data and set current user ratings
  useEffect(() => {
    const fetchGuide = async () => {
      if (!guideId || !currentUser) return;
      
      try {
        const response = await fetch(`/api/guides/${guideId}`);
        if (response.ok) {
          const data = await response.json();
          setGuide(data);
          
          // Set current user's existing ratings
          if (data.languages) {
            const userRatings = {};
            data.languages.forEach((lang, index) => {
              const userRating = getCurrentUserRating(lang.proficiency, currentUser._id);
              if (userRating) {
                userRatings[index] = userRating;
              }
            });
            setRatings(userRatings);
          }
        }
      } catch (error) {
        console.error('Error fetching guide:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [guideId, currentUser]);

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
        router.push(`/${locale}/guides/${guideId}`);
      }, 2000);

    } catch (error) {
      console.error('Error updating language ratings:', error);
      alert(locale === 'en' ? 'Failed to update language ratings. Please try again.' : 'فشل في تحديث تقييمات اللغة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  }, [ratings, guideId, locale, router]);

  const handleGoBack = useCallback(() => {
    router.push(`/${locale}/guides/${guideId}`);
  }, [router, locale, guideId]);

  if (loading || !clerkLoaded || !isSignedIn) {
    return (
      <MainLayout locale={locale}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{locale === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!guide) {
    return (
      <MainLayout locale={locale}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {locale === 'en' ? 'Guide not found' : 'لم يتم العثور على المرشد'}
          </h1>
          <Button onClick={handleGoBack}>
            {locale === 'en' ? 'Go Back' : 'العودة'}
          </Button>
        </div>
      </MainLayout>
    );
  }

  const languages = guide.languages || [];

  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button 
              onClick={handleGoBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Languages className="w-8 h-8 mr-3 text-primary-600" />
                {locale === 'en' ? 'Rate Languages' : 'تقييم اللغات'}
              </h1>
              <p className="text-gray-600 mt-2">
                {locale === 'en' 
                  ? 'Rate this guide\'s proficiency in different languages (1-5 stars)' 
                  : 'قيم إتقان هذا المرشد للغات المختلفة (1-5 نجوم)'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {successMessage ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-600 font-medium text-lg">{successMessage}</p>
                <p className="text-gray-500 mt-2">
                  {locale === 'en' ? 'Redirecting back to guide profile...' : 'إعادة التوجيه إلى ملف المرشد...'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {languages.map((lang, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-medium text-gray-800">
                          {getLanguageName(lang.language)}
                        </h3>
                        <div className="text-sm text-gray-500 text-right">
                          <div>
                            {locale === 'en' ? 'Average:' : 'المتوسط:'} {getAverageProficiency(lang.proficiency)}/5 
                          </div>
                          <div>
                            ({getRatingCount(lang.proficiency)} {locale === 'en' ? 'ratings' : 'تقييمات'})
                          </div>
                          {ratings[index] && (
                            <div className="text-primary-600 font-medium mt-1">
                              {locale === 'en' ? 'Your rating:' : 'تقييمك:'} {ratings[index]}/5
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((starIndex) => {
                          const isHovered = hoveredStars[index] >= starIndex;
                          const isSelected = ratings[index] >= starIndex;
                          const showFilled = isSelected || (isHovered && !ratings[index]);
                          
                          return (
                            <button
                              key={starIndex}
                              className="focus:outline-none p-1"
                              onMouseEnter={() => handleStarHover(index, starIndex)}
                              onMouseLeave={() => handleStarLeave(index)}
                              onClick={() => handleStarClick(index, starIndex)}
                            >
                              <Star 
                                className={`w-10 h-10 transition-colors ${
                                  showFilled 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-gray-300 hover:text-yellow-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                        {ratings[index] && (
                          <span className="ml-4 text-lg font-medium text-gray-700">
                            {ratings[index]}/5
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleGoBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {locale === 'en' ? 'Cancel' : 'إلغاء'}
                  </button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(ratings).length === 0}
                    className="min-w-[120px]"
                  >
                    {isSubmitting 
                      ? (locale === 'en' ? 'Updating...' : 'جاري التحديث...') 
                      : (locale === 'en' ? 'Submit Ratings' : 'إرسال التقييمات')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}