'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FaqSection({ locale = 'en' }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  const t = (en, ar) => (locale === 'en' ? en : ar);

  useEffect(() => {
    let cancelled = false;

    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setError('');
        // Public read-only FAQ endpoint; admin-only routes are used just for CRUD
        const res = await fetch('/api/faq', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || t('Failed to load FAQs.', 'فشل تحميل الأسئلة الشائعة.'));
        }
        if (!cancelled) {
          setFaqs(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load FAQs:', err);
          setError(err.message || t('Failed to load FAQs.', 'فشل تحميل الأسئلة الشائعة.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFaqs();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (loading && !faqs.length) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-secondary-600 text-sm">
          {t('Loading frequently asked questions…', 'جاري تحميل الأسئلة الشائعة...')}
        </div>
      </section>
    );
  }

  if (error && !faqs.length) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-red-600 text-sm">
          {error}
        </div>
      </section>
    );
  }

  if (!faqs.length) {
    // If admin has not added FAQs yet, hide section completely
    return null;
  }

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-72 h-72 rounded-full bg-primary-100 opacity-40" />
        <div className="absolute -bottom-24 right-0 w-80 h-80 rounded-full bg-primary-100 opacity-30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-secondary-900">
            {t('Frequently Asked Questions', 'الأسئلة الشائعة')}
          </h2>
          <p className="text-secondary-600 max-w-2xl mx-auto text-sm md:text-base">
            {t(
              'Find quick answers to the most common questions travelers ask about booking and tours.',
              'ابحث عن إجابات سريعة لأكثر الأسئلة شيوعًا التي يطرحها المسافرون حول الحجز والجولات.'
            )}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq._id;
            return (
              <div
                key={faq._id}
                className="bg-white border border-secondary-200 rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(faq._id)}
                  className="w-full flex items-center justify-between px-4 md:px-5 py-3 md:py-4 text-left"
                >
                  <span className="font-medium text-secondary-900 text-sm md:text-base">
                    {faq.question}
                  </span>
                  <span className="ml-3 flex-shrink-0 text-secondary-500">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 md:px-5 pb-4 text-secondary-700 text-sm md:text-base border-t border-secondary-100 whitespace-pre-line">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


