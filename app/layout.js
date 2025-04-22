import { Inter, Tajawal } from "next/font/google";
import "./globals.css";
import { getDirection } from "@/lib/i18n";
import { ClerkProvider } from '@clerk/nextjs'
import { UserProvider } from "@/contexts/UserContext";
import { GuideProvider } from "@/contexts/GuideContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata = {
  title: "Tourminded - Connect with Expert Local Guides",
  description: "Find and book personalized tours with expert local guides in the Holy Land",
  keywords: ["tours", "travel", "guides", "Holy Land", "Jerusalem", "Israel", "Palestine"],
};

export default function RootLayout({ children, params }) {
  return (
    <ClerkProvider>
      <GuideProvider>
        <UserProvider>
          <html lang="en" dir="ltr">
            <body className={`${inter.variable} ${tajawal.variable} font-sans antialiased`}>
              {children}
            </body>
          </html>
        </UserProvider>
      </GuideProvider>
    </ClerkProvider>
  );
}
