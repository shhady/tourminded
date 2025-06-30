import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Star, User, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Guide Reviews | Watermelon Tours',
  description: 'Manage and view your reviews as a guide on Watermelon Tours.',
};

async function getGuideReviews(userId) {
  await connectDB();
  
  try {
    // Get guide ID from user
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: userId });
    
    if (!guide) {
      return [];
    }
    
    // Get reviews for this guide
    const Review = (await import('@/models/Review')).default;
    const reviews = await Review.find({ guide: guide._id })
      .populate('user', 'name')
      .populate('tour', 'title')
      .sort({ createdAt: -1 });
    
    return reviews;
  } catch (error) {
    console.error('Error getting guide reviews:', error);
    return [];
  }
}

export default async function GuideReviewsPage({ params }) {
  // Ensure params.locale is properly handled
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Redirect if not authenticated or not a guide
  if (!user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/dashboard/guide/reviews`);
  }
  
  if (user.role !== 'guide') {
    redirect(`/${locale}/dashboard`);
  }
  
  // Get guide reviews
  const reviews = await getGuideReviews(user._id);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {locale === 'en' ? 'Reviews' : 'التقييمات'}
      </h1>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="bg-secondary-100 rounded-full p-3 mr-3">
                    <User className="text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">{review.user?.name || 'Anonymous'}</h3>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-secondary-600">{review.rating}/5</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-secondary-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(review.createdAt)}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-secondary-900 mb-1">
                  {locale === 'en' ? 'Tour' : 'الجولة'}:
                </h4>
                <p className="text-secondary-700">
                  {review.tour?.title?.[locale] || review.tour?.title?.en || 'N/A'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-secondary-900 mb-1">
                  {locale === 'en' ? 'Comment' : 'التعليق'}:
                </h4>
                <p className="text-secondary-700">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-secondary-500 mb-4">
            {locale === 'en' ? 'No reviews found' : 'لم يتم العثور على تقييمات'}
          </p>
          <p className="text-secondary-700">
            {locale === 'en' 
              ? 'As you complete more tours, your reviews will appear here.' 
              : 'عندما تكمل المزيد من الجولات، ستظهر تقييماتك هنا.'}
          </p>
        </div>
      )}
    </div>
  );
} 