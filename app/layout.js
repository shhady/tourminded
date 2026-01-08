import { MuseoModerno, Montserrat } from "next/font/google";
import "./globals.css";
import { getDirection } from "@/lib/i18n";
import { UserProvider } from "@/contexts/UserContext";
import { GuideProvider } from "@/contexts/GuideContext";
import { Analytics } from "@vercel/analytics/next"
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import Script from "next/script";

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  variable: "--font-museo-moderno",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#08171f',
};

export const metadata = {
  title: {
    default: "Watermelon Tours - Connect with Expert Local Guides",
    template: "%s | Watermelon Tours"
  },
  description: "Discover the Holy Land through the eyes of expert local guides. Book personalized tours, explore hidden gems, and create unforgettable memories in Jerusalem, Bethlehem, and beyond.",
  keywords: [
    "tours",
    "travel",
    "guides",
    "Holy Land",
    "Jerusalem",
    "Palestine",
    "Bethlehem",
    "local guides",
    "cultural tours",
    "religious tours",
    "historical tours",
    "personalized tours",
    "travel experiences",
    "tour booking",
    "Middle East travel",
    "holy land tours",
    "holy land travel",
    "holy land travel agency",
    "holy land travel agency in palestine",
    "holy land travel agency in jerusalem",
    "holy land travel agency in bethlehem",
    "holy land travel agency in tel aviv",
    "holy land travel agency in haifa",
    "holy land travel agency in nazareth",
    "Palestinian tours",
    "Palestinian travel",
    "Palestinian travel agency",
    "Palestinian travel agency in palestine",
    "Palestinian travel agency in jerusalem",
    "Palestinian travel agency in bethlehem",
    "Palestinian travel agency in tel aviv",
    "Palestinian travel agency in haifa",
    "Palestinian travel agency in nazareth",
    "holy land tours reviews",
    "holy land tour package price",
   
    "christian holy land tours",
    
    "holy land tours for seniors",
    "catholic holy land tours",
    "holy land tours 2026",

  ],
  authors: [{ name: "Watermelon Tours Team" }],
  creator: "Watermelon Tours",
  publisher: "Watermelon Tours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://watermelontours.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Watermelon Tours - Connect with Expert Local Guides",
    description: "Discover the Holy Land with expert local guides.",
    url: 'https://watermelontours.com',
    siteName: 'Watermelon Tours',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Watermelon Tours',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watermelon Tours - Connect with Expert Local Guides',
    description: 'Discover the Holy Land with expert local guides.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'en';
  const direction = getDirection?.(locale) || 'ltr';

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body 
        className={` ${museoModerno.variable} ${montserrat.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        {/* Google Consent Mode v2 - Default Denied */}
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });
          `}
        </Script>

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PGW6RBZX');
          `}
        </Script>

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PGW6RBZX"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined') {
                  const blocked = ['/__nextjs_original-stack-frames'];
                  const originalFetch = window.fetch;
                  window.fetch = async (...args) => {
                    if (typeof args[0] === 'string' && blocked.some(url => args[0].includes(url))) {
                      return new Response(null, { status: 204 });
                    }
                    return originalFetch(...args);
                  };
                }
              `,
            }}
          />
        )}
        <NextAuthProvider>
          <GuideProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </GuideProvider>
        </NextAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
