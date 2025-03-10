import MainLayout from '@/components/layout/MainLayout';
import connectDB from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Locations | Tourminded',
  description: 'Explore the most fascinating destinations in the Holy Land',
};

// Keep the original function but don't use it
async function getLocations() {
  await connectDB();
  
  try {
    const Location = (await import('@/models/Location')).default;
    const locations = await Location.find({}).sort({ 'name.en': 1 });
    console.log('Locations found:', locations.length);
    return locations;
  } catch (error) {
    console.error('Error getting locations:', error);
    return [];
  }
}

export default async function LocationsPage({ params }) {
  // Ensure params.locale is properly awaited
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Hardcoded locations data
  const locations = [
    {
      _id: 'jerusalem',
      name: {
        en: 'Jerusalem',
        ar: 'القدس'
      },
      description: {
        en: 'Jerusalem is a city in the Middle East, located on a plateau in the Judaean Mountains between the Mediterranean and the Dead Sea. It is one of the oldest cities in the world and is considered holy to the three major Abrahamic religions—Judaism, Christianity, and Islam.',
        ar: 'القدس هي مدينة في الشرق الأوسط، تقع على هضبة في جبال يهودا بين البحر الأبيض المتوسط والبحر الميت. وهي واحدة من أقدم المدن في العالم وتعتبر مقدسة للديانات الإبراهيمية الثلاث الرئيسية - اليهودية والمسيحية والإسلام.'
      },
      images: [
        {
          url: '/hero-bg-3.jpg'
        }
      ]
    },
    {
      _id: 'Bethlehem',
      name: {
        en: 'Bethlehem',
        ar: 'بيت لحم'
      },
      description: {
        en: 'Bethlehem is a city in the West Bank of the Jordan River, known for its biblical significance as the birthplace of Jesus Christ. It features numerous religious sites and historical attractions.',
        ar: 'بيت لحم هي مدينة في الغوطة الغربية للأردن، معروفة لأهميتها التاريخية كمولد المسيح. وتضم العديد من المواقع الدينية والمعالم التاريخية.'
      },
      images: [
        {
          url: '/bethlehem.jpg'
        }
      ]
    },
    {
      _id: 'nazareth',
      name: {
        en: 'Nazareth',
        ar: 'الناصرة'
      },
      description: {
        en: 'Nazareth is the largest Arab city in Israel and an important center for Christianity as the childhood home of Jesus. It features numerous religious sites and historical attractions.',
        ar: 'الناصرة هي أكبر مدينة عربية في إسرائيل ومركز مهم للمسيحية باعتبارها موطن طفولة يسوع. وتضم العديد من المواقع الدينية والمعالم التاريخية.'
      },  
      images: [
        {
            url: '/nazareth.jpg'
        }
      ]
    },
    {
      _id: 'dead-sea',
      name: {
        en: 'Dead Sea',
        ar: 'البحر الميت'
      },
      description: {
        en: 'The Dead Sea is a salt lake bordered by Jordan to the east and Israel to the west. It\'s known for its extremely high salt concentration, allowing visitors to float effortlessly on its surface.',
        ar: 'البحر الميت هو بحيرة ملحية يحدها الأردن من الشرق وإسرائيل من الغرب. وهو معروف بتركيزه الملحي العالي للغاية، مما يسمح للزوار بالطفو بسهولة على سطحه.'
      },
      images: [
        {
          url: '/dead-sea.jpg'
        }
      ]
    },
    {
      _id: 'haifa',
      name: {
        en: 'Haifa',
        ar: 'حيفا'
      },
      description: {
        en: 'Haifa is a northern Israeli port city built on the slopes of Mount Carmel. It\'s known for the Bahá\'í Gardens, a terraced garden with the golden-domed Shrine of the Báb.',
        ar: 'حيفا هي مدينة ميناء إسرائيلية شمالية مبنية على منحدرات جبل الكرمل. وهي معروفة بحدائق البهائية، وهي حديقة مدرجة مع ضريح الباب ذو القبة الذهبية.'
      },
      images: [
        {
          url: '/hero-bg-2.jpg'
        }
      ]
    },
    {
      _id: 'jaffa',
      name: {
        en: 'Jaffa',
        ar: 'يافا'
      },
      description: {
        en: 'Jaffa is an ancient port city in Israel, now part of Tel Aviv. It\'s known for its historic old town, vibrant flea market, and beautiful views of the Mediterranean Sea.',
        ar: 'يافا هي مدينة ميناء قديمة في إسرائيل، وهي الآن جزء من تل أبيب. وهي معروفة ببلدتها القديمة التاريخية وسوق البراغيث النابض بالحياة والمناظر الجميلة للبحر الأبيض المتوسط.'
      },
      images: [
        {
          url: '/jaffa.jpg'
        }
      ]
    }
  ];
  
  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5Mb2NhdGlvbiBJbWFnZTwvdGV4dD48L3N2Zz4=';
  
  return (
    <MainLayout locale={locale} user={user}>
      <div className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4 text-center text-secondary-900">
            {locale === 'en' ? 'Explore Locations' : 'استكشف المواقع'}
          </h1>
          <p className="text-lg text-center text-secondary-600 mb-12">
            {locale === 'en' 
              ? 'Discover the most fascinating destinations in the Holy Land' 
              : 'اكتشف أكثر الوجهات إثارة في الأرض المقدسة'}
          </p>
          
          {locations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <Link 
                  key={location._id}
                  href={`/${locale}/locations/${encodeURIComponent(location.name[locale].toLowerCase())}`}
                  className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48">
                    <Image
                      src={location.images?.[0]?.url || placeholderImage}
                      alt={location.name[locale]}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                      {location.name[locale]}
                    </h3>
                    <p className="text-secondary-600 line-clamp-2">
                      {location.description[locale]}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-secondary-600">
                {locale === 'en' 
                  ? 'No locations found. Check back soon!' 
                  : 'لم يتم العثور على مواقع. تحقق مرة أخرى قريبًا!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 