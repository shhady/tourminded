'use client';

import React, { useState, useEffect, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowLeft, User } from 'lucide-react';

const ReviewPage = ({ params }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { id, locale } = use(params);

  const [guide, setGuide] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [reviewData, setReviewData] = useState({
    review: '',
    rating: 0
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/${locale}/sign-in`);
    }
  }, [isLoaded, isSignedIn, router, locale]);

  // Fetch current user data from our database
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
          }
        } catch (err) {
          console.error('Error fetching current user:', err);
        }
      }
    };

    fetchCurrentUser();
  }, [isLoaded, isSignedIn, user]);

  // Fetch guide data
  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await fetch(`/api/guides/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch guide');
        }
        const guideData = await response.json();
        
        // Check if response has error property
        if (guideData.error) {
          setError(guideData.error);
          return;
        }
        
        setGuide(guideData);
        
        // Check if user already has a review
        const existingReview = guideData.reviews?.find(
          review => review.userId === currentUser?._id
        );
        
        if (existingReview) {
          setReviewData({
            review: existingReview.review,
            rating: existingReview.rating
          });
        }
      } catch (err) {
        setError('Failed to load guide data');
        console.error('Error fetching guide:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn && id && currentUser) {
      fetchGuide();
    }
  }, [id, currentUser?._id, isLoaded, isSignedIn, currentUser]);

  const handleStarClick = (rating) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const handleReviewChange = (e) => {
    setReviewData(prev => ({ ...prev, review: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewData.rating || !reviewData.review.trim()) {
      setError('Please provide both a rating and review text');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/guides/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review: reviewData.review.trim(),
          rating: reviewData.rating
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push(`/${locale}/guides/${id}`);
        }, 1500);
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('An error occurred while submitting your review');
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get guide name
  const getGuideName = (guide) => {
    if (!guide) return '';
    
    if (guide.names && guide.names.length > 0) {
      const nameInLocale = guide.names.find(name => name.language === locale);
      if (nameInLocale) return nameInLocale.value;
      
      const englishName = guide.names.find(name => name.language === 'en');
      if (englishName) return englishName.value;
      
      return guide.names[0].value;
    }
    
    if (guide.user) {
      return `${guide.user.firstName} ${guide.user.lastName}`;
    }
    
    return 'Guide';
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {locale === 'en' ? 'Loading...' : 'جاري التحميل...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect
  }

  if (error && !guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link 
            href={`/${locale}/guides`}
            className="text-primary-600 hover:text-primary-700"
          >
            {locale === 'en' ? 'Back to Guides' : 'العودة إلى المرشدين'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/${locale}/guides/${id}`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'en' ? 'Back to Guide Profile' : 'العودة إلى ملف المرشد'}
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {locale === 'en' ? 'Write a Review' : 'كتابة تقييم'}
            </h1>
            <p className="text-gray-600">
              {locale === 'en' 
                ? 'Share your experience with other travelers' 
                : 'شارك تجربتك مع المسافرين الآخرين'}
            </p>
          </div>

          {/* Guide Info Card */}
          {guide && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                  <Image 
                    src={guide.profileImage?.url || '/no-image-cover.png'}
                    alt={getGuideName(guide)}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {getGuideName(guide)}
                  </h2>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center mr-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(guide.rating || 0) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {(guide.rating || 0).toFixed(1)} ({guide.reviewCount || 0} {locale === 'en' ? 'reviews' : 'تقييمات'})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {locale === 'en' ? 'Your Rating' : 'تقييمك'}
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoveredRating || reviewData.rating)
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                {reviewData.rating > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {locale === 'en' ? `You rated: ${reviewData.rating} star${reviewData.rating !== 1 ? 's' : ''}` : `تقييمك: ${reviewData.rating} نجمة`}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {locale === 'en' ? 'Your Review' : 'تقييمك'}
                </label>
                <textarea
                  value={reviewData.review}
                  onChange={handleReviewChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={locale === 'en' 
                    ? 'Share details about your experience with this guide...' 
                    : 'شارك تفاصيل تجربتك مع هذا المرشد...'}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  {locale === 'en' 
                    ? `${reviewData.review.length}/500 characters` 
                    : `${reviewData.review.length}/500 حرف`}
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !reviewData.rating || !reviewData.review.trim()}
                className="w-full bg-primary-600 text-black py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting 
                  ? (locale === 'en' ? 'Submitting...' : 'جاري الإرسال...') 
                  : (locale === 'en' ? 'Submit Review' : 'إرسال التقييم')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;