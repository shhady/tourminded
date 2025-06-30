'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MapPin, Users, Star, Settings, LogOut, Menu, X } from 'lucide-react';
import { Compass } from 'lucide-react';

const DashboardLayout = ({ children, user, locale }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    const commonLinks = [
      {
        name: locale === 'en' ? 'Dashboard' : 'لوحة التحكم',
        href: '/dashboard',
        icon: <Home className="w-5 h-5" />,
      },
      {
        name: locale === 'en' ? 'Bookings' : 'الحجوزات',
        href: '/dashboard/bookings',
        icon: <Calendar className="w-5 h-5" />,
      },
      // {
      //   name: locale === 'en' ? 'Settings' : 'الإعدادات',
      //   href: '/dashboard/settings',
      //   icon: <Settings className="w-5 h-5" />,
      // },
    ];

    if (user?.role === 'admin') {
      return [
        ...commonLinks,
        {
          name: locale === 'en' ? 'Users' : 'المستخدمين',
          href: '/dashboard/users',
          icon: <Users className="w-5 h-5" />,
        },
        {
          name: locale === 'en' ? 'Tours' : 'الجولات',
          href: '/dashboard/tours',
          icon: <Compass className="w-5 h-5" />,
        },
        {
          name: locale === 'en' ? 'Guides' : 'المرشدين',
          href: '/dashboard/guides',
          icon: <Users className="w-5 h-5" />,
        },
        {
          name: locale === 'en' ? 'Locations' : 'المواقع',
          href: '/dashboard/locations',
          icon: <MapPin className="w-5 h-5" />,
        },
        {
          name: locale === 'en' ? 'Reviews' : 'التقييمات',
          href: '/dashboard/reviews',
          icon: <Star className="w-5 h-5" />,
        },
      ];
    } else if (user?.role === 'guide') {
      return [
        ...commonLinks,
        {
          name: locale === 'en' ? 'My Tours' : 'جولاتي',
          href: '/dashboard/tours',
          icon: <Compass className="w-5 h-5" />,
        },
        {
          name: locale === 'en' ? 'My Profile' : 'ملفي الشخصي',
          href: '/dashboard/guide/profile',
          icon: <Users className="w-5 h-5" />,
        },
        {
          name: locale === 'en' ? 'Reviews' : 'التقييمات',
          href: '/dashboard/reviews',
          icon: <Star className="w-5 h-5" />,
        },
      ];
    }

    return commonLinks;
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed z-50 bottom-4 right-4 p-3 rounded-full bg-primary-600 text-black shadow-lg md:hidden"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-secondary-900 text-black transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 bg-white' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full bg-secondary-900">
          {/* Sidebar Header */}
          <div className="px-4 py-6 border-b border-secondary-800">
            <Link href="/" className="text-2xl font-bold text-black">
            Watermelon Tours
            </Link>
            <p className="text-sm text-secondary-400 mt-1">
              {user?.role === 'admin'
                ? locale === 'en'
                  ? 'Admin Dashboard'
                  : 'لوحة تحكم المسؤول'
                : user?.role === 'guide'
                ? locale === 'en'
                  ? 'Guide Dashboard'
                  : 'لوحة تحكم المرشد'
                : locale === 'en'
                ? 'User Dashboard'
                : 'لوحة تحكم المستخدم'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      pathname === link.href
                        ? 'bg-primary-700 text-black'
                        : 'text-secondary-300 hover:bg-secondary-800 hover:text-black'
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-secondary-800">
            <Link
              href="/api/auth/logout"
              className="flex items-center text-black hover:text-black transition-colors"
            >
              <LogOut className="mr-3" />
              <span>{locale === 'en' ? 'Logout' : 'تسجيل الخروج'}</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-64'
        }`}
      >
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout; 