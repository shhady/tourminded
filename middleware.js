import { NextResponse } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';

export default function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // If pathname doesn't have locale, redirect to the default locale
  if (!pathnameHasLocale) {
    // Special case for dashboard routes
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}${pathname}`, request.url)
      );
    }
    
    // For other routes
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }
  
  return NextResponse.next();
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};