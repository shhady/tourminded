import { Inter, Tajawal } from "next/font/google";
import "./globals.css";
import { getDirection } from "@/lib/i18n";

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

export default async function RootLayout({ children, params }) {
  const locale = await params?.locale || "en";
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${inter.variable} ${tajawal.variable} antialiased ${
          locale === "ar" ? "font-arabic" : "font-sans"
        }`}
      >
        {children}
      </body>
    </html>
  );
}
