// Removing 'use client' directive because it conflicts with server-side functions like generateMetadata
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import connectDB from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { Star, MapPin, Clock, Users, ArrowRight, ArrowLeft, CalendarClock, Info, Map } from 'lucide-react';
import MapWrapper from '@/components/map/MapWrapper';

// Import Map Wrapper instead of using dynamic import directly

// Helper function to get default coordinates for known locations
function getDefaultCoordinates(locationId) {
  const coordinatesMap = {
    'jerusalem': [31.7781, 35.2337],
    'jaffa': [32.0504, 34.7522],
    'haifa': [32.7940, 34.9896],
    'dead-sea': [31.5497, 35.4676],
    'tel-aviv': [32.0853, 34.7818],
    'nazareth': [32.7021, 35.2978],
    'bethlehem': [31.7054, 35.2024],
    'sea-of-galilee': [32.8288, 35.5912],
    'masada': [31.3157, 35.3534]
  };
  
  return coordinatesMap[locationId] || [31.7781, 35.2337]; // Jerusalem as default
}

export async function generateMetadata({ params }) {
  const { id, locale } = params;
  
  // Get location name based on id
  const getLocationName = () => {
    if (id === 'jerusalem') return locale === 'en' ? 'Jerusalem' : 'القدس';
    if (id === 'jaffa') return locale === 'en' ? 'Jaffa' : 'يافا';
    if (id === 'haifa') return locale === 'en' ? 'Haifa' : 'حيفا';
    if (id === 'dead-sea') return locale === 'en' ? 'Dead Sea' : 'البحر الميت';
    if (id === 'nazareth') return locale === 'en' ? 'Nazareth' : 'الناصرة';
    if (id === 'bethlehem') return locale === 'en' ? 'Bethlehem' : 'بيت لحم';
    if (id === 'tel-aviv') return locale === 'en' ? 'Tel Aviv' : 'تل أبيب';
    if (id === 'sea-of-galilee') return locale === 'en' ? 'Sea of Galilee' : 'بحر الجليل';
    if (id === 'masada') return locale === 'en' ? 'Masada' : 'مسادا';
    return id;
  };
  
  return {
    title: `${getLocationName()} | Watermelon Tours`,
    description: `Learn about ${getLocationName()} and discover tours available in this location`,
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
        en: 'The Dead Sea is a salt lake bordered by Jordan to the east and Israel to the west. At 430.5 meters (1,412 ft) below sea level, its shores are the lowest point on Earth on dry land. The Dead Sea is 9.6 times saltier than the ocean, making it one of the world\'s saltiest bodies of water and creating the famous natural phenomenon where people can float effortlessly. The mineral-rich mud and water have made it a renowned destination for health and wellness treatments.'
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

export default async function LocationDetailsPage({ params }) {
  // Get locale and location id from params
  const { id, locale } = params;
  
  // This would fetch from a database in a real app
  // Location data with detailed information
  const getLocationData = () => {
    const locations = {
      jerusalem: {
        id: 'jerusalem',
        name: locale === 'en' ? 'Jerusalem' : 'القدس',
        region: 'Central Israel',
        coordinates: [31.7683, 35.2137],
        image: '/jerusalem.jpg',
        gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
        description: locale === 'en'
          ? 'Jerusalem is a city in the Middle East, located on a plateau in the Judaean Mountains between the Mediterranean and the Dead Sea. It is one of the oldest cities in the world and is considered holy to the three major Abrahamic religions—Judaism, Christianity, and Islam. The city has been destroyed, rebuilt, captured, and recaptured numerous times throughout its history.'
          : 'القدس هي مدينة في الشرق الأوسط، تقع على هضبة في جبال يهودا بين البحر الأبيض المتوسط والبحر الميت. وهي واحدة من أقدم المدن في العالم وتعتبر مقدسة للديانات الإبراهيمية الثلاث الرئيسية - اليهودية والمسيحية والإسلام. تم تدمير المدينة وإعادة بنائها واحتلالها واستعادتها عدة مرات على مر التاريخ.',
        highlights: locale === 'en' 
          ? ['Western Wall', 'Church of the Holy Sepulchre', 'Dome of the Rock', 'Mount of Olives', 'Via Dolorosa', 'Garden Tomb', 'Yad Vashem Holocaust Memorial']
          : ['حائط المبكى', 'كنيسة القيامة', 'قبة الصخرة', 'جبل الزيتون', 'طريق الآلام', 'قبر الحديقة', 'متحف ياد فاشيم للمحرقة'],
        bestTimeToVisit: locale === 'en' ? 'Spring (March to May) and Fall (September to November) when temperatures are mild and crowds are smaller.' : 'الربيع (مارس إلى مايو) والخريف (سبتمبر إلى نوفمبر) عندما تكون درجات الحرارة معتدلة والحشود أقل.',
        historicalContext: locale === 'en'
          ? 'Jerusalem has been destroyed at least twice, besieged 23 times, captured and recaptured 44 times, and attacked 52 times throughout its history. The Old City was designated a UNESCO World Heritage Site in 1981. For centuries, Jerusalem has been a spiritual center for Judaism, with the Western Wall being the holiest site where Jews are permitted to pray. In Christianity, Jerusalem is revered as the place where Jesus was crucified, buried, and resurrected. For Muslims, Jerusalem is the third holiest city, after Mecca and Medina, with the Dome of the Rock marking the spot from which Muhammad is believed to have ascended to heaven.'
          : 'تم تدمير القدس مرتين على الأقل، وحوصرت 23 مرة، واستولي عليها واستعيدت 44 مرة، وتعرضت للهجوم 52 مرة على مدار تاريخها. تم تعيين المدينة القديمة كموقع للتراث العالمي لليونسكو في عام 1981. لقرون، كانت القدس مركزًا روحيًا لليهودية، حيث يعتبر الحائط الغربي أقدس موقع يُسمح لليهود بالصلاة فيه. في المسيحية، تُبجل القدس كمكان صُلب فيه يسوع ودُفن وقام. بالنسبة للمسلمين، القدس هي ثالث أقدس مدينة بعد مكة والمدينة، حيث تحدد قبة الصخرة المكان الذي يُعتقد أن محمد صعد منه إلى السماء.'
      },
      jaffa: {
        id: 'jaffa',
        name: locale === 'en' ? 'Jaffa' : 'يافا',
        region: 'Tel Aviv Metropolitan Area',
        coordinates: [32.0504, 34.7522],
        image: '/jaffa.jpg',
        gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
        description: locale === 'en'
          ? 'Jaffa is an ancient port city on the Mediterranean coast of Israel, now part of Tel Aviv. With a history spanning over 4,000 years, it\'s one of the oldest ports in the world. Today, Jaffa is a vibrant district known for its historic old town, artistic atmosphere, and beautiful views of the Mediterranean Sea.'
          : 'يافا هي مدينة ميناء قديمة على ساحل البحر الأبيض المتوسط في إسرائيل، وهي الآن جزء من تل أبيب. مع تاريخ يمتد لأكثر من 4000 عام، تعد واحدة من أقدم الموانئ في العالم. اليوم، يافا هي حي نابض بالحياة مشهور ببلدته القديمة التاريخية، وأجوائها الفنية، والمناظر الجميلة للبحر الأبيض المتوسط.',
        highlights: locale === 'en' 
          ? ['Old Jaffa', 'Jaffa Port', 'Jaffa Flea Market', 'St. Peter\'s Church', 'Ilana Goor Museum', 'Wishing Bridge', 'Clock Tower']
          : ['يافا القديمة', 'ميناء يافا', 'سوق البراغيث في يافا', 'كنيسة القديس بطرس', 'متحف إيلانا جور', 'جسر الأمنيات', 'برج الساعة'],
        bestTimeToVisit: locale === 'en' ? 'Spring (March to May) and Fall (September to October) for comfortable temperatures and fewer crowds. Early morning or late afternoon visits provide the best light for photography.' : 'الربيع (مارس إلى مايو) والخريف (سبتمبر إلى أكتوبر) لدرجات حرارة مريحة وحشود أقل. توفر الزيارات في الصباح الباكر أو في وقت متأخر من بعد الظهر أفضل ضوء للتصوير.',
        historicalContext: locale === 'en'
          ? 'Jaffa is one of the world\'s oldest ports, with archaeological evidence dating back to 1800 BCE. The city is mentioned in ancient Egyptian letters and in the Bible as the port from which Jonah set sail before being swallowed by a whale. Throughout history, Jaffa has been ruled by numerous empires including the Egyptians, Phoenicians, Assyrians, Babylonians, Persians, Romans, Arabs, Crusaders, Mamluks, and Ottomans. In modern times, Jaffa was incorporated into Tel Aviv in 1950, creating the unified city of Tel Aviv-Yafo. The old city has been carefully restored, transforming from a neglected area into a thriving artistic and cultural hub while preserving its historical charm.'
          : 'يافا هي واحدة من أقدم الموانئ في العالم، مع أدلة أثرية يعود تاريخها إلى 1800 قبل الميلاد. تمت الإشارة إلى المدينة في الرسائل المصرية القديمة وفي الكتاب المقدس كميناء أبحر منه يونان قبل أن يبتلعه حوت. عبر التاريخ، حكمت يافا العديد من الإمبراطوريات بما في ذلك المصريين والفينيقيين والآشوريين والبابليين والفرس والرومان والعرب والصليبيين والمماليك والعثمانيين. في العصر الحديث، تم دمج يافا في تل أبيب عام 1950، مما أدى إلى إنشاء مدينة تل أبيب-يافا الموحدة. تمت استعادة المدينة القديمة بعناية، وتحولت من منطقة مهملة إلى مركز فني وثقافي مزدهر مع الحفاظ على سحرها التاريخي.'
      },
      haifa: {
        id: 'haifa',
        name: locale === 'en' ? 'Haifa' : 'حيفا',
        region: 'Northern Israel',
        coordinates: [32.7940, 34.9896],
        image: '/haifa.jpg',
        gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
        description: locale === 'en'
          ? 'Haifa is a northern Israeli port city built on the slopes of Mount Carmel facing the Mediterranean Sea. It\'s known for its stunning Bahá\'í Gardens, religious diversity, and vibrant cultural scene. As Israel\'s third-largest city, Haifa is a major industrial and technological center while offering beautiful beaches, historic neighborhoods, and breathtaking views from Mount Carmel.'
          : 'حيفا هي مدينة ميناء إسرائيلية شمالية مبنية على منحدرات جبل الكرمل المطل على البحر الأبيض المتوسط. تشتهر بحدائق البهائية المذهلة والتنوع الديني والمشهد الثقافي النابض بالحياة. بصفتها ثالث أكبر مدينة في إسرائيل، تعد حيفا مركزًا صناعيًا وتكنولوجيًا رئيسيًا مع توفير شواطئ جميلة وأحياء تاريخية وإطلالات خلابة من جبل الكرمل.',
        highlights: locale === 'en' 
          ? ['Bahá\'í Gardens', 'Stella Maris Monastery', 'German Colony', 'Haifa Museum of Art', 'Elijah\'s Cave', 'Wadi Nisnas', 'Carmelit Cable Car']
          : ['حدائق البهائية', 'دير ستيلا ماريس', 'المستعمرة الألمانية', 'متحف حيفا للفنون', 'كهف إيليا', 'وادي النسناس', 'تلفريك الكرمليت'],
        bestTimeToVisit: locale === 'en' ? 'Spring (April to June) and Fall (September to October) when the weather is pleasant and clear. Summers can be hot and humid.' : 'الربيع (أبريل إلى يونيو) والخريف (سبتمبر إلى أكتوبر) عندما يكون الطقس لطيفًا وصافيًا. يمكن أن تكون فصول الصيف حارة ورطبة.',
        historicalContext: locale === 'en'
          ? 'Haifa has been settled for more than 3,000 years, with its name appearing in Talmudic literature from the 3rd century CE. The modern city began to take shape in the late 18th century when it was a small fishing village under Ottoman rule. The completion of the Jezreel Valley railway and the Haifa-Damascus railway transformed the city into a major transportation hub. During the British Mandate period (1918-1948), Haifa grew significantly as an industrial center and port city. Today, Haifa is known for its religious coexistence, with Jews, Muslims, Christians, Druze, and Bahá\'ís living side by side, earning it the nickname "City of Coexistence." The iconic terraced Bahá\'í Gardens, a UNESCO World Heritage site, have become the symbol of the city, attracting visitors from around the world.'
          : 'تم استيطان حيفا لأكثر من 3000 عام، حيث ظهر اسمها في الأدب التلمودي من القرن الثالث الميلادي. بدأت المدينة الحديثة في التشكل في أواخر القرن الثامن عشر عندما كانت قرية صيد صغيرة تحت الحكم العثماني. أدى اكتمال سكة حديد وادي يزرعيل وسكة حديد حيفا-دمشق إلى تحويل المدينة إلى مركز نقل رئيسي. خلال فترة الانتداب البريطاني (1918-1948)، نمت حيفا بشكل كبير كمركز صناعي ومدينة ميناء. اليوم، تشتهر حيفا بالتعايش الديني، حيث يعيش اليهود والمسلمون والمسيحيون والدروز والبهائيون جنبًا إلى جنب، مما أكسبها لقب "مدينة التعايش". أصبحت حدائق البهائية المدرجة، وهي موقع للتراث العالمي لليونسكو، رمزًا للمدينة، وتجذب الزوار من جميع أنحاء العالم.'
      },
      nazareth: {
        id: 'nazareth',
        name: locale === 'en' ? 'Nazareth' : 'الناصرة',
        region: 'Israel',
        image: '/nazareth.jpg',
        gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
        description: locale === 'en'
          ? 'Nazareth is a historic city in northern Israel and is one of the most important Christian pilgrimage sites in the Holy Land. Known as the childhood home of Jesus, Nazareth boasts numerous churches and historical sites related to biblical events. Today, it is the largest Arab city in Israel, offering a rich tapestry of cultures, bustling markets, and authentic Middle Eastern cuisine.'
          : 'الناصرة هي مدينة تاريخية في شمال إسرائيل وهي واحدة من أهم مواقع الحج المسيحي في الأرض المقدسة. المعروفة بأنها موطن طفولة يسوع، تضم الناصرة العديد من الكنائس والمواقع التاريخية المرتبطة بالأحداث الكتابية. اليوم، هي أكبر مدينة عربية في إسرائيل، وتقدم نسيجًا غنيًا من الثقافات والأسواق النابضة بالحياة والمأكولات الأصيلة للشرق الأوسط.',
        highlights: locale === 'en' 
          ? ['Basilica of the Annunciation', 'Church of St. Joseph', 'Mary\'s Well', 'Nazareth Village', 'Synagogue Church', 'Nazareth Market', 'Mount of Precipitation']
          : ['كنيسة البشارة', 'كنيسة القديس يوسف', 'بئر مريم', 'قرية الناصرة', 'كنيسة المجمع', 'سوق الناصرة', 'جبل القفزة'],
        bestTimeToVisit: locale === 'en' ? 'Spring (March to May) and Fall (September to November) when the weather is mild and pilgrimage sites are less crowded. Christmas season is magical but very busy.' : 'الربيع (مارس إلى مايو) والخريف (سبتمبر إلى نوفمبر) عندما يكون الطقس معتدلًا ومواقع الحج أقل ازدحامًا. موسم عيد الميلاد سحري ولكنه مزدحم جدًا.',
        historicalContext: locale === 'en'
          ? 'Nazareth\'s history dates back to the Bronze Age, though it was a small agricultural village until the Byzantine period. The city gained prominence in Christianity as the place where the angel Gabriel announced to Mary that she would bear Jesus, and where Jesus spent his childhood and youth. During the Crusader period (11th-13th centuries), Nazareth became an important Christian center with numerous churches built. Under Ottoman rule, the city remained predominantly Christian. In the 20th century, Nazareth experienced significant growth and development, particularly after the establishment of Israel in 1948. Today, it is a vibrant city with a rich religious heritage, where Christian and Muslim communities coexist, making it a unique cultural and spiritual destination in the Holy Land.'
          : 'يعود تاريخ الناصرة إلى العصر البرونزي، على الرغم من أنها كانت قرية زراعية صغيرة حتى الفترة البيزنطية. اكتسبت المدينة أهمية في المسيحية كمكان أعلن فيه الملاك جبرائيل لمريم أنها ستلد يسوع، وحيث قضى يسوع طفولته وشبابه. خلال فترة الصليبيين (القرنين 11-13)، أصبحت الناصرة مركزًا مسيحيًا مهمًا مع بناء العديد من الكنائس. تحت الحكم العثماني، ظلت المدينة في الغالب مسيحية. في القرن العشرين، شهدت الناصرة نموًا وتطورًا كبيرين، خاصة بعد إنشاء إسرائيل عام 1948. اليوم، هي مدينة نابضة بالحياة ذات تراث ديني غني، حيث تتعايش المجتمعات المسيحية والإسلامية، مما يجعلها وجهة ثقافية وروحية فريدة في الأرض المقدسة.'
      },
      bethlehem: {
        id: 'bethlehem',
        name: locale === 'en' ? 'Bethlehem' : 'بيت لحم',
        region: 'West Bank, Palestine',
        image: '/bethlehem.jpg',
        gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
        description: locale === 'en'
          ? 'Bethlehem is a Palestinian city located in the central West Bank, about 10 kilometers south of Jerusalem. Revered as the birthplace of Jesus Christ, Bethlehem is a major Christian pilgrimage destination, particularly during Christmas celebrations. The city blends rich historical heritage with contemporary Palestinian culture, offering visitors a unique glimpse into both ancient traditions and modern Middle Eastern life.'
          : 'بيت لحم هي مدينة فلسطينية تقع في وسط الضفة الغربية، على بعد حوالي 10 كيلومترات جنوب القدس. تبجل كمكان ولادة يسوع المسيح، بيت لحم هي وجهة حج مسيحية رئيسية، خاصة خلال احتفالات عيد الميلاد. تمزج المدينة بين التراث التاريخي الغني والثقافة الفلسطينية المعاصرة، مما يوفر للزوار لمحة فريدة عن التقاليد القديمة والحياة الشرق أوسطية الحديثة.',
        highlights: locale === 'en' 
          ? ['Church of the Nativity', 'Manger Square', 'Milk Grotto', 'Shepherd\'s Field', 'Star Street', 'Rachel\'s Tomb', 'Palestinian Heritage Center']
          : ['كنيسة المهد', 'ساحة المهد', 'مغارة الحليب', 'حقل الرعاة', 'شارع النجمة', 'قبر راحيل', 'مركز التراث الفلسطيني'],
        bestTimeToVisit: locale === 'en' ? 'Late spring (April-May) and autumn (September-October) for pleasant weather. Christmas season (December) is special but extremely crowded. Consider visiting in January when decorations are still up but crowds have dispersed.' : 'أواخر الربيع (أبريل-مايو) والخريف (سبتمبر-أكتوبر) للطقس اللطيف. موسم عيد الميلاد (ديسمبر) مميز ولكنه مزدحم للغاية. فكر في الزيارة في يناير عندما تكون الزينة لا تزال موجودة ولكن الحشود قد تفرقت.',
        historicalContext: locale === 'en'
          ? 'Bethlehem\'s history spans over 3,200 years, with the first mention dating to the 14th century BCE. The city gained its profound significance in Christianity as the birthplace of Jesus Christ, as recorded in the Gospels. During the Byzantine period, Emperor Constantine built the original Church of the Nativity in 339 CE over the cave traditionally believed to be Jesus\' birthplace. This church, rebuilt by Emperor Justinian in the 6th century, is one of the oldest continuously operating churches in the world. Through centuries, Bethlehem changed hands among various empires, including Byzantine, Islamic, Crusader, Mamluk, Ottoman, British, Jordanian, and finally coming under Palestinian Authority control in 1995. Today, while maintaining its religious significance, Bethlehem faces modern challenges including the separation barrier built by Israel, which has impacted tourism and local economy. Despite this, the city remains resilient, balancing its role as a global pilgrimage site with the everyday life of its diverse population.'
          : 'يمتد تاريخ بيت لحم لأكثر من 3,200 عام، مع أول ذكر لها يعود إلى القرن الرابع عشر قبل الميلاد. اكتسبت المدينة أهميتها العميقة في المسيحية كمكان ولادة يسوع المسيح، كما هو مسجل في الأناجيل. خلال الفترة البيزنطية، بنى الإمبراطور قسطنطين كنيسة المهد الأصلية في عام 339 ميلادي فوق الكهف الذي يعتقد تقليديًا أنه مكان ولادة يسوع. هذه الكنيسة، التي أعاد بناءها الإمبراطور جستنيان في القرن السادس، هي واحدة من أقدم الكنائس العاملة باستمرار في العالم. عبر القرون، تغيرت بيت لحم بين مختلف الإمبراطوريات، بما في ذلك البيزنطية والإسلامية والصليبية والمملوكية والعثمانية والبريطانية والأردنية، وأخيرًا أصبحت تحت سيطرة السلطة الفلسطينية في عام 1995. اليوم، مع الحفاظ على أهميتها الدينية، تواجه بيت لحم تحديات حديثة بما في ذلك حاجز الفصل الذي بنته إسرائيل، والذي أثر على السياحة والاقتصاد المحلي. رغم ذلك، ظلت المدينة صامدة، موازنة دورها كموقع حج عالمي مع الحياة اليومية لسكانها المتنوعين.'
      },
      'tel-aviv': {
        id: 'tel-aviv',
        name: locale === 'en' ? 'Tel Aviv' : 'تل أبيب',
        region: 'Israel',
        image: '/tel-aviv.jpg',
        gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
        description: locale === 'en'
          ? 'Tel Aviv is a vibrant coastal city on the Mediterranean Sea, known for its stunning beaches, world-class culinary scene, and dynamic nightlife. Often called "The City That Never Sleeps," Tel Aviv is Israel\'s cultural and commercial heart, renowned for its Bauhaus architecture, innovative tech startups, and liberal atmosphere. The city offers a perfect blend of relaxed beach life, rich history, and contemporary urban experiences.'
          : 'تل أبيب هي مدينة ساحلية نابضة بالحياة على البحر الأبيض المتوسط، تشتهر بشواطئها الخلابة ومشهدها الطهي العالمي والحياة الليلية الديناميكية. غالبًا ما تسمى "المدينة التي لا تنام"، تل أبيب هي قلب إسرائيل الثقافي والتجاري، المعروفة بعمارة الباوهاوس والشركات التكنولوجية الناشئة المبتكرة والأجواء الليبرالية. توفر المدينة مزيجًا مثاليًا من حياة الشاطئ المريحة والتاريخ الغني والتجارب الحضرية المعاصرة.',
        highlights: locale === 'en' 
          ? ['Tel Aviv Beaches', 'Rothschild Boulevard', 'Carmel Market', 'Old Jaffa', 'Bauhaus Architecture', 'Tel Aviv Museum of Art', 'Neve Tzedek Neighborhood', 'Dizengoff Street']
          : ['شواطئ تل أبيب', 'شارع روتشيلد', 'سوق الكرمل', 'يافا القديمة', 'عمارة الباوهاوس', 'متحف تل أبيب للفنون', 'حي نيفي تزيديك', 'شارع ديزنجوف'],
        bestTimeToVisit: locale === 'en' ? 'Spring (April to June) and fall (September to November) offer the most pleasant weather. Summer (June to August) is hot but perfect for beach activities, while winter (December to March) can be mild with occasional rainfall.' : 'يقدم الربيع (أبريل إلى يونيو) والخريف (سبتمبر إلى نوفمبر) أكثر الطقس لطفًا. الصيف (يونيو إلى أغسطس) حار ولكنه مثالي لأنشطة الشاطئ، بينما يمكن أن يكون الشتاء (ديسمبر إلى مارس) معتدلًا مع هطول أمطار متفرقة.',
        historicalContext: locale === 'en'
          ? 'Tel Aviv is a relatively young city, founded in 1909 as a suburb of the ancient port city of Jaffa. The city was established by 66 Jewish families who held a lottery on the sand dunes to distribute plots of land, forming a neighborhood they called Ahuzat Bayit, which later became Tel Aviv. The name "Tel Aviv" combines "tel" (an archaeological site of ancient ruins) with "aviv" (spring), symbolizing the renewal of ancient Jewish settlement. In the 1930s, German Jewish architects who fled Nazi persecution brought Bauhaus-style architecture to the city, creating what is now known as the "White City" - a UNESCO World Heritage site with over 4,000 Bauhaus buildings. After Israel\'s independence in 1948, Tel Aviv grew rapidly, absorbing immigrants from around the world. In 1950, Tel Aviv merged with Jaffa to become Tel Aviv-Yafo. Today, it represents Israel\'s economic and technological hub, hosting numerous startups and earning the nickname "Silicon Wadi." Despite its modern character, Tel Aviv preserves its historical roots while embracing innovation and diversity.'
          : 'تل أبيب هي مدينة شابة نسبيًا، تأسست في عام 1909 كضاحية لمدينة ميناء يافا القديمة. أسست المدينة 66 عائلة يهودية أجرت قرعة على الكثبان الرملية لتوزيع قطع الأراضي، مشكلة حيًا أطلقوا عليه اسم "أحوزات بايت"، الذي أصبح فيما بعد تل أبيب. يجمع اسم "تل أبيب" بين "تل" (موقع أثري للآثار القديمة) و"أبيب" (الربيع)، مما يرمز إلى تجديد المستوطنة اليهودية القديمة. في الثلاثينيات، جلب المهندسون المعماريون اليهود الألمان الذين فروا من الاضطهاد النازي عمارة الباوهاوس إلى المدينة، مما أنشأ ما يعرف الآن باسم "المدينة البيضاء" - موقع للتراث العالمي لليونسكو يضم أكثر من 4000 مبنى على طراز الباوهاوس. بعد استقلال إسرائيل في عام 1948، نمت تل أبيب بسرعة، واستوعبت مهاجرين من جميع أنحاء العالم. في عام 1950، اندمجت تل أبيب مع يافا لتصبح تل أبيب-يافا. اليوم، تمثل المدينة مركز إسرائيل الاقتصادي والتكنولوجي، حيث تستضيف العديد من الشركات الناشئة وتكتسب لقب "وادي السيليكون". على الرغم من طابعها الحديث، تحافظ تل أبيب على جذورها التاريخية مع احتضان الابتكار والتنوع.'
      },
      'dead-sea': {
        id: 'dead-sea',
        name: locale === 'en' ? 'Dead Sea' : 'البحر الميت',
        region: 'Israel/Jordan Border',
        image: '/dead-sea.jpg',
        gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
        description: locale === 'en'
          ? 'The Dead Sea is a salt lake bordered by Jordan to the east and Israel to the west. At 430.5 meters (1,412 ft) below sea level, its shores are the lowest point on Earth on dry land. The Dead Sea is 9.6 times saltier than the ocean, making it one of the world\'s saltiest bodies of water and creating the famous natural phenomenon where people can float effortlessly. The mineral-rich mud and water have made it a renowned destination for health and wellness treatments.'
          : 'البحر الميت هو بحيرة ملحية يحدها الأردن من الشرق وإسرائيل والضفة الغربية من الغرب. على عمق 430.5 متر (1,412 قدم) تحت مستوى سطح البحر، شواطئه هي أدنى نقطة على الأرض على اليابسة. البحر الميت أكثر ملوحة من المحيط بـ 9.6 مرة، مما يجعله أحد أكثر المسطحات المائية ملوحة في العالم ويخلق الظاهرة الطبيعية الشهيرة حيث يمكن للناس الطفو بسهولة. الطين والمياه الغنية بالمعادن جعلته وجهة مشهورة لعلاجات الصحة والعافية.',
        highlights: locale === 'en' 
          ? ['Floating Experience', 'Mineral-Rich Mud Treatments', 'Ein Gedi Nature Reserve', 'Masada National Park', 'Ein Bokek Beach', 'Qumran Caves', 'Therapeutic Spas']
          : ['تجربة الطفو', 'علاجات الطين الغني بالمعادن', 'محمية عين جدي الطبيعية', 'متنزه مسادا الوطني', 'شاطئ عين بوكيك', 'كهوف قمران', 'المنتجعات العلاجية'],
        bestTimeToVisit: locale === 'en' ? 'Fall (September to November) and spring (March to May) offer pleasant temperatures. Summer (June to August) can be extremely hot, though water activities provide relief. Winter (December to February) is mild and less crowded.' : 'الخريف (سبتمبر إلى نوفمبر) والربيع (مارس إلى مايو) يقدمان درجات حرارة لطيفة. يمكن أن يكون الصيف (يونيو إلى أغسطس) حارًا للغاية، على الرغم من أن أنشطة المياه توفر الراحة. الشتاء (ديسمبر إلى فبراير) معتدل وأقل ازدحامًا.',
        historicalContext: locale === 'en'
          ? 'The Dead Sea has a rich history stretching back thousands of years. In biblical times, it was known as the "Salt Sea" and the "Sea of Arabah," and was mentioned in relation to Abraham and the cities of Sodom and Gomorrah. King David reportedly found refuge in the area, and King Herod the Great established one of the world\'s first health resorts at Masada near its shores. The unique properties of the Dead Sea have been recognized since ancient times, with Egyptian Queen Cleopatra allegedly establishing cosmetic factories along its shores. In the Byzantine period, the area became an important source of agricultural products. The Dead Sea Scrolls, discovered in nearby Qumran between 1947 and 1956, represent one of the most significant archaeological finds of the 20th century, containing some of the oldest known biblical texts. In modern times, the Dead Sea faces environmental challenges, as its water level has been dropping by about a meter per year due to water diversion from the Jordan River and mineral extraction operations. Today, efforts are underway to preserve this natural wonder, including potential water transfer projects from the Red Sea.'
          : 'البحر الميت له تاريخ غني يمتد لآلاف السنين. في الأزمنة التوراتية، كان يُعرف باسم "بحر الملح" و"بحر العربة"، وتمت الإشارة إليه فيما يتعلق بإبراهيم ومدينتي سدوم وعمورة. يُقال إن الملك داود وجد ملاذًا في المنطقة، وأنشأ الملك هيرودس العظيم أحد أوائل المنتجعات الصحية في العالم في مسادا بالقرب من شواطئه. تم الاعتراف بالخصائص الفريدة للبحر الميت منذ العصور القديمة، حيث يُزعم أن ملكة مصر كليوباترا أسست مصانع مستحضرات التجميل على طول شواطئه. في الفترة البيزنطية، أصبحت المنطقة مصدرًا مهمًا للمنتجات الزراعية. تمثل مخطوطات البحر الميت، التي اكتُشفت في قمران القريبة بين عامي 1947 و1956، أحد أهم الاكتشافات الأثرية في القرن العشرين، حيث تحتوي على بعض أقدم النصوص التوراتية المعروفة. في العصر الحديث، يواجه البحر الميت تحديات بيئية، حيث ينخفض مستوى المياه فيه بمعدل متر واحد تقريبًا سنويًا بسبب تحويل المياه من نهر الأردن وعمليات استخراج المعادن. اليوم، تجري جهود للحفاظ على هذه الأعجوبة الطبيعية، بما في ذلك مشاريع نقل المياه المحتملة من البحر الأحمر.'
      },
      'sea-of-galilee': {
        id: 'sea-of-galilee',
        name: locale === 'en' ? 'Sea of Galilee' : 'بحر الجليل',
        region: 'Northern Israel',
        image: '/sea-of-galilee.jpg',
        gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
        description: locale === 'en'
          ? 'The Sea of Galilee, also known as Lake Tiberias or Kinneret, is Israel\'s largest freshwater lake and the lowest freshwater lake on Earth. Located in the northeast of Israel, this heart-shaped lake holds tremendous religious significance as the site where many of Jesus\' miracles are believed to have occurred. Today, the Sea of Galilee serves as Israel\'s primary water reservoir while offering visitors peaceful shores, historic sites, thermal hot springs, and various water activities.'
          : 'بحر الجليل، المعروف أيضًا باسم بحيرة طبريا أو كينيريت، هو أكبر بحيرة للمياه العذبة في إسرائيل وأدنى بحيرة للمياه العذبة على وجه الأرض. تقع في شمال شرق إسرائيل، وتحمل هذه البحيرة على شكل قلب أهمية دينية هائلة باعتبارها الموقع الذي يُعتقد أن العديد من معجزات يسوع قد حدثت فيه. اليوم، يعمل بحر الجليل كخزان المياه الرئيسي لإسرائيل بينما يقدم للزوار شواطئ هادئة ومواقع تاريخية وينابيع حارة وأنشطة مائية متنوعة.',
        highlights: locale === 'en' 
          ? ['Capernaum - Jesus\' Town', 'Mount of Beatitudes', 'Tabgha', 'Yardenit Baptismal Site', 'Tiberias Hot Springs', 'Sea of Galilee Boat (Jesus Boat)', 'Kursi National Park', 'Arbel Nature Reserve']
          : ['كفرناحوم - مدينة يسوع', 'جبل التطويبات', 'طبغة', 'موقع المعمودية ياردينيت', 'ينابيع طبريا الحارة', 'قارب بحر الجليل (قارب يسوع)', 'متنزه كورسي الوطني', 'محمية أربيل الطبيعية'],
        bestTimeToVisit: locale === 'en' ? 'Spring (March to May) and Fall (September to November) offer mild temperatures and fewer crowds. Summer (June to August) is popular for water activities but can be quite hot, while winter (December to February) brings occasional rain but lush green landscapes.' : 'يقدم الربيع (مارس إلى مايو) والخريف (سبتمبر إلى نوفمبر) درجات حرارة معتدلة وحشود أقل. الصيف (يونيو إلى أغسطس) شائع للأنشطة المائية ولكن يمكن أن يكون حارًا جدًا، بينما يجلب الشتاء (ديسمبر إلى فبراير) أمطارًا متفرقة ولكن مناظر طبيعية خضراء خصبة.',
        historicalContext: locale === 'en'
          ? 'The Sea of Galilee has been a vital resource and cultural centerpoint for thousands of years. In biblical times, it was a thriving fishing center and the backdrop for many New Testament stories, including Jesus walking on water, calming the storm, and the miracle of the loaves and fishes. The lake\'s shores witnessed the calling of several disciples who were fishermen and many of Jesus\' teachings. During the Roman period, the city of Tiberias was established on its western shore and became an important Jewish center after the fall of Jerusalem in 70 CE. The region has passed through Byzantine, Arab, Crusader, Mamluk, and Ottoman rule. In the 20th century, the lake became a crucial water source for the modern state of Israel through the National Water Carrier project. Archaeological discoveries continue to illuminate its rich history, including the 1986 finding of a 2,000-year-old fishing boat (the "Jesus Boat") preserved in the lake\'s mud. Today, while maintaining its historical and religious significance, the Sea of Galilee faces environmental challenges, including fluctuating water levels due to climate change and water extraction.'
          : 'كان بحر الجليل موردًا حيويًا ومركزًا ثقافيًا لآلاف السنين. في الأزمنة التوراتية، كان مركزًا مزدهرًا لصيد الأسماك وخلفية للعديد من قصص العهد الجديد، بما في ذلك مشي يسوع على الماء، وتهدئة العاصفة، ومعجزة الأرغفة والسمك. شهدت شواطئ البحيرة دعوة العديد من التلاميذ الذين كانوا صيادين والعديد من تعاليم يسوع. خلال الفترة الرومانية، تأسست مدينة طبريا على شاطئها الغربي وأصبحت مركزًا يهوديًا مهمًا بعد سقوط القدس عام 70 م. مرت المنطقة بحكم بيزنطي وعربي وصليبي ومملوكي وعثماني. في القرن العشرين، أصبحت البحيرة مصدرًا حيويًا للمياه لدولة إسرائيل الحديثة من خلال مشروع ناقل المياه الوطني. تواصل الاكتشافات الأثرية إلقاء الضوء على تاريخها الغني، بما في ذلك اكتشاف قارب صيد عمره 2000 عام (قارب يسوع) في عام 1986 محفوظًا في طين البحيرة. اليوم، مع الحفاظ على أهميتها التاريخية والدينية، يواجه بحر الجليل تحديات بيئية، بما في ذلك تقلب مستويات المياه بسبب تغير المناخ واستخراج المياه.'
      },
      'masada': {
        id: 'masada',
        name: locale === 'en' ? 'Masada' : 'مسادا',
        region: 'Judean Desert, Israel',
        image: '/masada.jpg',
        gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
        description: locale === 'en'
          ? 'Masada is an ancient fortification perched atop an isolated rock plateau overlooking the Dead Sea. This UNESCO World Heritage site is famous for its dramatic story of resistance and the well-preserved ruins of King Herod\'s palace complex. Standing 400 meters above the Dead Sea, Masada offers breathtaking panoramic views of the Judean Desert and serves as a powerful symbol of Jewish determination and heroism.'
          : 'مسادا هي حصن قديم يجثم على هضبة صخرية معزولة تطل على البحر الميت. موقع التراث العالمي لليونسكو هذا مشهور بقصته الدرامية عن المقاومة والأنقاض المحفوظة جيدًا لمجمع قصر الملك هيرودس. تقف مسادا على ارتفاع 400 متر فوق البحر الميت، وتوفر إطلالات بانورامية خلابة على صحراء يهودا وتعمل كرمز قوي للعزم والبطولة اليهودية.',
        highlights: locale === 'en' 
          ? ['Northern Palace', 'Western Palace', 'Roman Siege Ramp', 'Byzantine Church', 'Synagogue', 'Bathhouse Complex', 'Storerooms', 'Sunrise Hike via Snake Path']
          : ['القصر الشمالي', 'القصر الغربي', 'منحدر الحصار الروماني', 'الكنيسة البيزنطية', 'المعبد اليهودي', 'مجمع الحمامات', 'غرف التخزين', 'رحلة شروق الشمس عبر مسار الثعبان'],
        bestTimeToVisit: locale === 'en' ? 'Winter months (October to April) are best due to cooler temperatures. If visiting in summer (May to September), come very early in the morning before the intense heat. The sunrise hike is particularly popular for its magical experience.' : 'أشهر الشتاء (أكتوبر إلى أبريل) هي الأفضل بسبب درجات الحرارة الأكثر برودة. إذا كنت تزور في الصيف (مايو إلى سبتمبر)، فتعال مبكرًا جدًا في الصباح قبل الحرارة الشديدة. رحلة شروق الشمس شائعة بشكل خاص لتجربتها السحرية.',
        historicalContext: locale === 'en'
          ? 'Masada\'s history is dramatic and layered, beginning around 30 BCE when King Herod the Great built a magnificent palace complex on the plateau as a refuge against potential uprisings. Following the Roman siege of Jerusalem and destruction of the Second Temple in 70 CE, a group of Jewish rebels known as the Sicarii fled to Masada and occupied it. According to the firsthand account of historian Flavius Josephus, when the Romans finally breached the walls in 73 CE after a lengthy siege, they discovered that the 960 inhabitants had chosen mass suicide rather than surrender to Roman enslavement. Archaeologists have uncovered extensive ruins from both the Herodian period and the rebel occupation, including palaces, storehouses, bathhouses, and a synagogue. After the Jewish revolt, Masada was occupied by Byzantine monks who built a church in the 5th-6th centuries CE. The site was abandoned and forgotten until rediscovered in 1842. In modern times, Masada has become a powerful symbol of Jewish resistance and national identity. Israeli soldiers once took their oath at the site with the declaration "Masada shall not fall again." Today, it is one of Israel\'s most popular tourist destinations and archaeological sites, symbolizing the determination to survive against overwhelming odds.'
          : 'تاريخ مسادا درامي ومتعدد الطبقات، بدأ حوالي عام 30 قبل الميلاد عندما بنى الملك هيرودس العظيم مجمع قصر رائع على الهضبة كملاذ ضد الانتفاضات المحتملة. بعد الحصار الروماني للقدس وتدمير الهيكل الثاني في عام 70 م، فرت مجموعة من المتمردين اليهود المعروفين باسم السيكاري إلى مسادا واحتلتها. وفقًا للرواية المباشرة للمؤرخ فلافيوس جوزيفوس، عندما اخترق الرومان أخيرًا الجدران في عام 73 م بعد حصار طويل، اكتشفوا أن الـ 960 من السكان قد اختاروا الانتحار الجماعي بدلاً من الاستسلام للاستعباد الروماني. كشف علماء الآثار عن أنقاض واسعة من كل من الفترة الهيرودية واحتلال المتمردين، بما في ذلك القصور والمخازن والحمامات والمعبد اليهودي. بعد التمرد اليهودي، احتل مسادا رهبان بيزنطيون بنوا كنيسة في القرنين الخامس والسادس الميلاديين. تم هجر الموقع ونسيانه حتى أعيد اكتشافه في عام 1842. في العصر الحديث، أصبحت مسادا رمزًا قويًا للمقاومة اليهودية والهوية الوطنية. اعتاد الجنود الإسرائيليون أداء قسمهم في الموقع بإعلان "لن تسقط مسادا مرة أخرى". اليوم، هي واحدة من أكثر الوجهات السياحية والمواقع الأثرية شعبية في إسرائيل، وترمز إلى التصميم على البقاء على قيد الحياة ضد الصعاب الهائلة.'
      },
      // This is just a template example
    };
    
    // Return data for the requested location or a default template
    return locations[id] || {
      id: id,
      name: id,
      image: '/hero-bg-1.jpg',
      gallery: ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'],
      description: locale === 'en' ? 'Detailed description will be available soon.' : 'سيكون الوصف التفصيلي متاحًا قريبًا.',
      highlights: locale === 'en' ? ['Highlights will be added soon'] : ['سيتم إضافة النقاط البارزة قريبًا'],
      bestTimeToVisit: locale === 'en' ? 'Information coming soon' : 'المعلومات قادمة قريبا',
      historicalContext: locale === 'en' ? 'Historical context will be added soon.' : 'سيتم إضافة السياق التاريخي قريبًا.'
    };
  };
  
  const location = getLocationData();

  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-12">
        {/* Back to Locations Link */}
        <Link 
          href={`/${locale}/locations`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {locale === 'en' ? 'Back to All Locations' : 'العودة إلى جميع المواقع'}
        </Link>
        
        {/* Hero Section */}
        <div className="relative rounded-xl overflow-hidden mb-12">
          <div className="h-[400px] md:h-[500px] relative">
            <Image 
              src={location.image} 
              alt={location.name}
              fill
              sizes='100vw'
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{location.name}</h1>
            </div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Left Column - Main Description */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {locale === 'en' ? 'About' : 'نبذة عن'} {location.name}
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {location.description}
            </p>
            
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {locale === 'en' ? 'Historical Context' : 'السياق التاريخي'}
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {location.historicalContext}
            </p>
            
            {/* Image Gallery */}
            {/* <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {locale === 'en' ? 'Gallery' : 'معرض الصور'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {location.gallery.map((image, index) => (
                <div key={index} className="aspect-video relative rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src={image} 
                    alt={`${location.name} - ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div> */}
          </div>
          
          {/* Right Column - Sidebar Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                {locale === 'en' ? 'Highlights' : 'أبرز المعالم'}
              </h3>
              <ul className="space-y-2 mb-6">
                {location.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="bg-primary-100 text-primary-800 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">{index + 1}</span>
                    {highlight}
                  </li>
                ))}
              </ul>
              
              <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                <CalendarClock className="w-5 h-5 mr-2 text-primary-600" />
                {locale === 'en' ? 'Best Time to Visit' : 'أفضل وقت للزيارة'}
              </h3>
              <p className="text-gray-700 mb-6">
                {location.bestTimeToVisit}
              </p>
              
              {/* Call to Action */}
              <div className="bg-primary-600 rounded-lg p-6 shadow-md text-black">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  {locale === 'en' ? 'Explore Tours in' : 'استكشف الجولات في'} {location.name}
                </h3>
                <p className="mb-4 text-black text-opacity-90">
                  {locale === 'en' 
                    ? 'Find guided tours with expert local guides.'
                    : 'ابحث عن جولات بصحبة مرشدين محليين خبراء.'}
                </p>
                <Link 
                  href={`/${locale}/tours?location=${location.id}`}
                  className="block w-full py-3 bg-white text-primary-700 text-center font-medium rounded-lg hover:bg-primary-50 transition-colors"
                >
                  {locale === 'en' ? 'View Available Tours' : 'عرض الجولات المتاحة'}
                </Link>
              </div>
            </div>
            
            {/* Map */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                <Map className="w-5 h-5 mr-2 text-primary-600" />
                {locale === 'en' ? 'Location' : 'الموقع'}
              </h3>
              <div className="aspect-square rounded-lg overflow-hidden">
                {/* Replace Google Maps with Leaflet map */}
                <MapWrapper 
                  locationName={location.name}
                  region={location.region || 'Israel'}
                  coordinates={location.coordinates || getDefaultCoordinates(location.id)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 