'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function ComparisonTable({ locale }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const features = [
    {
      name: {
        en: 'Licensed guides',
        ar: 'مرشدون مرخصون'
      },
      tourminded: true,
      others: false,
      description: {
        en: 'All our guides are professionally licensed and verified',
        ar: 'جميع مرشدينا مرخصون ومعتمدون مهنيًا'
      }
    },
    {
      name: {
        en: 'Private, customizable tours',
        ar: 'جولات خاصة قابلة للتخصيص'
      },
      tourminded: true,
      others: false,
      description: {
        en: 'Create your perfect itinerary with your guide',
        ar: 'قم بإنشاء مسار رحلتك المثالي مع مرشدك'
      }
    },
    {
      name: {
        en: 'Choose guide based on expertise',
        ar: 'اختر المرشد بناءً على خبرته'
      },
      tourminded: true,
      others: false,
      description: {
        en: 'Find guides specialized in your areas of interest',
        ar: 'ابحث عن مرشدين متخصصين في مجالات اهتمامك'
      }
    },
    {
      name: {
        en: 'Verified language proficiency',
        ar: 'إتقان لغوي موثق'
      },
      tourminded: true,
      others: false,
      description: {
        en: 'All language skills are verified and rated',
        ar: 'جميع المهارات اللغوية موثقة ومقيمة'
      }
    },
    {
      name: {
        en: 'Trusted reviews of the guide',
        ar: 'تقييمات موثوقة للمرشد'
      },
      tourminded: true,
      others: false,
      description: {
        en: 'Read authentic reviews from real travelers',
        ar: 'اقرأ تقييمات أصلية من مسافرين حقيقيين'
      }
    },
    {
      name: {
        en: 'Price',
        ar: 'السعر'
      },
      tourminded: '$',
      others: '$$$',
      description: {
        en: 'Better value with direct booking',
        ar: 'قيمة أفضل مع الحجز المباشر'
      },
      isPrice: true
    }
  ];
  
  return (
    <div className="w-full overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        {locale === 'en' ? 'What makes Tourminded better?' : 'ما الذي يجعل Tourminded أفضل؟'}
      </h2>
      
      {/* Desktop version - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-4 px-6 text-left font-semibold text-gray-700 border-b">
                {locale === 'en' ? 'Feature' : 'الميزة'}
              </th>
              <th className="py-4 px-6 text-center font-semibold text-primary-700 border-b">
                Tourminded
              </th>
              <th className="py-4 px-6 text-center font-semibold text-gray-700 border-b">
                {locale === 'en' ? 'Other travel agencies' : 'وكالات السفر الأخرى'}
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-4 px-6 border-b">
                  <div className="font-medium">{locale === 'en' ? feature.name.en : feature.name.ar}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {locale === 'en' ? feature.description.en : feature.description.ar}
                  </div>
                </td>
                <td className="py-4 px-6 text-center border-b">
                  {feature.isPrice ? (
                    <span className="font-bold text-primary-600">{feature.tourminded}</span>
                  ) : feature.tourminded ? (
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                  )}
                </td>
                <td className="py-4 px-6 text-center border-b">
                  {feature.isPrice ? (
                    <span className="font-bold text-gray-600">{feature.others}</span>
                  ) : feature.others ? (
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile version - visible only on mobile */}
      <div className="md:hidden">
        <div className="grid grid-cols-3 bg-gray-50 py-3 px-4 rounded-t-lg border border-gray-200">
          <div className="col-span-1 font-semibold text-gray-700">
            {locale === 'en' ? 'Feature' : 'الميزة'}
          </div>
          <div className="col-span-1 text-center font-semibold text-primary-700">
            Tourminded
          </div>
          <div className="col-span-1 text-center font-semibold text-gray-700 text-sm">
            {locale === 'en' ? 'Others' : 'الآخرون'}
          </div>
        </div>
        
        {features.slice(0, isExpanded ? features.length : 3).map((feature, index) => (
          <div 
            key={index} 
            className={`grid grid-cols-3 py-3 px-4 border-b border-l border-r border-gray-200 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            <div className="col-span-1">
              <div className="font-medium text-sm">
                {locale === 'en' ? feature.name.en : feature.name.ar}
              </div>
            </div>
            <div className="col-span-1 flex justify-center items-center">
              {feature.isPrice ? (
                <span className="font-bold text-primary-600">{feature.tourminded}</span>
              ) : feature.tourminded ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="col-span-1 flex justify-center items-center">
              {feature.isPrice ? (
                <span className="font-bold text-gray-600">{feature.others}</span>
              ) : feature.others ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
        ))}
        
        {!isExpanded && features.length > 3 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full py-2 text-center text-primary-600 font-medium border border-t-0 border-gray-200 rounded-b-lg bg-white hover:bg-gray-50 transition-colors"
          >
            {locale === 'en' ? 'Show more features' : 'عرض المزيد من الميزات'}
          </button>
        )}
        
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full py-2 text-center text-primary-600 font-medium border border-t-0 border-gray-200 rounded-b-lg bg-white hover:bg-gray-50 transition-colors"
          >
            {locale === 'en' ? 'Show less' : 'عرض أقل'}
          </button>
        )}
      </div>
    </div>
  );
} 