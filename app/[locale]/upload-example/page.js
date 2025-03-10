import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';
import ImageUploadExample from '@/components/forms/ImageUploadExample';

export const metadata = {
  title: 'Image Upload Example | Tourminded',
  description: 'Test the image upload functionality',
};

export default async function UploadExamplePage({ params }) {
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
  
  return (
    <MainLayout locale={locale} user={user}>
      <div className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center text-secondary-900">
            {locale === 'en' ? 'Image Upload Example' : 'مثال على تحميل الصور'}
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <ImageUploadExample locale={locale} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 