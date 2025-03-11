'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import { CheckCircle, Clock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function GuideRegistrationSuccessPage({ params }) {
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams?.locale || 'en';
  const router = useRouter();
  const { user, loading } = useUser();

  const translations = {
    en: {
      title: 'Registration Submitted!',
      message: 'Thank you for registering as a guide. Your application has been submitted and is pending approval from our administrators.',
      note: 'Once approved, you will be able to create and manage tours through your guide dashboard.',
      home: 'Return to Home',
      status: 'Your current status: Pending Approval',
      waitMessage: 'Please wait for an administrator to review and approve your application.'
    },
    ar: {
      title: 'تم تقديم التسجيل!',
      message: 'شكراً لتسجيلك كمرشد سياحي. تم تقديم طلبك وهو قيد المراجعة من قبل المسؤولين.',
      note: 'بمجرد الموافقة، ستتمكن من إنشاء وإدارة الجولات من خلال لوحة تحكم المرشد الخاصة بك.',
      home: 'العودة إلى الصفحة الرئيسية',
      status: 'حالتك الحالية: في انتظار الموافقة',
      waitMessage: 'يرجى الانتظار حتى يقوم أحد المسؤولين بمراجعة طلبك والموافقة عليه.'
    }
  };

  const t = translations[locale] || translations.en;

  return (
    <MainLayout locale={locale}>
      <div className="py-16 bg-secondary-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
              
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                {t.title}
              </h1>
              
              <p className="text-lg text-secondary-700 mb-4">
                {t.message}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8 w-full">
                <p className="text-blue-800">
                  {t.note}
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8 w-full flex items-center">
                <Clock className="text-yellow-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 font-medium">
                    {t.status}
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    {t.waitMessage}
                  </p>
                </div>
              </div>
              
              <div className="w-full">
                <Button
                  onClick={() => router.push(`/${locale}`)}
                  className="w-full"
                >
                  {t.home}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 