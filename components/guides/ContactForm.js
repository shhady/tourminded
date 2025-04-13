'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function ContactForm({ locale, guideId, guideName }) {
  const [name, setName] = useState('');
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
      if (!name.trim() || !message.trim()) {
        throw new Error(locale === 'en' ? 'Please fill in all fields' : 'يرجى ملء جميع الحقول');
      }
      
      // For now, just simulate a successful submission
      // In a real app, you would send this to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setName('');
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gray-500 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting 
              ? (locale === 'en' ? 'Sending...' : 'جاري الإرسال...') 
              : (locale === 'en' ? 'Send Message' : 'إرسال الرسالة')}
          </button>
        </form>
      )}
    </div>
  );
} 
