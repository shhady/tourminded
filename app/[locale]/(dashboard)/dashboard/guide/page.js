'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { useUser } from '@/contexts/UserContext';
import MainLayout from '@/components/layout/MainLayout';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Loader } from 'lucide-react';

export default function GuideDashboardPage({ params }) {
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams?.locale || 'en';
  const router = useRouter();
  
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkUser();
  const { user, loading: userContextLoading } = useUser();
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle authentication and role check
  useEffect(() => {
    // Wait for both Clerk and UserContext to load
    if (!clerkLoaded || userContextLoading) {
      return;
    }
    
    // If not signed in, redirect to login
    // if (!isSignedIn) {
    //   router.push(`/${locale}/sign-in?callbackUrl=/${locale}/dashboard/guide`);
    //   return;
    // }
    
    // If user is loaded but not a guide, redirect to home
    // if (user && user.role !== 'guide') {
    //   router.push(`/${locale}`);
    //   return;
    // }
    
    // Everything is loaded and user is authenticated as a guide
    setIsLoading(false);
  }, [clerkLoaded, isSignedIn, user, userContextLoading, router, locale]);
  
  if (isLoading) {
    return (
      
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-2 text-secondary-700">
            {locale === 'en' ? 'Loading dashboard...' : 'جاري تحميل لوحة التحكم...'}
          </span>
        </div>
    
    );
  }
  
  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* <DashboardSidebar locale={locale} userRole="guide" /> */}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-secondary-900 mb-6">
              {locale === 'en' ? 'Guide Dashboard' : 'لوحة تحكم المرشد'}
            </h1>
            
            {/* Dashboard content goes here */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                {locale === 'en' ? 'Welcome to your dashboard' : 'مرحبًا بك في لوحة التحكم'}
              </h2>
              <p className="text-secondary-700">
                {locale === 'en' 
                  ? 'Manage your tours, bookings, and profile from here.' 
                  : 'يمكنك إدارة جولاتك وحجوزاتك وملفك الشخصي من هنا.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 