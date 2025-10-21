'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Plus, User } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const ReviewsSection = ({ guideId, locale }) => {
  const { user, isSignedIn } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallRating, setOverallRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/guides/${guideId}/reviews`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews || []);
          setOverallRating(data.rating || 0);
          setReviewCount(data.reviewCount || 0);
        } else {
          setError(data.message || 'Failed to load reviews');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (guideId) {
      fetchReviews();
    }
  }, [guideId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-3">
              <Star className="w-5 h-5" />
            </span>
            {locale === 'en' ? 'Reviews' : 'التقييمات'}
          </h2>
          
            
            <div className="ml-auto">
              {/* <Link href={`/${locale}/guides/${guideId}/review`} className="text-sm bg-primary-100 text-blue-600 hover:bg-primary-200 font-medium py-1 px-3 rounded-full border border-primary-600">
              {locale === 'en' ? 'Write Review' : 'كتابة تقييم'}
               </Link> */}
             </div>
             </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-3">
            <Star className="w-5 h-5" />
          </span>
          {locale === 'en' ? 'Reviews' : 'التقييمات'}
        </h2>
        
        {/* {isSignedIn && (
          <Link 
            href={`/${locale}/guides/${guideId}/review`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-blue-500 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {locale === 'en' ? 'Write Review' : 'كتابة تقييم'}
          </Link>
        )} */}
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!error && (
        <>
          {/* Overall Rating Summary */}
          {reviewCount > 0 && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {overallRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    {renderStars(overallRating)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {locale === 'en' 
                      ? `Based on ${reviewCount} review${reviewCount !== 1 ? 's' : ''}` 
                      : `على أساس ${reviewCount} تقييم`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                                             <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center space-x-2">
                           <span className="font-medium text-gray-900">
                             {review.user ? 
                               `${review.user.firstName} ${review.user.lastName}`.trim() || 
                               (locale === 'en' ? 'Anonymous User' : 'مستخدم مجهول')
                               : (locale === 'en' ? 'Anonymous User' : 'مستخدم مجهول')
                             }
                           </span>
                           <div className="flex items-center">
                             {renderStars(review.rating)}
                           </div>
                         </div>
                        {review.createdAt && (
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed">
                        {review.review}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">
                {locale === 'en' 
                  ? 'No reviews yet. Be the first to share your experience!' 
                  : 'لا توجد تقييمات بعد. كن أول من يشارك تجربته!'}
              </p>
              {isSignedIn && (
                <Link 
                  href={`/${locale}/guides/${guideId}/review`}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {locale === 'en' ? 'Write First Review' : 'كتابة أول تقييم'}
                </Link>
              )}
            </div>
          )}

          {!isSignedIn && reviews.length === 0 && (
            <div className="text-center py-4">
              <Link 
                href={`/${locale}/sign-in`}
                className="text-primary-600 hover:text-primary-700"
              >
                {locale === 'en' ? 'Sign in to write a review' : 'سجل دخولك لكتابة تقييم'}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsSection;