import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const { pathname, search } = req.nextUrl

  // 1. Handle Locale Redirection
  const locales = ['en', 'he', 'ar']
  
  // Check if the path already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Paths that should NOT be localized
  const isExcludedPath = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname === '/payment-success' ||
    // Skip files with extensions (should be handled by matcher, but good safety)
    pathname.includes('.') 

  // Redirect if missing locale
  if (!pathnameHasLocale && !isExcludedPath) {
    const defaultLocale = 'en'
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}${search}`, req.url))
  }

  // 2. Protect dashboard routes with NextAuth (admins/guides/users)
  // Pattern: /en/dashboard/... or /ar/dashboard/...
  const protectedPatterns = [/^\/[a-z]{2}\/dashboard(\/.*)?$/]
  const isProtected = protectedPatterns.some((re) => re.test(pathname))

  if (isProtected) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      // Extract locale from path, default to 'en'
      const localeMatch = pathname.match(/^\/([a-z]{2})\b/)
      const locale = localeMatch ? localeMatch[1] : 'en'
      const callbackUrl = encodeURIComponent(pathname + search)
      return NextResponse.redirect(new URL(`/${locale}/sign-in?callbackUrl=${callbackUrl}`, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
