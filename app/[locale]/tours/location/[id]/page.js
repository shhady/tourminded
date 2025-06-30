import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';
import { Star, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }) {
  const localeParams = await params;
  const id = await localeParams.id;
  const locale = await localeParams.locale;
  
  // Get location data
  const location = await getLocationData(id);
  
  if (!location) {
    return {
      title: locale === 'en' ? 'Location Not Found' : 'الموقع غير موجود',
      description: locale === 'en' ? 'The requested location could not be found.' : 'لم يتم العثور على الموقع المطلوب.'
    };
  }
  
  return {
    title: `${location.name[locale]} Tours | Watermelon Tours`,
    description: locale === 'en' 
      ? `Explore tours in ${location.name[locale]} with expert local guides` 
      : `استكشف الجولات في ${location.name[locale]} مع مرشدين محليين خبراء`
  };
}

// Function to get location data
async function getLocationData(id) {
  // First try to get from API
  try {
    const hardcodedLocations = [
      {
        _id: 'jerusalem',
        name: {
          en: 'Jerusalem',
          ar: 'القدس'
        },
        description: {
          en: 'Jerusalem is a city in the Middle East, located on a plateau in the Judaean Mountains between the Mediterranean and the Dead Sea.',
          ar: 'القدس هي مدينة في الشرق الأوسط، تقع على هضبة في جبال يهودا بين البحر الأبيض المتوسط والبحر الميت.'
        }
      },
      {
        _id: 'tel-aviv',
        name: {
          en: 'Tel Aviv',
          ar: 'تل أبيب'
        },
        description: {
          en: 'Tel Aviv is a city on Israel\'s Mediterranean coast, known for its vibrant nightlife and beautiful beaches.',
          ar: 'تل أبيب هي مدينة على ساحل البحر الأبيض المتوسط في إسرائيل، معروفة بحياتها الليلية النابضة بالحياة وشواطئها الجميلة.'
        }
      },
      {
        _id: 'nazareth',
        name: {
          en: 'Nazareth',
          ar: 'الناصرة'
        },
        description: {
          en: 'Nazareth is the largest Arab city in Israel and an important center for Christianity.',
          ar: 'الناصرة هي أكبر مدينة عربية في إسرائيل ومركز مهم للمسيحية.'
        }
      },
      {
        _id: 'dead-sea',
        name: {
          en: 'Dead Sea',
          ar: 'البحر الميت'
        },
        description: {
          en: 'The Dead Sea is a salt lake bordered by Jordan to the east and Israel to the west.',
          ar: 'البحر الميت هو بحيرة ملحية يحدها الأردن من الشرق وإسرائيل من الغرب.'
        }
      },
      {
        _id: 'haifa',
        name: {
          en: 'Haifa',
          ar: 'حيفا'
        },
        description: {
          en: 'Haifa is a northern Israeli port city built on the slopes of Mount Carmel.',
          ar: 'حيفا هي مدينة ميناء إسرائيلية شمالية مبنية على منحدرات جبل الكرمل.'
        }
      },
      {
        _id: 'jaffa',
        name: {
          en: 'Jaffa',
          ar: 'يافا'
        },
        description: {
          en: 'Jaffa is an ancient port city in Israel, now part of Tel Aviv.',
          ar: 'يافا هي مدينة ميناء قديمة في إسرائيل، وهي الآن جزء من تل أبيب.'
        }
      }
    ];
    
    // Find location by ID or name (case insensitive)
    return hardcodedLocations.find(location => 
      location._id.toLowerCase() === id.toLowerCase() || 
      location.name.en.toLowerCase() === id.toLowerCase() ||
      location.name.ar === id
    );
  } catch (error) {
    console.error('Error getting location data:', error);
    return null;
  }
}

// Function to fetch tours by location
async function fetchToursByLocation(id) {
  try {
    // Use the API route to fetch tours by location
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log(`Fetching tours from: ${apiUrl}/api/tours/location/${id}`);
    
    const response = await fetch(`${apiUrl}/api/tours/location/${id}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch tours for location: ${response.status}`);
      throw new Error(`Failed to fetch tours: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.data?.length || 0} tours for location ${id}`);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching tours for location:', error);
    
    // Return hardcoded tours as fallback
    const hardcodedTours = [
      {
        _id: 'tour1',
        title: {
          en: 'Historical Jerusalem Tour',
          ar: 'جولة القدس التاريخية'
        },
        price: 120,
        duration: 4,
        durationUnit: 'hours',
        rating: 4.8,
        reviewCount: 24,
        images: {
          cover: {
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/architecture-signs.jpg'
          }
        },
        guide: {
          name: {
            en: 'David Cohen',
            ar: 'ديفيد كوهين'
          },
          profileImage: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/people/boy-snow-hoodie.jpg'
        },
        locationNames: ['Jerusalem', 'القدس']
      },
      {
        _id: 'tour2',
        title: {
          en: 'Tel Aviv Beach Tour',
          ar: 'جولة شاطئ تل أبيب'
        },
        price: 80,
        duration: 3,
        durationUnit: 'hours',
        rating: 4.5,
        reviewCount: 18,
        images: {
          cover: {
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/beach-boat.jpg'
          }
        },
        guide: {
          name: {
            en: 'Sarah Levy',
            ar: 'سارة ليفي'
          },
          profileImage: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/people/smiling-man.jpg'
        },
        locationNames: ['Tel Aviv', 'تل أبيب']
      },
      {
        _id: 'tour3',
        title: {
          en: 'Nazareth Religious Sites',
          ar: 'المواقع الدينية في الناصرة'
        },
        price: 100,
        duration: 5,
        durationUnit: 'hours',
        rating: 4.7,
        reviewCount: 32,
        images: {
          cover: {
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/nature-mountains.jpg'
          }
        },
        guide: {
          name: {
            en: 'Mohammed Ali',
            ar: 'محمد علي'
          },
          profileImage: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/people/kitchen-bar.jpg'
        },
        locationNames: ['Nazareth', 'الناصرة']
      },
      {
        _id: 'tour4',
        title: {
          en: 'Dead Sea Relaxation',
          ar: 'استرخاء البحر الميت'
        },
        price: 150,
        duration: 6,
        durationUnit: 'hours',
        rating: 4.9,
        reviewCount: 45,
        images: {
          cover: {
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/nature-mountains.jpg'
          }
        },
        guide: {
          name: {
            en: 'Rachel Green',
            ar: 'راشيل غرين'
          },
          profileImage: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/people/bicycle.jpg'
        },
        locationNames: ['Dead Sea', 'البحر الميت']
      },
      {
        _id: 'tour5',
        title: {
          en: 'Haifa Gardens Tour',
          ar: 'جولة حدائق حيفا'
        },
        price: 90,
        duration: 3,
        durationUnit: 'hours',
        rating: 4.6,
        reviewCount: 28,
        images: {
          cover: {
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/beach-boat.jpg'
          }
        },
        guide: {
          name: {
            en: 'Yossi Levi',
            ar: 'يوسي ليفي'
          },
          profileImage: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/people/jazz.jpg'
        },
        locationNames: ['Haifa', 'حيفا']
      },
      {
        _id: 'tour6',
        title: {
          en: 'Jaffa Old City Tour',
          ar: 'جولة مدينة يافا القديمة'
        },
        price: 85,
        duration: 4,
        durationUnit: 'hours',
        rating: 4.7,
        reviewCount: 36,
        images: {
          cover: {
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/architecture-signs.jpg'
          }
        },
        guide: {
          name: {
            en: 'Amir Hassan',
            ar: 'أمير حسن'
          },
          profileImage: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/people/boy-snow-hoodie.jpg'
        },
        locationNames: ['Jaffa', 'يافا']
      }
    ];
    
    // Filter tours by location name
    const location = await getLocationData(id);
    if (location) {
      return hardcodedTours.filter(tour => 
        tour.locationNames.some(name => 
          name.toLowerCase() === location.name.en.toLowerCase() || 
          name === location.name.ar
        )
      );
    }
    
    return [];
  }
}

export default async function LocationToursPage({ params }) {
  const localeParams = await params;
  const id = await localeParams.id;
  const locale = await localeParams.locale;
  
  // Get current user
  const user = await getCurrentUser();
  
  // Get location data
  const location = await getLocationData(id);
  
  if (!location) {
    notFound();
  }
  
  // Get tours for this location
  const tours = await fetchToursByLocation(id);
  
  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=';
  
  return (
    <MainLayout locale={locale} user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-secondary-900">
            {locale === 'en' 
              ? `Tours in ${location.name.en}` 
              : `الجولات في ${location.name.ar}`}
          </h1>
          <p className="text-secondary-600 mb-6">
            {location.description[locale]}
          </p>
          <Link 
            href={`/${locale}/locations/${id}`}
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
          >
            {locale === 'en' ? '← Back to location details' : 'العودة إلى تفاصيل الموقع →'}
          </Link>
        </div>
        
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <div key={tour._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={tour.images?.cover?.url || placeholderImage}
                    alt={tour.title[locale]}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {tour.title[locale]}
                  </h3>
                  <div className="flex items-center mb-2">
                    <Star className="text-yellow-500 w-5 h-5" />
                    <span className="ml-1 text-secondary-700">
                      {tour.rating} ({tour.reviewCount} {locale === 'en' ? 'reviews' : 'تقييمات'})
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Clock className="text-secondary-500 w-5 h-5" />
                    <span className="ml-1 text-secondary-700">
                      {tour.duration} {tour.durationUnit === 'hours' ? 
                        (locale === 'en' ? 'hours' : 'ساعات') : 
                        (locale === 'en' ? 'days' : 'أيام')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-primary-600">
                      ${tour.price}
                    </span>
                    <Link 
                      href={`/${locale}/tours/${tour._id}`}
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {locale === 'en' ? 'View Tour' : 'عرض الجولة'}
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-secondary-600">
              {locale === 'en' 
                ? 'No tours available for this location yet. Check back soon!' 
                : 'لا توجد جولات متاحة لهذا الموقع حتى الآن. تحقق مرة أخرى قريبًا!'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 