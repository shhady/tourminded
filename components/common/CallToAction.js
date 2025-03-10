import React from 'react';
import Link from 'next/link';
import Button from '../ui/Button';

const CallToAction = ({ locale }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-700 to-primary-900 text-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'en'
              ? 'Ready to Experience the Holy Land with Expert Guides?'
              : 'هل أنت مستعد لتجربة الأرض المقدسة مع مرشدين خبراء؟'}
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            {locale === 'en'
              ? 'Start planning your perfect trip today. Browse our tours or take our personalized quiz to find the perfect match for your interests.'
              : 'ابدأ في التخطيط لرحلتك المثالية اليوم. تصفح جولاتنا أو خذ اختبارنا الشخصي للعثور على التطابق المثالي لاهتماماتك.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button href="/tours" size="lg" className="text-lg px-8 py-4">
              {locale === 'en' ? 'Browse Tours' : 'تصفح الجولات'}
            </Button>
            <Button href="/quiz" variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent border-white text-black hover:bg-white hover:text-primary-900">
              {locale === 'en' ? 'Take the Quiz' : 'خذ الاختبار'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 