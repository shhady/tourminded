'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ContactForm({ locale, guideId, guideName }) {
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration issues by ensuring client-side rendering for interactive elements
  useEffect(() => {
    setIsMounted(true);
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      if (status !== 'authenticated') {
        throw new Error(locale === 'en' ? 'You must be logged in to send a message' : 'يجب عليك تسجيل الدخول لإرسال رسالة');
      }

      // Simple validation
      if (!name.trim() || !message.trim()) {
        throw new Error(locale === 'en' ? 'Please fill in all fields' : 'يرجى ملء جميع الحقول');
      }
      
      const response = await fetch(`/api/guides/${guideId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      setSuccess(true);
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use a simple non-interactive placeholder during server rendering
  if (!isMounted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-gray-800">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
            <MessageCircle className="w-5 h-5" />
          </span>
          {locale === 'en' ? 'Contact Me' : 'تواصل معي'}
        </h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-gray-800">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
          <MessageCircle className="w-5 h-5" />
        </span>
        {locale === 'en' ? 'Contact Me' : 'تواصل معي'}
      </h2>
      
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
          <p className="font-medium">
            {locale === 'en' 
              ? 'Thank you for your message!' 
              : 'شكرا لرسالتك!'}
          </p>
          <p className="text-sm mt-1">
            {locale === 'en'
              ? `We've sent your message to ${guideName}. They will get back to you soon.`
              : `لقد أرسلنا رسالتك إلى ${guideName}. سيعودون إليك قريبًا.`}
          </p>
          <p className="text-sm mt-2 font-medium text-primary-700">
             {locale === 'en' 
               ? 'You can also check your chat for the conversation.' 
               : 'يمكنك أيضًا التحقق من الدردشة الخاصة بك للمحادثة.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'en' ? 'Your Name' : 'اسمك'}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={locale === 'en' ? 'Enter your name' : 'أدخل اسمك'}
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'en' ? 'Message' : 'الرسالة'}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={locale === 'en' ? 'What would you like to know?' : 'ماذا تريد أن تعرف؟'}
            ></textarea>
          </div>
          
          {status === 'authenticated' ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full border-2 border-black bg-primary-600 hover:bg-primary-700 text-black font-medium py-3 rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed border-2 border-black' : ''}`}
            >
              {isSubmitting 
                ? (locale === 'en' ? 'Sending...' : 'جاري الإرسال...') 
                : (locale === 'en' ? 'Send Message' : 'إرسال الرسالة')}
            </button>
          ) : (
             <Link
                href={`/${locale}/sign-in`}
                className="block w-full text-center border-2 border-primary-600 text-primary-600 font-medium py-3 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {locale === 'en' ? 'Sign in to Send Message' : 'سجل الدخول لإرسال رسالة'}
              </Link>
          )}
        </form>
      )}
    </div>
  );
} 
