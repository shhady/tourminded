import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    // Connect to database
    await connectDB();
    
    // Sample locations data
    const sampleLocations = [
      {
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
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/architecture-signs.jpg',
            publicId: 'samples/landscapes/architecture-signs'
          }
        ]
      },
      {
        name: {
          en: 'Tel Aviv',
          ar: 'تل أبيب'
        },
        description: {
          en: 'Tel Aviv is a city on Israel\'s Mediterranean coast. It\'s known for its vibrant nightlife, beautiful beaches, and modern architecture. The city is a major economic and technological center.',
          ar: 'تل أبيب هي مدينة على ساحل البحر الأبيض المتوسط في إسرائيل. وهي معروفة بحياتها الليلية النابضة بالحياة وشواطئها الجميلة وهندستها المعمارية الحديثة. المدينة هي مركز اقتصادي وتكنولوجي رئيسي.'
        },
        images: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/beach-boat.jpg',
            publicId: 'samples/landscapes/beach-boat'
          }
        ]
      },
      {
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
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/nature-mountains.jpg',
            publicId: 'samples/landscapes/nature-mountains'
          }
        ]
      },
      {
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
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/nature-mountains.jpg',
            publicId: 'samples/landscapes/nature-mountains'
          }
        ]
      },
      {
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
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/beach-boat.jpg',
            publicId: 'samples/landscapes/beach-boat'
          }
        ]
      },
      {
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
            url: 'https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/architecture-signs.jpg',
            publicId: 'samples/landscapes/architecture-signs'
          }
        ]
      }
    ];
    
    // Check if locations already exist
    const Location = (await import('@/models/Location')).default;
    const existingCount = await Location.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: `${existingCount} locations already exist. No new locations added.`
      });
    }
    
    // Create locations
    const createdLocations = await Location.insertMany(sampleLocations);
    
    return NextResponse.json({
      success: true,
      message: `${createdLocations.length} sample locations created successfully.`,
      data: createdLocations
    });
  } catch (error) {
    console.error('Error creating sample locations:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
} 