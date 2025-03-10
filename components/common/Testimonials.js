'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const Testimonials = ({ locale }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mock testimonial data
  const testimonials = [
    {
      id: 1,
      name: locale === 'en' ? 'John Smith' : 'جون سميث',
      location: locale === 'en' ? 'United States' : 'الولايات المتحدة',
      image: '/images/testimonial1.jpg', // Placeholder
      rating: 5,
      text: {
        en: 'It was an amazing day and I learned so much. Our guide was incredibly knowledgeable and made the history come alive. The tour was perfectly paced and we saw all the highlights.',
        ar: 'كان يومًا مذهلاً وتعلمت الكثير. كان مرشدنا على دراية كبيرة وجعل التاريخ ينبض بالحياة. كانت الجولة بوتيرة مثالية وشاهدنا جميع المعالم البارزة.',
      },
      tourType: locale === 'en' ? 'Christian Heritage Tour' : 'جولة التراث المسيحي',
    },
    {
      id: 2,
      name: locale === 'en' ? 'Maria Rodriguez' : 'ماريا رودريغيز',
      location: locale === 'en' ? 'Spain' : 'إسبانيا',
      image: '/images/testimonial2.jpg', // Placeholder
      rating: 5,
      text: {
        en: 'Ariel was an absolute joy on our tour and made the experience so smooth and wonderful. His knowledge of the history and culture was impressive, and he answered all our questions.',
        ar: 'كان أرييل متعة مطلقة في جولتنا وجعل التجربة سلسة ورائعة. كانت معرفته بالتاريخ والثقافة مثيرة للإعجاب، وأجاب على جميع أسئلتنا.',
      },
      tourType: locale === 'en' ? 'Jerusalem Old City Tour' : 'جولة مدينة القدس القديمة',
    },
    {
      id: 3,
      name: locale === 'en' ? 'David Chen' : 'ديفيد تشن',
      location: locale === 'en' ? 'Canada' : 'كندا',
      image: '/images/testimonial3.jpg', // Placeholder
      rating: 5,
      text: {
        en: 'Our guide was fantastic! He was patient with our large family group and kept everyone engaged. The food tour was a highlight of our trip, and we discovered places we would never have found on our own.',
        ar: 'كان مرشدنا رائعًا! كان صبورًا مع مجموعة عائلتنا الكبيرة وأبقى الجميع مشاركين. كانت جولة الطعام من أبرز رحلتنا، واكتشفنا أماكن لم نكن لنجدها بأنفسنا.',
      },
      tourType: locale === 'en' ? 'Tel Aviv Food Tour' : 'جولة الطعام في تل أبيب',
    },
  ];

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Wrap changeTestimonial in useCallback
  const changeTestimonial = useCallback((index) => {
    if (index === activeIndex) return;
    
    setIsAnimating(true);
    setActiveIndex(index);
    
    // Reset animation after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [activeIndex]);

  useEffect(() => {
    if (!isClient || isAnimating) return;
    
    const interval = setInterval(() => {
      changeTestimonial((activeIndex + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials.length, isClient, activeIndex, isAnimating, changeTestimonial]);

  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzBkNDdhMSIvPjwvc3ZnPg==';

  if (!isClient) {
    return <div className="py-16 bg-gray-100 text-secondary-900">Loading testimonials...</div>;
  }

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-200"></div>
        <div className="absolute top-1/2 -right-24 w-64 h-64 rounded-full bg-primary-200"></div>
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-primary-200"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary-900 animate-fade-in">
            {locale === 'en' ? 'What Our Travelers Say' : 'ماذا يقول مسافرونا'}
          </h2>
          <p className="text-xl text-secondary-900 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {locale === 'en'
              ? 'Read testimonials from travelers who experienced our guided tours'
              : 'اقرأ شهادات من المسافرين الذين جربوا جولاتنا المصحوبة بمرشدين'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Testimonial Card */}
          <div 
            className={`bg-white text-secondary-900 rounded-2xl shadow-medium p-8 md:p-12 relative ${isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'} transition-all duration-500`}
          >
            <Quote className="text-primary-200 text-5xl absolute top-8 left-8" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary-100 shadow-soft">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600" />
                  {/* <Image
                    src={testimonials[activeIndex].image}
                    alt={testimonials[activeIndex].name}
                    fill
                    className="object-cover"
                  /> */}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-grow text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`${
                        i < testimonials[activeIndex].rating
                          ? 'text-accent-500'
                          : 'text-secondary-300'
                      } text-xl mx-0.5`}
                      size={20}
                    />
                  ))}
                </div>
                
                <p className="text-lg md:text-xl mb-6 text-secondary-900 italic">
                  &ldquo;{testimonials[activeIndex].text[locale]}&rdquo;
                </p>
                
                <div>
                  <h4 className="font-bold text-xl text-secondary-900">{testimonials[activeIndex].name}</h4>
                  <p className="text-secondary-900">{testimonials[activeIndex].location}</p>
                  <p className="text-primary-600 mt-1 font-medium">{testimonials[activeIndex].tourType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => changeTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeIndex === index 
                    ? 'bg-primary-500 w-8' 
                    : 'bg-primary-200 hover:bg-primary-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 