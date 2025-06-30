import MainLayout from '@/components/layout/MainLayout';
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata = {
  title: 'Register | Watermelon Tours',
  description: 'Create a Watermelon Tours account to book tours and connect with expert local guides',
};

export default async function RegisterPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  return (
    <MainLayout locale={locale}>
      <div className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <RegisterForm locale={locale} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 