import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const { pathname, search } = req.nextUrl

  // Canonicalize host: force www to avoid OAuth state cookie mismatches
  const host = req.headers.get('host')
  if (host === 'watermelontours.com') {
    const url = new URL(req.url)
    url.host = 'www.watermelontours.com'
    return NextResponse.redirect(url)
  }

  // Redirect root to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', req.url))
  }

  // Protect dashboard routes with NextAuth (admins/guides/users)
  // Example protected pattern: /en/dashboard/... or /ar/dashboard/...
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