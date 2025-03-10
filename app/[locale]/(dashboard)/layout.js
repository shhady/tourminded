import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Dashboard | Tourminded',
  description: 'Manage your tours, bookings, and profile',
};

export default async function DashboardPageLayout({ children, params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/dashboard`);
  }
  
  return <DashboardLayout user={user} locale={locale}>{children}</DashboardLayout>;
} 