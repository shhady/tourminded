import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Mail, Phone, Music } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const Footer = ({ locale }) => {
  const { user, isLoading } = useUser();
  
  // Check if user is signed in but not a guide
  const showBecomeGuide = user && !isLoading && user.role !== 'guide';
  
  const currentYear = new Date().getFullYear();

  // Fix links to include locale
  const getLocalizedHref = (href) => {
    if (href === '/') {
      return `/${locale}`;
    }
    return `/${locale}${href}`;
  };

  const footerLinks = {
    company: [
      { name: locale === 'en' ? 'About Us' : 'عن الشركة', href: '/about' },
      ...(showBecomeGuide ? [{ 
        name: locale === 'en' ? 'Become a Guide' : 'كن مرشداً', 
        href: '/guide/register',
        highlight: true 
      }] : []),
      // { name: locale === 'en' ? 'Our Team' : 'فريقنا', href: '/team' },
      // { name: locale === 'en' ? 'Careers' : 'وظائف', href: '/careers' },
      { name: locale === 'en' ? 'Contact' : 'اتصل بنا', href: '/contact' },
    ],
    tours: [
      { name: locale === 'en' ? 'Christian Tours' : 'جولات مسيحية', href: '/tours/categories/christian' },
      { name: locale === 'en' ? 'Jewish Tours' : 'جولات يهودية', href: '/tours/categories/jewish' },
      { name: locale === 'en' ? 'Muslim Tours' : 'جولات إسلامية', href: '/tours/categories/muslim' },
      { name: locale === 'en' ? 'Historical Tours' : 'جولات تاريخية', href: '/tours/categories/historical' },
      { name: locale === 'en' ? 'Cultural Tours' : 'جولات ثقافية', href: '/tours/categories/cultural' },
      { name: locale === 'en' ? 'Adventure Tours' : 'جولات مغامرة', href: '/tours/categories/adventure' },
      { name: locale === 'en' ? 'Nature Tours' : 'جولات طبيعة', href: '/tours/categories/nature' },
      { name: locale === 'en' ? 'Photography Tours' : 'جولات تصوير', href: '/tours/categories/photography' },
      { name: locale === 'en' ? 'Culinary Tours' : 'جولات طهي', href: '/tours/categories/culinary' },
    ],
    support: [
      { name: locale === 'en' ? 'Help Center' : 'مركز المساعدة', href: '/help' },
      { name: locale === 'en' ? 'Safety' : 'السلامة', href: '/safety' },
      { name: locale === 'en' ? 'Cancellation Options' : 'خيارات الإلغاء', href: '/cancellation' },
    ],
    legal: [
      { name: locale === 'en' ? 'Terms of Service' : 'شروط الخدمة', href: '/terms' },
      { name: locale === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية', href: '/privacy' },
      { name: locale === 'en' ? 'Cookie Policy' : 'سياسة الكوكيز', href: '/cookies' },
    ],
  };

  return (
    <footer className="bg-[#0E7C3F] text-white border-t border-gray-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
              <Link href={getLocalizedHref('/')} className="text-3xl font-bold text-white inline-block">
            Watermelon Tours
            </Link>
            <p className="mt-6 text-white max-w-md leading-relaxed">
              {locale === 'en' 
                ? 'Connect with expert local guides for personalized tours in the Holy Land. Discover the rich heritage and fascinating culture with our knowledgeable guides.' 
                : 'تواصل مع مرشدين محليين خبراء للحصول على جولات مخصصة في الأرض المقدسة. اكتشف التراث الغني والثقافة الرائعة مع مرشدينا ذوي المعرفة.'}
            </p>
            
            {/* Contact Info */}
            <div className="mt-8 space-y-3">
              {/* <div className="flex items-center gap-3 text-secondary-600">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>{locale === 'en' ? 'Jerusalem, Israel' : 'القدس'}</span>
              </div> */}
              <div className="flex items-center gap-3 text-white">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:info@Watermelontours.com" className="hover:text-primary-600 transition-colors">
                  info@Watermelontours.com
                </a>
              </div>
              {/* <div className="flex items-center gap-3 text-secondary-600">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+972500000000" className="hover:text-primary-600 transition-colors">
                  +972 50 000 0000
                </a>
              </div> */}
            </div>

            {/* Social Media Links */}
            <div className="mt-8 flex gap-4">
              <a 
                href="https://www.facebook.com/people/Watermelon-Tours/61579183734296/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white text-[#0E7C3F] flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/watermelontours?igsh=MXRzbnhxampjNDJqeA%3D%3D&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white text-[#0E7C3F] flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@watermelontours.com?_r=1&_t=ZT-92k0ckVu4fW" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white text-[#0E7C3F] flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="TikTok"
              >
                <Music className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.keys(footerLinks).map((section) => (
            <div key={section} className="flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-white">
                {section === 'company' && (locale === 'en' ? 'Company' : 'الشركة')}
                {section === 'tours' && (locale === 'en' ? 'Tours' : 'الجولات')}
                {section === 'support' && (locale === 'en' ? 'Support' : 'الدعم')}
                {section === 'legal' && (locale === 'en' ? 'Legal' : 'قانوني')}
              </h3>
              <ul className="space-y-3">
                {footerLinks[section].map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={getLocalizedHref(link.href)} 
                      className={`${link.highlight 
                        ? 'text-yellow-400 hover:text-yellow-300 font-medium' 
                        : 'text-white/80 hover:text-white'} transition-colors`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/20 text-center text-white/80">
          <p>
            &copy; {currentYear} Watermelon Tours. {locale === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
          </p>
          <div className="mt-2">
          <Link 
  href="https://fikranova.com" 
  target="_blank" 
  rel="noopener noreferrer"
  className="hover:text-white"
>
  Website by <span className="font-bold">Fikranova</span>
</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
