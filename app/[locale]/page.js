import MainLayout from '@/components/layout/MainLayout';
import dynamic from 'next/dynamic';
import FeaturedGuides from '@/components/guides/FeaturedGuides';

// Use dynamic imports with ssr: true for components that might cause hydration issues
const HeroSection = dynamic(() => import('@/components/common/HeroSection'), { ssr: true });
const TourTypeCarousel = dynamic(() => import('@/components/home/TourTypeCarousel'), { ssr: true });
const FeaturedLocations = dynamic(() => import('@/components/common/FeaturedLocations'), { ssr: true });
const Testimonials = dynamic(() => import('@/components/common/Testimonials'), { ssr: true });
const CallToAction = dynamic(() => import('@/components/common/CallToAction'), { ssr: true });

// Add ISR with a revalidation period of 60 seconds
export const revalidate = 60;

export default async function Home({ params }) {
  // Ensure params.locale is properly handled
  const localeParams = await params;
  const locale = await localeParams?.locale || 'en';
  
  return (
    <MainLayout locale={locale}>
      <HeroSection locale={locale} />
      <TourTypeCarousel locale={locale} />
      <FeaturedLocations locale={locale} />
      <FeaturedGuides locale={locale} />
      <Testimonials locale={locale} />
      <CallToAction locale={locale} />
    </MainLayout>
  );
} 