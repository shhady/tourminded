import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Mail, Phone } from 'lucide-react';

const Footer = ({ locale }) => {
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
      { name: locale === 'en' ? 'Our Team' : 'فريقنا', href: '/team' },
      { name: locale === 'en' ? 'Careers' : 'وظائف', href: '/careers' },
      { name: locale === 'en' ? 'Contact' : 'اتصل بنا', href: '/contact' },
    ],
    tours: [
      { name: locale === 'en' ? 'Christian Tours' : 'جولات مسيحية', href: '/tours?expertise=Christian' },
      { name: locale === 'en' ? 'Jewish Tours' : 'جولات يهودية', href: '/tours?expertise=Jewish' },
      { name: locale === 'en' ? 'Muslim Tours' : 'جولات إسلامية', href: '/tours?expertise=Muslim' },
      { name: locale === 'en' ? 'Historical Tours' : 'جولات تاريخية', href: '/tours?expertise=Historical' },
      { name: locale === 'en' ? 'Cultural Tours' : 'جولات ثقافية', href: '/tours?expertise=Cultural' },
    ],
    support: [
      { name: locale === 'en' ? 'Help Center' : 'مركز المساعدة', href: '/help' },
      { name: locale === 'en' ? 'Safety' : 'الأمان', href: '/safety' },
      { name: locale === 'en' ? 'Cancellation Options' : 'خيارات الإلغاء', href: '/cancellation' },
      { name: locale === 'en' ? 'COVID-19' : 'كوفيد-19', href: '/covid' },
    ],
    legal: [
      { name: locale === 'en' ? 'Terms of Service' : 'شروط الخدمة', href: '/terms' },
      { name: locale === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية', href: '/privacy' },
      { name: locale === 'en' ? 'Cookie Policy' : 'سياسة ملفات تعريف الارتباط', href: '/cookies' },
    ],
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href={getLocalizedHref('/')} className="text-3xl font-bold text-secondary-900 inline-block">
              Tourminded
            </Link>
            <p className="mt-6 text-secondary-900 max-w-md leading-relaxed">
              {locale === 'en' 
                ? 'Connect with expert local guides for personalized tours in the Holy Land. Discover the rich heritage and fascinating culture with our knowledgeable guides.' 
                : 'تواصل مع مرشدين محليين خبراء للحصول على جولات مخصصة في الأرض المقدسة. اكتشف التراث الغني والثقافة الرائعة مع مرشدينا ذوي المعرفة.'}
            </p>
            
            {/* Contact Info */}
            <div className="mt-8 space-y-3">
              <div className="flex items-start">
                <MapPin className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-secondary-900">
                  123 Tourism Street, Jerusalem, Holy Land
                </p>
              </div>
              <div className="flex items-center">
                <Mail className="text-primary-500 mr-3 flex-shrink-0" />
                <a href="mailto:info@tourminded.com" className="text-secondary-900 hover:text-primary-600 transition-colors">
                  info@tourminded.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="text-primary-500 mr-3 flex-shrink-0" />
                <a href="tel:+972123456789" className="text-secondary-900 hover:text-primary-600 transition-colors">
                  +972 12 345 6789
                </a>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="mt-8 flex space-x-4">
              <a href="#" className="bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 p-3 rounded-full text-primary-500 transition-all transform hover:-translate-y-1 hover:shadow-md">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 p-3 rounded-full text-primary-500 transition-all transform hover:-translate-y-1 hover:shadow-md">
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 p-3 rounded-full text-primary-500 transition-all transform hover:-translate-y-1 hover:shadow-md">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 p-3 rounded-full text-primary-500 transition-all transform hover:-translate-y-1 hover:shadow-md">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-secondary-900 border-b border-gray-200 pb-2">
              {locale === 'en' ? 'Company' : 'الشركة'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={getLocalizedHref(link.href)} 
                    className="text-secondary-900 hover:text-primary-600 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-secondary-900 border-b border-gray-200 pb-2">
              {locale === 'en' ? 'Tours' : 'الجولات'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.tours.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={getLocalizedHref(link.href)} 
                    className="text-secondary-900 hover:text-primary-600 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-secondary-900 border-b border-gray-200 pb-2">
              {locale === 'en' ? 'Support' : 'الدعم'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={getLocalizedHref(link.href)} 
                    className="text-secondary-900 hover:text-primary-600 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-lg font-semibold mt-8 mb-6 text-secondary-900 border-b border-gray-200 pb-2">
              {locale === 'en' ? 'Legal' : 'قانوني'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={getLocalizedHref(link.href)} 
                    className="text-secondary-900 hover:text-primary-600 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-secondary-900">
          <p>
            &copy; {currentYear} Tourminded. {locale === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 