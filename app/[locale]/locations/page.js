import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'All Locations | Watermelon Tours',
  description: 'Explore all the fascinating destinations in the Holy Land',
};

export default async function LocationsPage({ params }) {
  // Get locale from params
  const localeParams = await params;
  const locale = await localeParams?.locale || 'en';
  
  // Location data
  const locations = [
    {
      id: 'jerusalem',
      name: locale === 'en' ? 'Jerusalem' : 'القدس',
      image: '/hero-bg-3.jpg',
      description: locale === 'en'
        ? 'Explore the ancient city sacred to three religions'
        : 'استكشف المدينة القديمة المقدسة للديانات الثلاث',
    },
    {
      id: 'jaffa',
      name: locale === 'en' ? 'Jaffa' : 'يافا',
      image: '/jaffa.jpg',
      description: locale === 'en'
        ? 'Discover the charming ancient port city'
        : 'اكتشف مدينة الميناء القديمة الساحرة',
    },
    {
      id: 'haifa',
      name: locale === 'en' ? 'Haifa' : 'حيفا',
      image: '/hero-bg-2.jpg',
      description: locale === 'en'
        ? 'Visit the beautiful Bahai Gardens and Mount Carmel'
        : 'زيارة حدائق البهائية الجميلة وجبل الكرمل',
    },
    {
      id: 'dead-sea',
      name: locale === 'en' ? 'Dead Sea' : 'البحر الميت',
      image: '/dead-sea.jpg',
      description: locale === 'en'
        ? 'Float in the saltiest body of water on Earth'
        : 'الطفو في أكثر المسطحات المائية ملوحة على الأرض',
    },
    {
      id: 'nazareth',
      name: locale === 'en' ? 'Nazareth' : 'الناصرة',
      image: '/nazareth.jpg',
      description: locale === 'en'
        ? 'Walk through the childhood home of Jesus'
        : 'المشي عبر مسقط رأس يسوع',
    },
    {
      id: 'bethlehem',
      name: locale === 'en' ? 'Bethlehem' : 'بيت لحم',
      image: '/bethlehem.jpg',
      description: locale === 'en'
        ? 'Visit the birthplace of Jesus Christ'
        : 'زيارة مكان ولادة يسوع المسيح',
    },
    {
      id: 'tel-aviv',
      name: locale === 'en' ? 'Tel Aviv' : 'تل أبيب',
      image: '/hero-bg-1.jpg',
      description: locale === 'en'
        ? 'Experience the vibrant culture of Israel\'s bustling coastal city'
        : 'استمتع بالثقافة النابضة بالحياة في مدينة إسرائيل الساحلية المزدحمة',
    },
    {
      id: 'sea-of-galilee',
      name: locale === 'en' ? 'Sea of Galilee' : 'بحر الجليل',
      image: '/hero-bg-1.jpg',
      description: locale === 'en'
        ? 'Visit the freshwater lake where Jesus performed many miracles'
        : 'زيارة بحيرة المياه العذبة حيث قام يسوع بالعديد من المعجزات',
    },
    {
      id: 'masada',
      name: locale === 'en' ? 'Masada' : 'مسادا',
      image: '/hero-bg-1.jpg',
      description: locale === 'en'
        ? 'Explore the ancient fortress overlooking the Dead Sea'
        : 'استكشف القلعة القديمة المطلة على البحر الميت',
    },
  ];

  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'en' ? 'All Locations' : 'جميع المواقع'}
          </h1>
          <p className="text-xl text-secondary-900 max-w-3xl mx-auto">
            {locale === 'en'
              ? 'Discover all the destinations available for our guided tours'
              : 'اكتشف جميع الوجهات المتاحة لجولاتنا المصحوبة بمرشدين'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <div
              key={location.id}
              className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow relative"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <div className="absolute inset-0 bg-primary-900 opacity-30 group-hover:opacity-20 transition-opacity z-10"></div>
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black opacity-40 z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                  <h3 className="text-2xl font-bold mb-2">{location.name}</h3>
                  <p className="text-white text-opacity-90">{location.description}</p>
                </div>
                
                {/* Buttons container - positioned at the top right */}
                <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                  {/* About Location button */}
                  <Link
                    href={`/${locale}/locations/${location.id}`}
                    className="px-3 py-2 bg-white text-primary-700 text-sm font-medium rounded-md shadow-md hover:bg-primary-50 transition-colors whitespace-nowrap"
                  >
                    {locale === 'en' ? 'About Location' : 'حول الموقع'}
                  </Link>
                  
                  {/* Explore Tours button */}
                  <Link
                    href={`/${locale}/tours?location=${location.id}`}
                    className="px-3 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-primary-700 transition-colors whitespace-nowrap"
                  >
                    {locale === 'en' ? 'Explore Tours' : 'استكشف الجولات'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 