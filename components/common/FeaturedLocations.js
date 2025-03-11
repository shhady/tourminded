import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FeaturedLocations = ({ locale }) => {
  const locations = [
    {
      id: 'jerusalem',
      name: locale === 'en' ? 'Jerusalem' : 'القدس',
      image: '/hero-bg-3.jpg', // Placeholder - will need actual images
      description: locale === 'en'
        ? 'Explore the ancient city sacred to three religions'
        : 'استكشف المدينة القديمة المقدسة للديانات الثلاث',
      href: '/locations/jerusalem',
    },
    {
      id: 'jaffa',
      name: locale === 'en' ? 'Jaffa' : 'يافا',
      image: '/jaffa.jpg', // Placeholder
      description: locale === 'en'
        ? 'Discover the charming ancient port city'
        : 'اكتشف مدينة الميناء القديمة الساحرة',
      href: '/locations/jaffa',
    },
    {
      id: 'haifa',
      name: locale === 'en' ? 'Haifa' : 'حيفا',
      image: '/hero-bg-2.jpg', // Placeholder
      description: locale === 'en'
        ? 'Visit the beautiful Bahai Gardens and Mount Carmel'
        : 'زيارة حدائق البهائية الجميلة وجبل الكرمل',
      href: '/locations/haifa',
    },
    {
      id: 'dead-sea',
      name: locale === 'en' ? 'Dead Sea' : 'البحر الميت',
      image: '/dead-sea.jpg', // Placeholder
      description: locale === 'en'
        ? 'Float in the saltiest body of water on Earth'
        : 'الطفو في أكثر المسطحات المائية ملوحة على الأرض',
      href: '/locations/dead-sea',
    },
    {
      id: 'nazareth',
      name: locale === 'en' ? 'Nazareth' : 'الناصرة',
      image: '/nazareth.jpg', // Placeholder
      description: locale === 'en'
        ? 'Walk through the childhood home of Jesus'
        : 'المشي عبر مسقط رأس يسوع',
      href: '/locations/nazareth',
    },
    {
      id: 'bethlehem',
      name: locale === 'en' ? 'Bethlehem' : 'بيت لحم',
      image: '/bethlehem.jpg', // Placeholder
      description: locale === 'en'
        ? 'Visit the birthplace of Jesus Christ'
        : 'زيارة مكان ولادة يسوع المسيح',
      href: '/locations/bethlehem',
    },
  ];

  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=';

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'en' ? 'Top Locations' : 'أفضل المواقع'}
          </h2>
          <p className="text-xl text-secondary-900 max-w-3xl mx-auto">
            {locale === 'en'
              ? 'Explore the most fascinating destinations in the Holy Land'
              : 'استكشف أكثر الوجهات إثارة في الأرض المقدسة'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <Link
              key={location.id}
              href={`/${locale}/tours?location=${location.id}`}
              className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <div className="absolute inset-0 bg-primary-900 opacity-30 group-hover:opacity-20 transition-opacity z-10"></div>
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black opacity-40 z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                  <h3 className="text-2xl font-bold mb-2">{location.name}</h3>
                  <p className="text-white text-opacity-90">{location.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
            <Link
              href={`/${locale}/tours`}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            {locale === 'en' ? 'View All Locations' : 'عرض جميع المواقع'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedLocations; 