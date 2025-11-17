'use client';
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { usePathname } from 'next/navigation';

const MainLayout = ({ children, locale }) => {
  const [clientLoaded, setClientLoaded] = useState(false);
  const pathname = usePathname();
  
  // Check if we're in a dashboard route
  const isDashboard = pathname?.includes('/dashboard') || false;

  // Only mark as loaded when running on client and everything has loaded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientLoaded(true);
      
      // Scroll to top on route change
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className={`flex flex-col min-h-screen transition-opacity duration-300 ${clientLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {!isDashboard && <Header locale={locale} />}
      <main className={`flex-grow ${!isDashboard ? 'pt-16' : ''}`}>{children}</main>
      {!isDashboard && <Footer locale={locale} />}
    </div>
  );
};

export default MainLayout; 