'use client';
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

const MainLayout = ({ children, locale }) => {
  const { isLoaded: authLoaded, userId, sessionId } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Check if we're in a dashboard route
  const isDashboard = pathname.includes('/dashboard');

  useEffect(() => {
    setIsLoaded(true);
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  // Fetch user data from our API if needed
  useEffect(() => {
    if (authLoaded && userId) {
      // You can fetch additional user data here if needed
      // For now, we'll just use the basic auth info
    }
  }, [authLoaded, userId]);

  return (
    <div className={`flex flex-col min-h-screen ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      {!isDashboard && <Header locale={locale} />}
      <main className={`flex-grow ${!isDashboard ? 'pt-16' : ''}`}>{children}</main>
      {!isDashboard && <Footer locale={locale} />}
    </div>
  );
};

export default MainLayout; 