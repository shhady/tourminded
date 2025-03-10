import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import connectDB from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { Star, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }) {
  const localeParams = await params;
  const id = await localeParams.id;
  const locale = await localeParams.locale;
  
  // Get location data
  const location = getHardcodedLocation(id);
  
  if (!location) {
    return {
      title: locale === 'en' ? 'Location Not Found' : 'الموقع غير موجود',
      description: locale === 'en' ? 'The requested location could not be found.' : 'لم يتم العثور على الموقع المطلوب.'
    };
  }
  
  return {
    title: `${location.name[locale]} | Tourminded`,
    description: location.description[locale].substring(0, 160)
  };
}

// Original function kept for reference
async function getLocation(id) {
  await connectDB();
  
  try {
    const Location = (await import('@/models/Location')).default;
    let location;
    
    // First try to find by ObjectId
    try {
      location = await Location.findById(id);
    } catch (error) {
      // If it fails, it might be a string name instead of an ObjectId
      console.log('Not a valid ObjectId, trying to find by name');
    }
    
    // If not found by ID, try to find by name
    if (!location) {
      location = await Location.findOne({
        $or: [
          { 'name.en': { $regex: new RegExp(`^${id}$`, 'i') } },
          { 'name.ar': { $regex: new RegExp(`^${id}$`, 'i') } }
        ]
      });
    }
    
    return location;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

// Original function kept for reference
async function getToursForLocation(locationId, locationName) {
  await connectDB();
  
  try {
    const Tour = (await import('@/models/Tour')).default;
    
    // First try to find tours that have this location ID
    let tours = await Tour.find({
      locations: locationId,
      isActive: true
    })
    .populate('guide', 'name profileImage rating reviewCount')
    .sort({ createdAt: -1 });
    
    // If no tours found by ID, try to find by location name
    if (tours.length === 0 && locationName) {
      tours = await Tour.find({
        locationNames: { $regex: new RegExp(locationName, 'i') },
        isActive: true
      })
      .populate('guide', 'name profileImage rating reviewCount')
      .sort({ createdAt: -1 });
    }
    
    return tours;
  } catch (error) {
    console.error('Error getting tours for location:', error);
    return [];
  }
}

// Hardcoded locations data
function getHardcodedLocation(id) {
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
      _id: 'jaffa',
      name: {
        en: 'Jaffa',
        ar: 'يافا'
      },
      description: {
        en: 'Jaffa is a city on Israel\'s Mediterranean coast. It\'s known for its vibrant nightlife, beautiful beaches, and modern architecture. The city is a major economic and technological center.',
        ar: 'يافا هي مدينة على ساحل البحر الأبيض المتوسط في إسرائيل. وهي معروفة بحياتها الليلية النابضة بالحياة وشواطئها الجميلة وهندستها المعمارية الحديثة. المدينة هي مركز اقتصادي وتكنولوجي رئيسي.'
      },
      images: [
        {
          url: '/jaffa.jpg'
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
      _id: 'bethlehem',
      name: {
        en: 'Bethlehem',
        ar: 'بيت لحم'
      },
      description: {
        en: 'Bethlehem is a city in the West Bank of Palestine, known for its historic significance as the birthplace of Jesus Christ. It features the Church of the Nativity, a revered site for Christians.',
        ar: 'بيت لحم هي مدينة في الضفة الغربية لفلسطين، معروفة لأهميتها التاريخية كموطن المسيح الحي. وتحتوي على الكنيسة الناصرة، موقع مقدس للمسيحيين.'
      },
      images: [
        {
          url: '/bethlehem.jpg'
        }
      ]
    }
  ];
  
  // Find location by ID or name (case insensitive)
  return locations.find(location => 
    location._id.toLowerCase() === id.toLowerCase() || 
    location.name.en.toLowerCase() === id.toLowerCase() ||
    location.name.ar === id
  );
}

// Hardcoded sample tours for locations
function getHardcodedToursForLocation(locationName) {
  // Sample tours data
  const tours = [
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
  return tours.filter(tour => 
    tour.locationNames.some(name => 
      name.toLowerCase() === locationName.toLowerCase()
    )
  );
}

// Function to fetch tours by location using the API
async function fetchToursByLocation(id, locale) {
  try {
    // Use the new API route to fetch tours by location
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log(`Fetching tours from: ${apiUrl}/api/tours/location/${id}`);
    
    const response = await fetch(`${apiUrl}/api/tours/location/${id}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch tours for location: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`Found ${data.data?.length || 0} tours for location ${id}`);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching tours for location:', error);
    return [];
  }
}

export default async function LocationDetailPage({ params }) {
  const localeParams = await params;
  const id = await localeParams.id;
  const locale = await localeParams.locale;
  
  // Get current user
  const user = await getCurrentUser();
  
  // Get location from hardcoded data
  const location = getHardcodedLocation(id);
  
  if (!location) {
    notFound();
  }
  
  // Try to fetch tours from API first
  let tours = [];
  try {
    tours = await fetchToursByLocation(id, locale);
  } catch (error) {
    console.error('Error fetching tours from API:', error);
  }
  
  // If no tours from API, use hardcoded tours as fallback
  if (tours.length === 0) {
    tours = getHardcodedToursForLocation(location.name.en);
  }
  
  // Placeholder image for development
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzBkNDdhMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=';
  
  return (
    <MainLayout locale={locale} user={user}>
      {/* Location Header */}
      <div className="relative h-64 md:h-96">
        <Image
          src={location.images?.[0]?.url || placeholderImage}
          alt={location.name[locale]}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {location.name[locale]}
          </h1>
        </div>
      </div>
      
      {/* Location Description */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-secondary-900">
            {locale === 'en' ? 'About this Location' : 'عن هذا الموقع'}
          </h2>
          <p className="text-secondary-700 mb-4">
            {location.description[locale]}
          </p>
        </div>
        
        {/* Tours in this Location */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-secondary-900">
              {locale === 'en' ? 'Tours in this Location' : 'جولات في هذا الموقع'}
            </h2>
            {/* <Link 
              href={`/${locale}/tours/location/${id}`}
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              {locale === 'en' ? 'View All Tours' : 'عرض جميع الجولات'}
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link> */}
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
      </div>
    </MainLayout>
  );
} 