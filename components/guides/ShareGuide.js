'use client';

import { useState, useEffect } from 'react';
import { Share2, Download } from 'lucide-react';

export default function ShareGuide({ locale, guideId, guideName }) {
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Fix hydration issues by ensuring client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Handle share functionality
  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: guideName,
          text: `Check out this guide profile on Watermelon Tours`,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Generate vCard data
  const generateVCard = () => {
    const name = guideName;
    const url = window.location.href;
    
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TITLE:Tour Guide
URL:${url}
NOTE:Professional tour guide on Watermelon Tours
END:VCARD`;
    
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url2 = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url2;
    link.download = `${name.replace(/\s+/g, '_')}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Use a non-interactive placeholder during server rendering
  if (!isMounted) {
    return (
      <div className="flex flex-wrap gap-4 mt-4">
        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg w-36 h-10"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-4 mt-4">
      <button
        onClick={handleShare}
        className="flex items-center justify-center bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-lg transition-colors"
      >
        <Share2 className="w-5 h-5 mr-2" />
        {copied 
          ? (locale === 'en' ? 'Copied!' : 'تم النسخ!') 
          : (locale === 'en' ? 'Share Profile' : 'مشاركة الملف الشخصي')}
      </button>
      
      {/* <button
        onClick={generateVCard}
        className="flex items-center justify-center bg-secondary-50 hover:bg-secondary-100 text-secondary-700 px-4 py-2 rounded-lg transition-colors"
      >
        <Download className="w-5 h-5 mr-2" />
        {locale === 'en' ? 'Save Contact' : 'حفظ جهة الاتصال'}
      </button> */}
    </div>
  );
} 