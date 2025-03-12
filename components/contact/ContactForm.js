 'use client';

import { useState } from 'react';

export default function ContactForm({ locale }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simple validation
      if (!name.trim() || !email.trim() || !message.trim()) {
        throw new Error(locale === 'en' ? 'Please fill in all required fields' : 'يرجى ملء جميع الحقول المطلوبة');
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error(locale === 'en' ? 'Please enter a valid email address' : 'يرجى إدخال عنوان بريد إلكتروني صالح');
      }
      
      // For now, just simulate a successful submission
      // In a real app, you would send this to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
          <p className="font-medium">
            {locale === 'en' 
              ? 'Thank you for your message!' 
              : 'شكرا لرسالتك!'}
          </p>
          <p className="text-sm mt-1">
            {locale === 'en'
              ? 'We have received your inquiry and will get back to you as soon as possible.'
              : 'لقد تلقينا استفسارك وسنرد عليك في أقرب وقت ممكن.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'en' ? 'Your Name' : 'اسمك'}*
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={locale === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'en' ? 'Email Address' : 'البريد الإلكتروني'}*
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={locale === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني'}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'en' ? 'Subject' : 'الموضوع'}
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={locale === 'en' ? 'Enter subject' : 'أدخل الموضوع'}
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'en' ? 'Message' : 'الرسالة'}*
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={locale === 'en' ? 'Enter your message' : 'أدخل رسالتك'}
              required
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting 
              ? (locale === 'en' ? 'Sending...' : 'جاري الإرسال...') 
              : (locale === 'en' ? 'Send Message' : 'إرسال الرسالة')}
          </button>
        </form>
      )}
    </>
  );
}