'use client';

import { useState } from 'react';
import { Share } from 'lucide-react';

export default function ShareTourButton({ locale, tourTitle }) {
  const [copied, setCopied] = useState(false);
  
  // Handle share functionality
  const handleShare = async () => {
    const url = window.location.href;
    
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: tourTitle,
          text: locale === 'en' 
            ? `Check out this tour on Tourminded: ${tourTitle}` 
            : `تحقق من هذه الجولة على Tourminded: ${tourTitle}`,
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