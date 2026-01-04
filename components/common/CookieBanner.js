'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner({ locale }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false
  });

  // Translations
  const content = {
    en: {
      text: "We use cookies to enhance your experience and analyze traffic. By clicking 'Accept', you consent to our use of cookies.",
      accept: "Accept All",
      decline: "Decline",
      settings: "Settings",
      privacyLink: "/privacy",
      cookieLink: "/cookies",
      readMore: "Read our Cookie Policy",
      modal: {
        title: "Cookie Settings",
        necessary: "Necessary Cookies",
        necessaryDesc: "Essential for the website to function properly. Cannot be disabled.",
        analytics: "Analytics Cookies",
        analyticsDesc: "Help us understand how visitors interact with the website.",
        marketing: "Marketing Cookies",
        marketingDesc: "Used to deliver relevant advertisements and track ad performance.",
        save: "Save Preferences",
        close: "Close"
      }
    },
    he: {
      text: "אנחנו משתמשים בעוגיות כדי לשפר את חווית המשתמש ולנתח את התנועה באתר. בלחיצה על 'אישור', הינך מסכים לשימוש בעוגיות.",
      accept: "אישור",
      decline: "דחייה",
      settings: "הגדרות",
      privacyLink: "/privacy",
      cookieLink: "/cookies",
      readMore: "קרא את מדיניות העוגיות שלנו",
      modal: {
        title: "הגדרות עוגיות",
        necessary: "עוגיות הכרחיות",
        necessaryDesc: "חיוניות לתפקוד תקין של האתר. לא ניתן לבטל.",
        analytics: "עוגיות אנליטיות",
        analyticsDesc: "עוזרות לנו להבין כיצד מבקרים משתמשים באתר.",
        marketing: "עוגיות שיווקיות",
        marketingDesc: "משמשות להצגת מודעות רלוונטיות ומעקב אחר ביצועי פרסום.",
        save: "שמור הגדרות",
        close: "סגור"
      }
    },
    ar: {
      text: "نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة المرور. بالنقر فوق 'قبول'، فإنك توافق على استخدامنا لملفات تعريف الارتباط.",
      accept: "قبول الكل",
      decline: "رفض",
      settings: "إعدادات",
      privacyLink: "/privacy",
      cookieLink: "/cookies",
      readMore: "اقرأ سياسة ملفات تعريف الارتباط الخاصة بنا",
      modal: {
        title: "إعدادات ملفات تعريف الارتباط",
        necessary: "ملفات تعريف الارتباط الضرورية",
        necessaryDesc: "ضرورية لعمل الموقع بشكل صحيح. لا يمكن تعطيلها.",
        analytics: "ملفات تعريف الارتباط التحليلية",
        analyticsDesc: "تساعدنا في فهم كيفية تفاعل الزوار مع الموقع.",
        marketing: "ملفات تعريف الارتباط التسويقية",
        marketingDesc: "تستخدم لتقديم إعلانات ذات صلة وتتبع أداء الإعلانات.",
        save: "حفظ التفضيلات",
        close: "إغلاق"
      }
    }
  };

  const t = content[locale] || content.en;
  const isRTL = locale === 'ar' || locale === 'he';

  // Helper to trigger Google Consent Mode update
  const updateConsent = (consentState) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': consentState.analytics ? 'granted' : 'denied',
        'ad_storage': consentState.marketing ? 'granted' : 'denied',
        'ad_user_data': consentState.marketing ? 'granted' : 'denied',
        'ad_personalization': consentState.marketing ? 'granted' : 'denied'
      });
    }
  };

  const initializeScripts = () => {
    // Placeholder for Google Analytics and Meta Pixel code
    console.log('Scripts initialized');
  };

  // Check localStorage on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie_consent');
    
    if (savedConsent) {
      // Handle legacy 'granted'/'denied' strings or new JSON object
      let consentState = { analytics: false, marketing: false };
      
      try {
        if (savedConsent === 'granted') {
          consentState = { analytics: true, marketing: true };
        } else if (savedConsent === 'denied') {
          consentState = { analytics: false, marketing: false };
        } else {
          consentState = JSON.parse(savedConsent);
        }
        
        // Update local state to reflect saved preferences
        setPreferences(consentState);
        
        // If they already consented in the past, ensure GTM knows
        if (consentState.analytics || consentState.marketing) {
          updateConsent(consentState);
          initializeScripts();
        }
      } catch (e) {
        // Fallback for parsing errors
        console.error('Error parsing cookie consent:', e);
      }
    } else {
      // Only show banner if no choice has been made
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    const allGranted = { analytics: true, marketing: true };
    localStorage.setItem('cookie_consent', JSON.stringify(allGranted));
    setPreferences(allGranted);
    updateConsent(allGranted);
    initializeScripts();
    setIsVisible(false);
  };

  const handleDecline = () => {
    const allDenied = { analytics: false, marketing: false };
    localStorage.setItem('cookie_consent', JSON.stringify(allDenied));
    setPreferences(allDenied);
    updateConsent(allDenied);
    setIsVisible(false);
  };

  const handleSettings = (e) => {
    e.preventDefault();
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    updateConsent(preferences);
    if (preferences.analytics || preferences.marketing) {
      initializeScripts();
    }
    setShowSettings(false);
    setIsVisible(false);
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">{t.modal.title}</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">{t.modal.close}</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Necessary */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {t.modal.necessary}
                    <span className="text-xs font-normal px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">Required</span>
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{t.modal.necessaryDesc}</p>
                </div>
                <div className="relative inline-flex items-center cursor-not-allowed opacity-60">
                  <input type="checkbox" className="sr-only peer" checked readOnly disabled />
                  <div className="w-11 h-6 bg-primary-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{t.modal.analytics}</h4>
                  <p className="text-sm text-gray-500 mt-1">{t.modal.analyticsDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences.analytics}
                    onChange={() => togglePreference('analytics')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{t.modal.marketing}</h4>
                  <p className="text-sm text-gray-500 mt-1">{t.modal.marketingDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences.marketing}
                    onChange={() => togglePreference('marketing')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                {t.modal.close}
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {t.modal.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Banner */}
      {!showSettings && (
        <div 
          className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-in-out transform translate-y-0`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            
            {/* Text Content */}
            <div className="flex-1 text-center md:text-start">
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {t.text}
                <a href={`/${locale}${t.cookieLink}`} className="underline text-primary-600 hover:text-primary-800 mx-1">
                  {t.readMore}
                </a>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto justify-center md:justify-end items-center">
              <button
                onClick={handleSettings}
                className="text-sm text-gray-500 hover:text-gray-700 underline decoration-dotted underline-offset-4 px-2"
              >
                {t.settings}
              </button>

              <div className="flex flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDecline}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 whitespace-nowrap"
                >
                  {t.decline}
                </button>
                
                <button
                  onClick={handleAccept}
                  className="flex-1 sm:flex-none px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 whitespace-nowrap"
                >
                  {t.accept}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

