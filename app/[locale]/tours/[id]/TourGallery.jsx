'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const TourGallery = forwardRef(function TourGallery({ images, locale }, ref) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    openLightbox: (index) => {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
      document.body.style.overflow = 'hidden';
    }
  }));

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious(e);
    } else if (e.key === 'ArrowRight') {
      goToNext(e);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {images.slice(0, 4).map((image, index) => (
          <div 
            key={index} 
            className={`relative ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} cursor-pointer`}
            onClick={() => openLightbox(index)}
          >
            <div className="relative w-full h-64 md:h-80">
              <Image
                src={image}
                alt={`Tour image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        ))}
        
        {images.length > 4 && (
          <button 
            className="absolute bottom-4 right-4 bg-white bg-opacity-90 text-secondary-900 px-3 py-1 rounded-lg text-sm font-medium"
            onClick={() => openLightbox(4)}
          >
            +{images.length - 4} {locale === 'en' ? 'more' : 'المزيد'}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={closeLightbox}
          >
            <X size={24} />
          </button>
          
          <button 
            className="absolute left-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={goToPrevious}
          >
            <ChevronLeft size={32} />
          </button>
          
          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image
              src={images[currentImageIndex]}
              alt={`Tour image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>
          
          <button 
            className="absolute right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={goToNext}
          >
            <ChevronRight size={32} />
          </button>
          
          <div className="absolute bottom-4 text-white text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
});

export default TourGallery; 