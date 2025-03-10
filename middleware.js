// import { NextResponse } from 'next/server';
// import { locales, defaultLocale } from './lib/i18n';

// export default function middleware(request) {
//   const pathname = request.nextUrl.pathname;
  
//   // Check if the pathname already has a locale
//   const pathnameHasLocale = locales.some(
//     locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
//   );
  
//   // If pathname doesn't have locale, redirect to the default locale
//   if (!pathnameHasLocale) {
//     // Special case for dashboard routes
//     if (pathname.startsWith('/dashboard')) {
//       return NextResponse.redirect(
//         new URL(`/${defaultLocale}${pathname}`, request.url)
//       );
//     }
    
//     // For other routes
//     return NextResponse.redirect(
//       new URL(`/${defaultLocale}${pathname}`, request.url)
//     );
//   }
  
//   return NextResponse.next();
// }

// export const config = {
//   // Skip all paths that should not be internationalized
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
// }; 
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Create a matcher for the webhook route
const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk"]);

export default function middleware(req) {
  // Skip Clerk middleware for webhook routes
  if (isWebhookRoute(req)) {
    console.log("Webhook route detected, skipping Clerk middleware");
    return NextResponse.next();
  }
  
  // Apply Clerk middleware for all other routes
  return clerkMiddleware()(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};