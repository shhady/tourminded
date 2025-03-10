'use client';

import MainLayout from '@/components/layout/MainLayout';
import { usePathname } from 'next/navigation';

export default function AuthLayout({ children }) {
  // Get the locale from the pathname
  const pathname = usePathname();
  const localeMatch = pathname.match(/\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : 'en';
  
  return (
    <MainLayout locale={locale}>
      {children}
    </MainLayout>
  );
} 