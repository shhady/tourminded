import MainLayout from '@/components/layout/MainLayout';
import LoginForm from '@/components/forms/LoginForm';

export const metadata = {
  title: 'Login | Watermelon Tours',
  description: 'Login to your Watermelon Tours account to book tours and manage your bookings',
};

export default async function LoginPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  return (
    <MainLayout locale={locale}>
      <div className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <LoginForm locale={locale} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 