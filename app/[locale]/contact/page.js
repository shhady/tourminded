import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';

export const metadata = {
  title: 'Contact Us | Watermelon Tours',
  description: 'Get in touch with the Watermelon Tours team for any questions or support',
};

export default async function ContactPage({ params }) {
  const { locale } = await params;
  
  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            {locale === 'en' ? 'Contact Us' : 'اتصل بنا'}
          </h1>
          
          <p className="text-lg text-gray-600 text-center mb-12">
            {locale === 'en' 
              ? 'Have questions or need assistance? We\'re here to help!' 
              : 'هل لديك أسئلة أو تحتاج إلى مساعدة؟ نحن هنا للمساعدة!'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'en' ? 'Email Us' : 'راسلنا عبر البريد الإلكتروني'}
              </h3>
              <p className="text-gray-500 mb-3">
                {locale === 'en' ? 'For general inquiries' : 'للاستفسارات العامة'}
              </p>
              <a 
                href="mailto:info@Watermelontours.com" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                info@Watermelontours.com
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'en' ? 'Call Us' : 'اتصل بنا'}
              </h3>
              <p className="text-gray-500 mb-3">
                {locale === 'en' ? 'For urgent matters' : 'للأمور العاجلة'}
              </p>
              <a 
                href="tel:+972123456789" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                +972 12 345 6789
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'en' ? 'Visit Us' : 'زورنا'}
              </h3>
              <p className="text-gray-500 mb-3">
                {locale === 'en' ? 'Our headquarters' : 'مقرنا الرئيسي'}
              </p>
              <address className="not-italic text-primary-600">
                {locale === 'en' 
                  ? '123 Tourism Street, Jerusalem' 
                  : '١٢٣ شارع السياحة، القدس'}
              </address>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                  <MessageCircle className="w-5 h-5" />
                </span>
                {locale === 'en' ? 'Send Us a Message' : 'أرسل لنا رسالة'}
              </h2>
              
              <ContactForm locale={locale} />
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {locale === 'en' ? 'Find Us' : 'موقعنا'}
            </h2>
            
            <div className="rounded-xl overflow-hidden h-96 shadow-lg">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54282.09383136147!2d35.17745371744386!3d31.78196499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502d7d634c1fc4b%3A0xd96f623e456ee1cb!2sJerusalem!5e0!3m2!1sen!2sil!4v1656842475862!5m2!1sen!2sil" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}