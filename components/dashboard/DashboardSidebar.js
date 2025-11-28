'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Calendar, Map, MessageSquare, Settings, Home, Menu, X, HomeIcon, Compass, Users, HelpCircle } from 'lucide-react';

export default function DashboardSidebar({ locale, userRole }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const guideLinks = [
    {
      href: `/${locale}/dashboard/guide`,
      icon: <Home className="w-5 h-5" />,
      label: locale === 'en' ? 'Dashboard' : 'لوحة التحكم',
    },
    {
      href: `/${locale}/dashboard/guide/profile`,
      icon: <User className="w-5 h-5" />,
      label: locale === 'en' ? 'My Profile' : 'الملف الشخصي',
    },
    {
      href: `/${locale}/dashboard/guide/tours`,
      icon: <Map className="w-5 h-5" />,
      label: locale === 'en' ? 'My Tours' : 'جولاتي',
    },
    {
      href: `/${locale}/dashboard/guide/availability`,
      icon: <Calendar className="w-5 h-5" />,
      label: locale === 'en' ? 'Availability' : 'التوفر',
    },
    {
      href: `/${locale}/dashboard/guide/bookings`,
      icon: <Calendar className="w-5 h-5" />,
      label: locale === 'en' ? 'Bookings' : 'الحجوزات',
    },
    // {
    //   href: `/${locale}/dashboard/guide/messages`,
    //   icon: <MessageSquare className="w-5 h-5" />,
    //   label: locale === 'en' ? 'Messages' : 'الرسائل',
    // },
     {
      href: `/`,
      icon: <HomeIcon className="w-5 h-5" />,
      label: locale === 'en' ? 'Home Page' : 'الرئيسية',
    },
    // {
    //   href: `/${locale}/dashboard/guide/settings`,
    //   icon: <Settings className="w-5 h-5" />,
    //   label: locale === 'en' ? 'Settings' : 'الإعدادات',
    // },
  ];
  
  const adminLinks = [
    {
      href: `/${locale}/dashboard/admin`,
      icon: <Users className="w-5 h-5" />,
      label: locale === 'en' ? 'Guides' : 'المرشدون',
    },
    {
      href: `/${locale}/dashboard/admin/bookings`,
      icon: <Calendar className="w-5 h-5" />,
      label: locale === 'en' ? 'Bookings' : 'الحجوزات',
    },
    {
      href: `/${locale}/dashboard/admin/tours`,
      icon: <Compass className="w-5 h-5" />,
      label: locale === 'en' ? 'Tours' : 'الجولات',
    },
    {
      href: `/${locale}/dashboard/admin/users`,
      icon: <Users className="w-5 h-5" />,
      label: locale === 'en' ? 'Users' : 'المستخدمون',
    },
    {
      href: `/${locale}/dashboard/admin/messages`,
      icon: <MessageSquare className="w-5 h-5" />,
      label: locale === 'en' ? 'User Messages' : 'رسائل المستخدمين',
    },
    {
      href: `/${locale}/dashboard/admin/faq`,
      icon: <HelpCircle className="w-5 h-5" />,
      label: locale === 'en' ? 'FAQ' : 'الأسئلة الشائعة',
    },
    {
      href: `/`,
      icon: <HomeIcon className="w-5 h-5" />,
      label: locale === 'en' ? 'Home Page' : 'الرئيسية',
    },
  ];
  
  const links = userRole === 'guide' ? guideLinks : adminLinks;
  
  return (
    <>
      {/* Mobile menu toggle */}
      <h1 className="text-3xl font-bold mb-8">
            <Link href="/" className="text-primary-600 hover:text-primary-700 transition-colors border-b-2 border-primary-600">
            Watermelon Tours.
            </Link>
          </h1>
      <div className="md:hidden bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
        
        <h2 className="font-semibold text-secondary-900">
          {locale === 'en' ? 'Navigation' : 'التنقل'}
        </h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-secondary-700 hover:text-secondary-900"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Sidebar content */}
      <div className={`bg-white rounded-lg shadow-md p-4 overflow-y-auto ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
        <h2 className="font-semibold text-secondary-900 mb-4 px-4 hidden md:block">
          {locale === 'en' ? 'Navigation' : 'التنقل'}
        </h2>
        <nav>
          <ul>
            {links.map((link) => (
              <li key={link.href} className="mb-1">
                <Link
                  href={link.href}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
} 