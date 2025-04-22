'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function WishlistButton({ 
  id, 
  type, 
  locale, 
  className = '', 
  size = 'default',
  position = 'relative'
}) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  console.log(id)
  // Size classes
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  };
  
  // Determine button size class
  const buttonSizeClass = sizeClasses[size] || sizeClasses.default;
  
  // Position classes
  const positionClasses = {
    relative: '',
    'top-right': 'absolute top-4 right-4 z-20',
    'top-left': 'absolute top-4 left-4 z-20',
    'bottom-right': 'absolute bottom-4 right-4 z-20',
    'bottom-left': 'absolute bottom-4 left-4 z-20'
  };
  
  // Determine position class
  const positionClass = positionClasses[position] || '';
  
  // Function to check if item is in wishlist - memoized to prevent recreation on every render
  const checkWishlistStatus = useCallback(async () => {
    if (!isSignedIn || !id || !type) return;
    
    try {
      const response = await fetch(`/api/users/me/wishlist/check?type=${type}&id=${id}`);
      const data = await response.json();
      
      if (data.success) {
        setIsInWishlist(data.isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  }, [isSignedIn, id, type]);
  
  // Check if item is in wishlist on component mount
  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);
  
  // Handle wishlist toggle
  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn) {
      // Redirect to sign in page with return URL
      toast.error(locale === 'en' 
        ? 'Please sign in to save to your wishlist' 
        : 'الرجاء تسجيل الدخول للحفظ في قائمة الرغبات');
      router.push(`/${locale}/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const action = isInWishlist ? 'remove' : 'add';
      
      const response = await fetch('/api/users/me/wishlist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          id,
          action
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsInWishlist(!isInWishlist);
        
        // Show toast notification
        const message = isInWishlist
          ? (locale === 'en' 
              ? `Removed from your wishlist` 
              : `تمت إزالته من قائمة رغباتك`)
          : (locale === 'en' 
              ? `Saved to your wishlist` 
              : `تم الحفظ في قائمة رغباتك`);
              
        toast.success(message);
        
        // Don't call router.refresh() or any other router methods here
        // as they can cause infinite loops on pages that also fetch wishlist data
      } else {
        throw new Error(data.message || 'Error updating wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(locale === 'en' 
        ? 'Failed to update wishlist' 
        : 'فشل تحديث قائمة الرغبات');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`${buttonSizeClass} ${positionClass} bg-white rounded-full shadow-md 
        flex items-center justify-center transition-all duration-300
        ${isInWishlist 
          ? 'text-red-500 hover:bg-red-50' 
          : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}`}
      aria-label={isInWishlist 
        ? (locale === 'en' ? 'Remove from wishlist' : 'إزالة من قائمة الرغبات')
        : (locale === 'en' ? 'Add to wishlist' : 'أضف إلى قائمة الرغبات')}
    >
      <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
    </button>
  );
} 