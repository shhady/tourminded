import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import User from '@/models/User';
import Tour from '@/models/Tour';
import { Edit, Eye, Clock, Users, MapPin, Globe } from 'lucide-react';
import DeleteTourButton from '@/components/dashboard/DeleteTourButton';

export const metadata = {
  title: 'My Tours | Tourminded',
  description: 'Manage your tours as a guide',
};

async function getUserTours(userId) {
  await connectDB();
  
  try {
    // Get user's tours directly by user ID
    const tours = await Tour.find({ guide: userId })
      .sort({ createdAt: -1 });
    
    // Convert Mongoose documents to plain objects
    return tours.map(tour => ({
      _id: tour._id.toString(),
      title: tour.title,
      price: tour.price,
      duration: tour.duration,
      durationUnit: tour.durationUnit,
      maxGroupSize: tour.maxGroupSize,
      active: tour.isActive,
      locationNames: tour.locationNames || [],
      createdAt: tour.createdAt
    }));
  } catch (error) {
    console.error('Error getting user tours:', error);
    return [];
  }
}

export default async function GuideToursPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user with Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  // Connect to database
  await connectDB();
  
  // Find user in our database
  const user = await User.findOne({ clerkId: clerkUser.id });
  
  if (!user) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  // Redirect if not a guide
  if (user.role !== 'guide') {
    redirect(`/${locale}/dashboard`);
    return;
  }
  
  // Get user's tours directly
  const tours = await getUserTours(user._id);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {locale === 'en' ? 'My Tours' : 'جولاتي'}
        </h1>
        <Button 
          href={`/${locale}/dashboard/guide/tours/new`}
          variant="primary"
          className="text-black"
        >
          {locale === 'en' ? 'Create New Tour' : 'إنشاء جولة جديدة'}
        </Button>
      </div>
      
      {tours.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900">
            {locale === 'en' ? 'No Tours Yet' : 'لا توجد جولات بعد'}
          </h2>
          <p className="text-secondary-600 mb-6">
            {locale === 'en' 
              ? 'You haven\'t created any tours yet. Create your first tour to start receiving bookings.' 
              : 'لم تقم بإنشاء أي جولات بعد. قم بإنشاء جولتك الأولى لبدء استقبال الحجوزات.'}
          </p>
          <Button 
            href={`/${locale}/dashboard/guide/tours/new`}
            variant="primary"
            className="text-black"
          >
            {locale === 'en' ? 'Create Your First Tour' : 'إنشاء جولتك الأولى'}
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Tour' : 'الجولة'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Price' : 'السعر'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Duration' : 'المدة'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Group Size' : 'حجم المجموعة'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Status' : 'الحالة'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Actions' : 'إجراءات'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {tours.map(tour => (
                  <tr key={tour._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {typeof tour.title === 'object' 
                          ? (locale === 'en' ? tour.title.en : tour.title.ar) || tour.title.en || 'Untitled Tour'
                          : tour.title || 'Untitled Tour'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        ${tour.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-secondary-900">
                        <Clock className="h-4 w-4 mr-1 text-secondary-500" />
                        {tour.duration} {tour.durationUnit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-secondary-900">
                        <Users className="h-4 w-4 mr-1 text-secondary-500" />
                        {tour.maxGroupSize}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tour.active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {locale === 'en' ? 'Active' : 'نشط'}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {locale === 'en' ? 'Inactive' : 'غير نشط'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          href={`/${locale}/tours/${tour._id}`}
                          className="text-secondary-600 hover:text-secondary-900"
                          title={locale === 'en' ? 'View Tour' : 'عرض الجولة'}
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link 
                          href={`/${locale}/dashboard/guide/tours/edit/${tour._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title={locale === 'en' ? 'Edit Tour' : 'تعديل الجولة'}
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <DeleteTourButton tourId={tour._id} locale={locale} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 