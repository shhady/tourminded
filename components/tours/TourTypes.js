import React from 'react';
import Link from 'next/link';
import { Cross, Star, Building, Landmark, BookOpen, Theater, Utensils, Globe, ArrowRight } from 'lucide-react';

const TourTypes = ({ locale }) => {
  // Fix links to include locale
  const getLocalizedHref = (href) => {
    if (href === '/') {
      return `/${locale}`;
    }
    return `/${locale}${href}`;
  };

  const tourTypes = [
    {
      id: 'christian',
      name: locale === 'en' ? 'Christian' : 'مسيحي',
      icon: <Cross className="text-4xl mb-4 text-primary-500" size={36} />,
      description: locale === 'en' 
        ? 'Explore sacred Christian sites and follow in the footsteps of Jesus' 
        : 'استكشف المواقع المسيحية المقدسة واتبع خطى يسوع',
      href: '/tours?expertise=Christian',
      color: 'bg-blue-50',
    },
    {
      id: 'jewish',
      name: locale === 'en' ? 'Jewish' : 'يهودي',
      icon: <Star className="text-4xl mb-4 text-primary-500" size={36} />,
      description: locale === 'en' 
        ? 'Discover the rich Jewish heritage and historical sites' 
        : 'اكتشف التراث اليهودي الغني والمواقع التاريخية',
      href: '/tours?expertise=Jewish',
      color: 'bg-indigo-50',
    },
    {
      id: 'muslim',
      name: locale === 'en' ? 'Muslim' : 'إسلامي',
      icon: <Building className="text-4xl mb-4 text-primary-500" size={36} />,
      description: locale === 'en' 
        ? 'Visit important Islamic sites and learn about Muslim history' 
        : 'زيارة المواقع الإسلامية المهمة والتعرف على التاريخ الإسلامي',
      href: '/tours?expertise=Muslim',
      color: 'bg-green-50',
    },
    {
      id: 'political',
      name: locale === 'en' ? 'Political' : 'سياسي',
      icon: <Landmark className="text-4xl mb-4 text-primary-500" size={36} />,
      description: locale === 'en' 
        ? 'Understand the complex political landscape of the region' 
        : 'فهم المشهد السياسي المعقد للمنطقة',
      href: '/tours?expertise=Political',
      color: 'bg-red-50',
    },
    {
      id: 'historical',
      name: locale === 'en' ? 'Historical' : 'تاريخي',
      icon: <BookOpen className="text-4xl mb-4 text-primary-500" size={36} />,
      description: locale === 'en' 
        ? 'Journey through thousands of years of fascinating history' 
        : 'رحلة عبر آلاف السنين من التاريخ المثير',
      href: '/tours?expertise=Historical',
      color: 'bg-amber-50',
    },
    {
      id: 'cultural',
      name: locale === 'en' ? 'Cultural' : 'ثقافي',
      icon: <Theater className="text-4xl mb-4 text-primary-500" size={36} />,
      description: locale === 'en' 
        ? 'Experience the diverse cultures and traditions of the Holy Land' 
        : 'تجربة الثقافات والتقاليد المتنوعة للأرض المقدسة',
      href: '/tours?expertise=Cultural',
      color: 'bg-purple-50',
    },
    {
      id: 'food',
      name: locale === 'en' ? 'Food' : 'طعام',
      icon: <Utensils className="text-4xl mb-4 text-primary-500" size={36} />,
      description: locale === 'en' 
        ? 'Taste the delicious flavors of Middle Eastern cuisine' 
        : 'تذوق النكهات اللذيذة للمطبخ الشرق أوسطي',
      href: '/tours?expertise=Food',
      color: 'bg-orange-50',
    },
    {
      id: 'all-inclusive',
      name: locale === 'en' ? 'All-inclusive' : 'شامل',
      icon: <Globe className="text-4xl mb-4 text-primary-500" size={36} />,
      description: locale === 'en' 
        ? 'Comprehensive tours covering multiple aspects of the Holy Land' 
        : 'جولات شاملة تغطي جوانب متعددة من الأرض المقدسة',
      href: '/tours?expertise=All-inclusive',
      color: 'bg-teal-50',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary-900">
            {locale === 'en' ? 'Explore Tour Types' : 'استكشف أنواع الجولات'}
          </h2>
          <p className="text-xl text-secondary-900 max-w-3xl mx-auto">
            {locale === 'en'
              ? 'Discover the perfect tour experience based on your interests and preferences'
              : 'اكتشف تجربة الجولة المثالية بناءً على اهتماماتك وتفضيلاتك'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {tourTypes.map((type) => (
            <Link
              key={type.id}
              href={getLocalizedHref(type.href)}
              className={`${type.color} rounded-xl shadow-soft p-6 transition-all hover:shadow-medium hover:translate-y-[-5px] flex flex-col items-center text-center h-full`}
            >
              <div className="bg-white p-4 rounded-full shadow-soft mb-4">
                {type.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-secondary-900">{type.name}</h3>
              <p className="text-secondary-900 mb-6 flex-grow">{type.description}</p>
              <div className="flex items-center text-primary-600 font-medium group">
                <span>{locale === 'en' ? 'Explore Tours' : 'استكشف الجولات'}</span>
                <ArrowRight className={`ml-2 transition-transform group-hover:translate-x-1 ${locale === 'ar' ? 'rotate-180' : ''}`} size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TourTypes; 