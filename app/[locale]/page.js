import MainLayout from '@/components/layout/MainLayout';
import dynamic from 'next/dynamic';
import { getCurrentUser } from '@/lib/auth';

// Use dynamic imports with ssr: false for components that might cause hydration issues
const HeroSection = dynamic(() => import('@/components/common/HeroSection'), { ssr: true });
const TourTypes = dynamic(() => import('@/components/tours/TourTypes'), { ssr: true });
const FeaturedLocations = dynamic(() => import('@/components/common/FeaturedLocations'), { ssr: true });
const FeaturedGuides = dynamic(() => import('@/components/guides/FeaturedGuides'), { ssr: true });
const Testimonials = dynamic(() => import('@/components/common/Testimonials'), { ssr: true });
const CallToAction = dynamic(() => import('@/components/common/CallToAction'), { ssr: true });

// Add ISR with a revalidation period of 60 seconds
export const revalidate = 60;

export default async function Home({ params }) {
  // Ensure params.locale is properly handled
  const localeParams = await params;
  const locale = await localeParams?.locale || 'en';
  
  // Get current user with error handling
  let user = null;
  try {
    // Simply call getCurrentUser which now has its own timeout handling
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    // Continue without user data
  }
  
  return (
    <MainLayout locale={locale} user={user}>
      <HeroSection locale={locale} />
      <TourTypes locale={locale} />
      <FeaturedLocations locale={locale} />
      <FeaturedGuides locale={locale} />
      <Testimonials locale={locale} />
      <CallToAction locale={locale} />
    </MainLayout>
  );
} 