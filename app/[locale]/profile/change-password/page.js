import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import ChangePasswordForm from '@/components/forms/ChangePasswordForm';

export const metadata = {
  title: 'Change Password | Tourminded',
  description: 'Update your account password',
};

export default async function ChangePasswordPage({ params }) {
  // Ensure params.locale is properly awaited
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Redirect if not authenticated
  if (!user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/profile/change-password`);
  }
  
  return (
    <MainLayout locale={locale} user={user}>
      <div className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <Link 
                href={`/${locale}/profile`}
                className="text-primary-600 hover:text-primary-700 mr-2"
              >
                {locale === 'en' ? '← Back to Profile' : 'العودة إلى الملف الشخصي →'}
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-2xl font-bold mb-6 text-secondary-900">
                {locale === 'en' ? 'Change Password' : 'تغيير كلمة المرور'}
              </h1>
              
              <ChangePasswordForm locale={locale} userId={user._id} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 