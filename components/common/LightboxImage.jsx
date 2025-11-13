'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function LightboxImage({
  src,
  alt = '',
  containerClassName = '',
  imageClassName = '',
  sizes,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  return (
    <>
      <div
        className={containerClassName}
        role="button"
        aria-label="Open image"
        onClick={open}
        style={{ cursor: 'zoom-in' }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={imageClassName}
          sizes={sizes}
          priority={false}
        />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center"
          onClick={close}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={close}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}


