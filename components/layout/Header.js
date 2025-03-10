'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Menu, X, User, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import Button from '../ui/Button';
import { locales } from '@/lib/i18n';
import Image from 'next/image';
import { SignOutButton } from '@clerk/nextjs';
import { useUser } from '@clerk/clerk-react'
const Header = ({ locale }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoaded } = useUser();
  // const { user } = currentUser();
  console.log(user)
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === `/${locale}`;

  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const changeLanguage = (newLocale) => {
    // Create a new URL with the new locale
    const currentPath = pathname;
    const segments = currentPath.split('/');
    
    // Replace the locale segment (which is the first segment after the initial slash)
    if (segments.length > 1) {
      if (locales.includes(segments[1])) {
        segments[1] = newLocale;
      } else {
        segments.splice(1, 0, newLocale);
      }
    } else {
      segments.push(newLocale);
    }
    
    const newPath = segments.join('/');
    router.push(newPath);
    setIsLanguageMenuOpen(false);
  };

  // Fix links to include locale
  const getLocalizedHref = (href) => {
    if (href === '/') {
      return `/${locale}`;
    }
    return `/${locale}${href}`;
  };

  const navLinks = [
    { name: locale === 'en' ? 'Home' : 'الرئيسية', href: '/' },
    { name: locale === 'en' ? 'Tours' : 'الجولات', href: '/tours' },
    { name: locale === 'en' ? 'Guides' : 'المرشدين', href: '/guides' },
    { name: locale === 'en' ? 'Locations' : 'المواقع', href: '/locations' },
    { name: locale === 'en' ? 'Quiz' : 'الاختبار', href: '/quiz' },
    { name: locale === 'en' ? 'About' : 'عن الموقع', href: '/about' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === `/${locale}`;
    }
    return pathname.startsWith(`/${locale}${href}`);
  };

  // Determine if we should use dark text (when scrolled or not on homepage)
  const useDarkText = isScrolled || !isHomePage;

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return null;
    
    switch (user.publicMetadata?.role) {
      case 'admin':
        return `/${locale}/dashboard/admin`;
      case 'guide':
        return `/${locale}/dashboard/guide`;
      default:
        return `/${locale}/profile`;
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout');
      if (response.ok) {
        // Redirect to home page
        router.push(`/${locale}`);
        // Force a refresh to update the UI
        router.refresh();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-soft py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={getLocalizedHref('/')} className="text-2xl font-bold flex items-center">
            {/* Replace with your actual logo */}
            <span className={`transition-colors duration-300 ${useDarkText ? 'text-secondary-900' : 'text-black'}`}>
              Tourminded
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getLocalizedHref(link.href)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive(link.href)
                    ? 'text-primary-600 font-medium'
                    : `${useDarkText 
                        ? 'text-secondary-900 hover:text-primary-600 hover:bg-primary-50' 
                        : 'text-black hover:text-black hover:bg-white/20'}`
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={toggleLanguageMenu}
                className={`flex items-center rounded-md px-3 py-2 transition-colors ${
                  useDarkText
                    ? 'text-secondary-900 hover:text-primary-600 hover:bg-primary-50'
                    : 'text-black hover:text-black hover:bg-white/20'
                }`}
              >
                <Globe className="mr-1 h-4 w-4" />
                <span>{locale === 'en' ? 'English' : 'العربية'}</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-medium z-10 animate-fade-in overflow-hidden">
                  <button
                    onClick={() => changeLanguage('en')}
                    className="block w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    className="block w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    العربية
                  </button>
                </div>
              )}
            </div>
           
            {/* User Menu or Login/Register Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className={`flex items-center rounded-md px-3 py-2 transition-colors ${
                    useDarkText
                      ? 'text-secondary-900 hover:text-primary-600 hover:bg-primary-50'
                      : 'text-black hover:text-black hover:bg-white/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                    <User className="text-primary-600 h-4 w-4" />
                   
                  </div>
                  <span>{user.name}</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium z-10 animate-fade-in overflow-hidden">
                    {/* Dashboard Link - only for admin and guide */}
                    {user.publicMetadata?.role === 'admin' || user.publicMetadata?.role === 'guide' ? (
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {locale === 'en' ? 'Dashboard' : 'لوحة التحكم'}
                      </Link>
                    ) : (
                      // "Become a Guide" link for regular users
                      <Link
                        href={`/${locale}/guide/register`}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                          <path d="M18 6h-5c-1.1 0-2 .9-2 2"></path>
                          <path d="M9 14c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-2"></path>
                          <path d="M3 10a7 7 0 0 0 7 7h.3"></path>
                          <path d="M11 17.3a7 7 0 0 0 7 7"></path>
                          <path d="M14 21h.01"></path>
                        </svg>
                        {locale === 'en' ? 'Become a Guide' : 'كن مرشدًا'}
                      </Link>
                    )}
                    
                    {/* Profile Link - for all users */}
                    <Link
                      href={`/${locale}/profile`}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {locale === 'en' ? 'My Profile' : 'الملف الشخصي'}
                    </Link>
                    
                    {/* Logout Button */}
                    <div className=' cursor-pointer flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors border-t border-secondary-100'>
                    <LogOut className="mr-2 h-4 w-4" /> 
                    <SignOutButton />
                    </div>
                    {/* <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors border-t border-secondary-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {locale === 'en' ? 'Logout' : 'تسجيل الخروج'}
                    </button> */}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  href={'/sign-in'}
                  variant={useDarkText ? "outline" : "ghost"}
                  size="sm"
                  className={!useDarkText ? "border-white text-black hover:bg-white/20" : "text-secondary-900"}
                >
                  {locale === 'en' ? 'Login' : 'تسجيل الدخول'}  
                </Button>
                <Button
                  href={'/sign-up'}
                  variant="primary"
                  size="sm"
                  className="text-black"
                >
                  {locale === 'en' ? 'Register' : 'التسجيل'}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden p-2 rounded-md transition-colors ${
              useDarkText
                ? 'text-secondary-900 hover:text-primary-600 hover:bg-primary-50'
                : 'text-black hover:text-black hover:bg-white/20'
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-secondary-200 animate-slide-down bg-white">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={getLocalizedHref(link.href)}
                  className={`px-4 py-3 rounded-md transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-secondary-900 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* User Menu (Mobile) */}
              {user && (
                <div className="pt-4 border-t border-secondary-200 mt-4">
                  <p className="px-4 text-sm font-medium text-secondary-900 mb-2">
                    {locale === 'en' ? 'Account' : 'الحساب'}
                  </p>
                  
                  {/* Dashboard Link - only for admin and guide */}
                  {user.publicMetadata?.role === 'admin' || user.publicMetadata?.role === 'guide' ? (
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center px-4 py-3 rounded-md text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {locale === 'en' ? 'Dashboard' : 'لوحة التحكم'}
                    </Link>
                  ) : null}
                  
                  {/* Profile Link - for all users */}
                  <Link
                    href={`/${locale}/profile`}
                    className="flex items-center px-4 py-3 rounded-md text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {locale === 'en' ? 'My Profile' : 'الملف الشخصي'}
                  </Link>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full text-left px-4 py-3 rounded-md text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {locale === 'en' ? 'Logout' : 'تسجيل الخروج'}
                  </button>
                </div>
              )}
              
              {/* Language Switcher (Mobile) */}
              <div className="pt-4 border-t border-secondary-200 mt-4">
                <p className="px-4 text-sm font-medium text-secondary-900 mb-2">
                  {locale === 'en' ? 'Language' : 'اللغة'}
                </p>
                <button
                  onClick={() => {
                    changeLanguage('en');
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                    locale === 'en'
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-secondary-900 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <Globe className="mr-2 h-4 w-4" /> English
                </button>
                <button
                  onClick={() => {
                    changeLanguage('ar');
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                    locale === 'ar'
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-secondary-900 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <Globe className="mr-2 h-4 w-4" /> العربية
                </button>
              </div>
              
              {/* Login/Register (Mobile) */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-secondary-200 mt-4">
                  <Button
                    href={getLocalizedHref('/auth/login')}
                    variant="outline"
                    size="md"
                    className="w-full text-secondary-900"
                  >
                    {locale === 'en' ? 'Login' : 'تسجيل الدخول'}
                  </Button>
                  <Button
                    href={getLocalizedHref('/auth/register')}
                    variant="primary"
                    size="md"
                    className="w-full text-black"
                  >
                    {locale === 'en' ? 'Register' : 'التسجيل'}
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 