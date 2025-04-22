'use client';

import { useState, useEffect } from 'react';
import { Share } from 'lucide-react';

export default function ShareGuideButton({ locale, guideName }) {
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Fix hydration issues by ensuring client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Handle share functionality
  const handleShare = async () => {
    const url = window.location.href;
    
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: guideName,
          text: locale === 'en' 
            ? `Check out this guide on Tourminded: ${guideName}` 
            : `تحقق من هذا المرشد على Tourminded: ${guideName}`,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fall back to clipboard copy if sharing fails
        copyToClipboard(url);
      }
    } else {
      // Fall back to clipboard copy if Web Share API is not available
      copyToClipboard(url);
    }
  };
  
  // Copy URL to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  // Use a non-interactive placeholder during server rendering
  if (!isMounted) {
    return (
      <div className="cursor-pointer flex items-center text-secondary-700">
        <Share className="w-5 h-5 mr-1" />
        <span>{locale === 'en' ? 'Share' : 'مشاركة'}</span>
      </div>
    );
  }
  
  return (
    <button 
      className="cursor-pointer flex items-center text-secondary-700 hover:text-primary-600"
      onClick={handleShare}
    >
      <Share className="w-5 h-5 mr-1" />
      <span>
        {copied 
          ? (locale === 'en' ? 'Copied!' : 'تم النسخ!') 
          : (locale === 'en' ? 'Share' : 'مشاركة')}
      </span>
    </button>
  );
} 