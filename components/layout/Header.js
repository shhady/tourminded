'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Menu, X, User, ChevronDown, LogOut, LayoutDashboard, Clock, Heart, MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import { locales } from '@/lib/i18n';
import Image from 'next/image';
import { SignOutButton } from '@clerk/nextjs';
import { useUser } from '@/contexts/UserContext';
// import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useUser as useUserClerk } from '@clerk/clerk-react';
const Header = ({ locale }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useUser();
  const { user: userClerk } = useUserClerk();
  const [guideStatus, setGuideStatus] = useState(null); // 'active', 'pending', or null
  const [messagesLink, setMessagesLink] = useState(`/${locale}/chat`);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === `/${locale}`;

  // Fetch guide status when user is loaded
  useEffect(() => {
    const fetchGuideStatus = async () => {
      if (!user || !user._id) return;
      
      try {
        const response = await fetch(`/api/guides/user/${user._id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.guide) {
            // Guide exists, check if active
            setGuideStatus(data.guide.active ? 'active' : 'pending');
            // All users (including guides) go to general chat page
            setMessagesLink(`/${locale}/chat`);
          } else {
            // No guide profile
            setGuideStatus(null);
            // Keep default messages link
            setMessagesLink(`/${locale}/chat`);
          }
        }
      } catch (error) {
        console.error('Error fetching guide status:', error);
      }
    };
    
    fetchGuideStatus();
  }, [user]);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!userClerk || !user) return;
      
      try {
        const response = await fetch('/api/chats/unread-count');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUnreadCount(data.unreadCount || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Poll for unread count every 30 seconds when user is active
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Listen for custom event to refresh unread count
    const handleRefreshUnreadCount = () => {
      fetchUnreadCount();
    };
    
    window.addEventListener('refreshUnreadCount', handleRefreshUnreadCount);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshUnreadCount', handleRefreshUnreadCount);
    };
  }, [userClerk, user]);

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
    { name: locale === 'en' ? 'Blog' : 'المدونة', href: '/blog' },
    // { name: locale === 'en' ? 'Locations' : 'المواقع', href: '/locations' },
    // { name: locale === 'en' ? 'Quiz' : 'الاختبار', href: '/quiz' },
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

  // Get guide-related menu item based on status
  const getGuideMenuItem = () => {
    if (guideStatus === 'active') {
      return (
        <Link
          href={`/${locale}/dashboard/guide`}
          className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          {locale === 'en' ? 'Guide Dashboard' : 'لوحة المرشد'}
        </Link>
      );
    } else if (guideStatus === 'pending') {
      return (
        <div
          className="flex items-center w-full text-left px-4 py-3 text-sm text-yellow-600 bg-yellow-50"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {locale === 'en' ? 'Guide Application Pending' : 'طلب المرشد قيد الانتظار'}
        </div>
      );
    } else {
      return (
        <Link
          href={`/${locale}/guide/register`}
          className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <User className="mr-2 h-4 w-4" />
          {locale === 'en' ? 'Become a Guide' : 'كن مرشداً'}
        </Link>
      );
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
             <Image src="/logo.png" alt="Watermelon Tours" width={100} height={100} className='w-32 h-10 md:w-48 md:h-12' />
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
                className={`cursor-pointer flex gap-1 items-center rounded-md px-3 py-2 transition-colors ${
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
                    className="cursor-pointer block w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    className="cursor-pointer block w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
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
                  className={`cursor-pointer flex gap-1 items-center rounded-md px-3 py-2 transition-colors ${
                    useDarkText
                      ? 'text-secondary-900 hover:text-primary-600 hover:bg-primary-50'
                      : 'text-black hover:text-black hover:bg-white/20'
                  }`}
                >
                  <div className="relative w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="text-primary-600 h-4 w-4" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <span>{userClerk?.fullName}</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium z-10 animate-fade-in overflow-hidden">
                    {/* Wishlist Link */}
                    <Link
                      href={`/${locale}/wishlist`}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      {locale === 'en' ? 'My Wishlist' : 'قائمة رغباتي'}
                    </Link>
                    
                    {/* Profile Link */}
                    <Link
                      href={`/${locale}/profile`}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {locale === 'en' ? 'My Profile' : 'الملف الشخصي'}
                    </Link>
                    
                    {/* Messages Link */}
                    <Link
                      href={messagesLink}
                      className="flex items-center justify-between w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {locale === 'en' ? 'Messages' : 'الرسائل'}
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[18px] h-[18px] flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    
                    {/* Guide-related menu item (dynamic based on status) */}
                    {user && getGuideMenuItem()}
                    
                    {/* Admin Dashboard - only for admins */}
                    {user && user.role === 'admin' && (
                      <Link
                        href={`/${locale}/dashboard/admin`}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {locale === 'en' ? 'Admin Dashboard' : 'لوحة المسؤول'}
                      </Link>
                    )}
                    
                    {/* Logout Button */}
                    <div className='cursor-pointer flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors border-t border-secondary-100'>
                    <LogOut className="mr-2 h-4 w-4" /> 
                    <SignOutButton />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  href={`/${locale}/sign-in`}
                  variant={useDarkText ? "outline" : "ghost"}
                  size="sm"
                  className={!useDarkText ? "border-white text-black hover:bg-white/20" : "text-secondary-900"}
                >
                  {locale === 'en' ? 'Login' : 'تسجيل الدخول'}  
                </Button>
                <Button
                  href={`/${locale}/sign-up`}
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
            className={`md:hidden p-2 rounded-md transition-colors relative ${
              useDarkText
                ? 'text-secondary-900 hover:text-primary-600 hover:bg-primary-50'
                : 'text-black hover:text-black hover:bg-white/20'
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            {unreadCount > 0 && user && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            )}
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
                  
                  {/* Wishlist Link - Mobile */}
                  <Link
                    href={`/${locale}/wishlist`}
                    className="flex items-center px-4 py-3 rounded-md text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {locale === 'en' ? 'My Wishlist' : 'قائمة رغباتي'}
                  </Link>
                  
                  {/* Messages Link - Mobile */}
                  <Link
                    href={messagesLink}
                    className="flex items-center justify-between px-4 py-3 rounded-md text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {locale === 'en' ? 'Messages' : 'الرسائل'}
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[18px] h-[18px] flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* Profile Link - for all users */}
                  <Link
                    href={`/${locale}/profile`}
                    className="flex items-center px-4 py-3 rounded-md text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {locale === 'en' ? 'My Profile' : 'الملف الشخصي'}
                  </Link>
                  
                  {/* Guide-related menu item (dynamic based on status) */}
                  {user && getGuideMenuItem()}
                   {/* Admin Dashboard - only for admins */}
                    {user && user.role === 'admin' && (
                      <Link
                        href={`/${locale}/dashboard/admin`}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {locale === 'en' ? 'Admin Dashboard' : 'لوحة المسؤول'}
                      </Link>
                    )}
                  {/* Logout Button */}
                 
                  <div
                  
                    className="cursor-pointer flex items-center w-full text-left px-4 py-3 rounded-md text-secondary-900 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <SignOutButton />
                    {/* {locale === 'en' ? 'Logout' : 'تسجيل الخروج'} */}
                  </div>
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
                    href={getLocalizedHref('/sign-in')}
                    variant="outline"
                    size="md"
                    className="w-full text-secondary-900"
                  >
                    {locale === 'en' ? 'Login' : 'تسجيل الدخول'}
                  </Button>
                  <Button
                    href={getLocalizedHref('/sign-up')}
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