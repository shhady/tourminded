import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Eye, Edit, Trash, Plus } from 'lucide-react';

export const metadata = {
  title: 'Manage Tours | Tourminded',
  description: 'Manage your tours as a guide',
};

async function getGuideTours(userId) {
  await connectDB();
  
  try {
    // Get guide ID from user
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: userId });
    
    if (!guide) {
      return [];
    }
    
    // Get tours for this guide
    const Tour = (await import('@/models/Tour')).default;
    const tours = await Tour.find({ guide: guide._id }).sort({ createdAt: -1 });
    
    return tours;
  } catch (error) {
    console.error('Error getting guide tours:', error);
    return [];
  }
}

export default async function GuideToursPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user
  const user = await getCurrentUser();
  
  // Redirect if not authenticated or not a guide
  if (!user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/dashboard/guide/tours`);
  }
  
  if (user.role !== 'guide') {
    redirect(`/${locale}/dashboard`);
  }
  
  // Get guide tours
  const tours = await getGuideTours(user._id);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {locale === 'en' ? 'Manage Tours' : 'إدارة الجولات'}
        </h1>
        <Button 
          href={`/${locale}/dashboard/guide/tours/new`}
          variant="primary"
          className="text-black"
        >
          <Plus className="mr-2" />
          {locale === 'en' ? 'Create New Tour' : 'إنشاء جولة جديدة'}
        </Button>
      </div>
      
      {tours.length > 0 ? (
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
                    {locale === 'en' ? 'Status' : 'الحالة'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Actions' : 'الإجراءات'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {tours.map((tour) => (
                  <tr key={tour._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary-100">
                          {tour.images?.cover ? (
                            <img 
                              src={typeof tour.images.cover === 'object' ? tour.images.cover.url : tour.images.cover} 
                              alt={tour.title?.[locale] || 'Tour'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary-200 flex items-center justify-center text-secondary-500">
                              <span className="text-xl font-bold">T</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900">
                            {tour.title?.[locale] || (locale === 'en' ? 'Untitled Tour' : 'جولة بدون عنوان')}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {tour.expertise?.[locale]?.[0] || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">${tour.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        {tour.duration} {tour.durationUnit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tour.active 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-secondary-100 text-secondary-800'
                      }`}>
                        {tour.active 
                          ? (locale === 'en' ? 'Active' : 'نشط')
                          : (locale === 'en' ? 'Inactive' : 'غير نشط')
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/${locale}/tours/${tour._id}`}
                          className="text-secondary-600 hover:text-secondary-900"
                          title={locale === 'en' ? 'View Tour' : 'عرض الجولة'}
                        >
                          <Eye />
                        </Link>
                        <Link
                          href={`/${locale}/dashboard/guide/tours/${tour._id}/edit`}
                          className="text-primary-600 hover:text-primary-900"
                          title={locale === 'en' ? 'Edit Tour' : 'تعديل الجولة'}
                        >
                          <Edit />
                        </Link>
                        <Link
                          href={`/${locale}/dashboard/guide/tours/${tour._id}/delete`}
                          className="text-error-600 hover:text-error-900"
                          title={locale === 'en' ? 'Delete Tour' : 'حذف الجولة'}
                        >
                          <Trash />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900">
            {locale === 'en' ? 'No Tours Found' : 'لم يتم العثور على جولات'}
          </h2>
          <p className="text-secondary-600 mb-6">
            {locale === 'en' 
              ? 'You haven\'t created any tours yet. Create your first tour to start offering your services.' 
              : 'لم تقم بإنشاء أي جولات حتى الآن. قم بإنشاء جولتك الأولى لبدء تقديم خدماتك.'}
          </p>
          <Button 
            href={`/${locale}/dashboard/guide/tours/new`}
            variant="primary"
            className="text-black"
          >
            <Plus className="mr-2" />
            {locale === 'en' ? 'Create New Tour' : 'إنشاء جولة جديدة'}
          </Button>
        </div>
      )}
    </div>
  );
} 