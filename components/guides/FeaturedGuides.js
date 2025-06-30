import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Languages, MapPin } from 'lucide-react';
import Button from '../ui/Button';

const FeaturedGuides = ({ locale }) => {
  // Mock data for featured guides
  const guides = [
    {
      id: 'guide1',
      name: {
        en: 'Ahmed Hassan',
        ar: 'أحمد حسن',
      },
      expertise: {
        en: ['Historical', 'Cultural', 'Muslim'],
        ar: ['تاريخي', 'ثقافي', 'إسلامي'],
      },
      languages: ['Arabic', 'English', 'Hebrew'],
      rating: 4.9,
      reviewCount: 127,
      image: '/images/guide1.jpg', // Placeholder
      location: {
        en: 'Jerusalem',
        ar: 'القدس',
      },
      href: '/guides/guide1',
    },
    {
      id: 'guide2',
      name: {
        en: 'Sarah Cohen',
        ar: 'سارة كوهين',
      },
      expertise: {
        en: ['Jewish', 'Historical', 'Food'],
        ar: ['يهودي', 'تاريخي', 'طعام'],
      },
      languages: ['Hebrew', 'English', 'Spanish'],
      rating: 4.8,
      reviewCount: 93,
      image: '/images/guide2.jpg', // Placeholder
      location: {
        en: 'Tel Aviv',
        ar: 'تل أبيب',
      },
      href: '/guides/guide2',
    },
    {
      id: 'guide3',
      name: {
        en: 'Michael Boulos',
        ar: 'مايكل بولس',
      },
      expertise: {
        en: ['Christian', 'Historical', 'Cultural'],
        ar: ['مسيحي', 'تاريخي', 'ثقافي'],
      },
      languages: ['Arabic', 'English', 'French'],
      rating: 5.0,
      reviewCount: 156,
      image: '/images/guide3.jpg', // Placeholder
      location: {
        en: 'Nazareth',
        ar: 'الناصرة',
      },
      href: '/guides/guide3',
    },
    {
      id: 'guide4',
      name: {
        en: 'Leila Abed',
        ar: 'ليلى عبد',
      },
      expertise: {
        en: ['Political', 'Cultural', 'Food'],
        ar: ['سياسي', 'ثقافي', 'طعام'],
      },
      languages: ['Arabic', 'English', 'German'],
      rating: 4.7,
      reviewCount: 82,
      image: '/images/guide4.jpg', // Placeholder
      location: {
        en: 'Ramallah',
        ar: 'رام الله',
      },
      href: '/guides/guide4',
    },
  ];

  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5HdWlkZTwvdGV4dD48L3N2Zz4=';

  return (
    <section className="py-16 bg-secondary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'en' ? 'Top-Rated Guides' : 'المرشدين الأعلى تقييماً'}
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            {locale === 'en'
              ? 'Meet our experienced local guides who will make your journey unforgettable'
              : 'تعرف على مرشدينا المحليين ذوي الخبرة الذين سيجعلون رحلتك لا تُنسى'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={guide.href}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={placeholderImage}
                  alt={guide.name[locale]}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{guide.name[locale]}</h3>
                
                {/* Rating */}
                <div className="flex items-center mb-3">
                  <Star className="text-yellow-500 mr-1" size={16} />
                  <span className="font-medium">{guide.rating}</span>
                  <span className="text-secondary-500 ml-1">
                    ({guide.reviewCount} {locale === 'en' ? 'reviews' : 'تقييمات'})
                  </span>
                </div>
                
                {/* Location */}
                <div className="flex items-center mb-3 text-secondary-700">
                  <MapPin className="mr-2" size={16} />
                  <span>{guide.location[locale]}</span>
                </div>
                
                {/* Languages */}
                <div className="flex items-center mb-4 text-secondary-700">
                  <Languages className="mr-2 text-lg" size={18} />
                  <span>{guide.languages.join(', ')}</span>
                </div>
                
                {/* Expertise */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {guide.expertise && guide.expertise[locale] && guide.expertise[locale].map((exp, index) => (
                    <span
                      key={index}
                      className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/guides"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-primary-600 hover:bg-primary-700 transition-colors"
          >
           <Button> {locale === 'en' ? 'View All Guides' : 'عرض جميع المرشدين'}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGuides; 