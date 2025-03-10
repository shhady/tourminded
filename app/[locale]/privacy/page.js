import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Privacy Policy | Tourminded',
  description: 'Privacy Policy for Tourminded - Connect with expert local guides for personalized tours in the Holy Land.',
};

export default async function PrivacyPage({ params }) {
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
            {locale === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p>
              {locale === 'en' 
                ? 'At Tourminded, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.' 
                : 'في توورمايندد، نأخذ خصوصيتك على محمل الجد. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك الشخصية واستخدامها وحمايتها.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'Last Updated' : 'آخر تحديث'}
            </h2>
            <p>
              {locale === 'en' ? 'This policy was last updated on January 1, 2023.' : 'تم تحديث هذه السياسة آخر مرة في 1 يناير 2023.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'Information We Collect' : 'المعلومات التي نجمعها'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support.' 
                : 'نجمع المعلومات التي تقدمها لنا مباشرة، مثل عندما تنشئ حسابًا، أو تقوم بالحجز، أو تتصل بنا للحصول على الدعم.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'How We Use Your Information' : 'كيف نستخدم معلوماتك'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'We use your information to provide, maintain, and improve our services, process transactions, send communications, and for other purposes with your consent.' 
                : 'نستخدم معلوماتك لتقديم خدماتنا وصيانتها وتحسينها، ومعالجة المعاملات، وإرسال الاتصالات، ولأغراض أخرى بموافقتك.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'Information Sharing' : 'مشاركة المعلومات'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'We may share your information with guides, service providers, and as required by law. We do not sell your personal information.' 
                : 'قد نشارك معلوماتك مع المرشدين ومقدمي الخدمات وحسب ما يقتضيه القانون. نحن لا نبيع معلوماتك الشخصية.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'Your Rights' : 'حقوقك'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'You have the right to access, update, or delete your personal information. You can manage your preferences through your account settings.' 
                : 'لديك الحق في الوصول إلى معلوماتك الشخصية أو تحديثها أو حذفها. يمكنك إدارة تفضيلاتك من خلال إعدادات حسابك.'}
            </p>
            
            <h2>
              {locale === 'en' ? 'Contact Us' : 'اتصل بنا'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'If you have any questions about this Privacy Policy, please contact us at privacy@tourminded.com.' 
                : 'إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على privacy@tourminded.com.'}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 