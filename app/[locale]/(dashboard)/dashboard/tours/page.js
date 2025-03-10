import { useLocale } from 'next-intl';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Edit, Trash, Plus, Star } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Tours | Tourminded',
  description: 'Manage your tours',
};

async function getTours(userId, role) {
  await connectDB();
  
  let filter = {};
  
  if (role === 'admin') {
    // Admin sees all tours
    filter = {};
  } else if (role === 'guide') {
    // Guide sees their tours - use userId directly as guide
    filter = { guide: userId };
  } else {
    // Regular users shouldn't access this page, but just in case
    return [];
  }
  
  const tours = await Tour.find(filter)
    .populate('guide', 'name')
    // Don't try to populate locations since we're using locationNames
    .sort({ createdAt: -1 });
  
  return tours;
}

export default async function ToursPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  const user = await getCurrentUser();
  const tours = await getTours(user._id, user.role);
  
  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=';
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {locale === 'en' ? 'Tours' : 'الجولات'}
        </h1>
        
        {(user.role === 'admin' || user.role === 'guide') && (
          <Button href={`/${locale}/dashboard/guide/tours/new`} className="flex items-center">
            <Plus className="mr-2" />
            {locale === 'en' ? 'Add Tour' : 'إضافة جولة'}
          </Button>
        )}
      </div>
      
      {tours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <div key={tour._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={tour.images?.cover?.url || placeholderImage}
                  alt={tour.title?.en || tour.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <span className="flex items-center text-yellow-500">
                    {tour.rating}
                    <Star className="ml-1" />
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {tour.title?.[locale] || tour.title?.en || tour.title}
                </h3>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-secondary-600">
                    {locale === 'en' ? 'Price:' : 'السعر:'} ${tour.price}
                  </span>
                  <span className="text-secondary-600">
                    {tour.duration} {tour.durationUnit === 'hours' 
                      ? (locale === 'en' ? 'hours' : 'ساعات')
                      : (locale === 'en' ? 'days' : 'أيام')}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {tour.locationNames?.map((location, index) => (
                    <span 
                      key={index} 
                      className="inline-block bg-secondary-100 text-secondary-800 text-xs px-2 py-1 rounded-full"
                    >
                      {location}
                    </span>
                  )) || tour.locations?.map((location) => (
                    <span 
                      key={typeof location === 'object' ? location._id : location} 
                      className="inline-block bg-secondary-100 text-secondary-800 text-xs px-2 py-1 rounded-full"
                    >
                      {typeof location === 'object' 
                        ? (location.name?.[locale] || location.name?.en || location.name)
                        : location}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Link
                    href={`/dashboard/tours/${tour._id}`}
                    className="text-primary-600 hover:text-primary-900 p-1"
                  >
                    <Eye />
                  </Link>
                  {(user.role === 'admin' || user.role === 'guide') && (
                    <>
                      <Link
                        href={`/dashboard/tours/${tour._id}/edit`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit />
                      </Link>
                      <Link
                        href={`/dashboard/tours/${tour._id}/delete`}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-secondary-500 mb-4">
            {locale === 'en' ? 'No tours found' : 'لم يتم العثور على جولات'}
          </p>
          {(user.role === 'admin' || user.role === 'guide') && (
            <Button href="/dashboard/tours/new">
              {locale === 'en' ? 'Create your first tour' : 'إنشاء أول جولة لك'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 