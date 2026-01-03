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
    "Holy Land",
    "Palestine",
    "Bethlehem",
    "local guides",
    "cultural tours",
    "religious tours",
    "historical tours",
    "personalized tours",
    "travel experiences",
    "tour booking",
    "Middle East travel"
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
      <head>
        <meta name="robots" content="index, follow" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#08171f" />
        <meta property="og:site_name" content="Watermelon Tours - Connect with Expert Local Guides" />
        
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
      </head>
      <body 
        className={` ${museoModerno.variable} ${montserrat.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
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
