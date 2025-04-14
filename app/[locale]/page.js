import MainLayout from '@/components/layout/MainLayout';
import dynamic from 'next/dynamic';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Use dynamic imports with ssr: false for components that might cause hydration issues
const HeroSection = dynamic(() => import('@/components/common/HeroSection'), { ssr: true });
const TourTypeCarousel = dynamic(() => import('@/components/home/TourTypeCarousel'), { ssr: true });
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
  
  // Get user data for the page
  let userData = null;
  try {
    const clerkUser = await currentUser();
    
    if (clerkUser) {
      await connectDB();
      const user = await User.findOne({ clerkId: clerkUser.id });
      if (user) {
        // Convert Mongoose document to plain JavaScript object
        userData = {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          clerkId: user.clerkId,
          // Add other fields you need, but make sure they're serializable
        };
      }
    }
  } catch (error) {
    console.error("Error getting user data:", error);
  }
  
  return (
    <MainLayout locale={locale} user={userData}>
      <HeroSection locale={locale} />
      <TourTypeCarousel locale={locale} />
      <FeaturedLocations locale={locale} />
      <FeaturedGuides locale={locale} />
      <Testimonials locale={locale} />
      <CallToAction locale={locale} />
    </MainLayout>
  );
} 