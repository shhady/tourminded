import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Terms of Service | Tourminded',
  description: 'Terms of Service for Tourminded - Connect with expert local guides for personalized tours in the Holy Land.',
};

export default async function TermsPage({ params }) {
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
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-secondary-900">
            {locale === 'en' ? 'Terms of Service' : 'شروط الخدمة'}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p>
              {locale === 'en' 
                ? 'Welcome to Tourminded. These Terms of Service govern your use of our website and services.' 
                : 'مرحبًا بك في توورمايندد. تحكم شروط الخدمة هذه استخدامك لموقعنا الإلكتروني وخدماتنا.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'Last Updated' : 'آخر تحديث'}
            </h2>
            <p>
              {locale === 'en' ? 'These terms were last updated on January 1, 2023.' : 'تم تحديث هذه الشروط آخر مرة في 1 يناير 2023.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'Acceptance of Terms' : 'قبول الشروط'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations.' 
                : 'من خلال الوصول إلى خدماتنا أو استخدامها، فإنك توافق على الالتزام بشروط الخدمة هذه وجميع القوانين واللوائح المعمول بها.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'User Accounts' : 'حسابات المستخدمين'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding your password and for all activities that occur under your account.' 
                : 'عند إنشاء حساب معنا، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن حماية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تتم تحت حسابك.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'Booking and Cancellation' : 'الحجز والإلغاء'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'All bookings are subject to availability. Cancellation policies vary by tour and guide. Please refer to the specific tour details for cancellation terms.' 
                : 'تخضع جميع الحجوزات للتوفر. تختلف سياسات الإلغاء حسب الجولة والمرشد. يرجى الرجوع إلى تفاصيل الجولة المحددة لمعرفة شروط الإلغاء.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'Contact Us' : 'اتصل بنا'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'If you have any questions about these Terms, please contact us at info@tourminded.com.' 
                : 'إذا كانت لديك أي أسئلة حول هذه الشروط، يرجى الاتصال بنا على info@tourminded.com.'}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 