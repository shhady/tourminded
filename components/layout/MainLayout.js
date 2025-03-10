'use client';
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { usePathname, useRouter } from 'next/navigation';

const MainLayout = ({ children, locale, user }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`flex flex-col min-h-screen ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <Header locale={locale} user={user} />
      <main className="flex-grow pt-16">{children}</main>
      <Footer locale={locale} />
    </div>
  );
};

export default MainLayout; 