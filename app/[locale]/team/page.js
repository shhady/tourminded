import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Mail, Linkedin, Twitter, Globe } from 'lucide-react';

export const metadata = {
  title: 'Our Team | Watermelon Tours',
  description: 'Meet the passionate team behind Watermelon Tours dedicated to connecting travelers with expert local guides',
};

// Team member data
const teamMembers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: {
      en: 'Founder & CEO',
      ar: 'المؤسس والرئيس التنفيذي'
    },
    bio: {
      en: 'Sarah founded Tourminded with a vision to transform how travelers experience the Holy Land. With over 15 years in tourism and a deep passion for cultural exchange, she leads our mission to create meaningful connections.',
      ar: 'أسست سارة Tourminded برؤية لتغيير طريقة تجربة المسافرين للأرض المقدسة. مع أكثر من 15 عامًا في السياحة وشغف عميق بالتبادل الثقافي، تقود مهمتنا لخلق روابط ذات معنى.'
    },
    image: '/images/team/sarah.jpg',
    social: {
      email: 'sarah@tourminded.com',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: 'https://twitter.com/sarahtourminded'
    }
  },
  {
    id: 2,
    name: 'Ahmed Al-Farsi',
    role: {
      en: 'Head of Guide Relations',
      ar: 'رئيس علاقات المرشدين'
    },
    bio: {
      en: 'Ahmed brings extensive experience in building relationships with local guides across the region. His deep understanding of the local culture and tourism landscape helps us create the best experience for both guides and travelers.',
      ar: 'يجلب أحمد خبرة واسعة في بناء علاقات مع المرشدين المحليين في جميع أنحاء المنطقة. يساعدنا فهمه العميق للثقافة المحلية ومشهد السياحة على خلق أفضل تجربة لكل من المرشدين والمسافرين.'
    },
    image: '/images/team/ahmed.jpg',
    social: {
      email: 'ahmed@tourminded.com',
      linkedin: 'https://linkedin.com/in/ahmedalfarsi'
    }
  },
//   {
//     id: 3,
//     name: 'Rachel Cohen',
//     role: {
//       en: 'Chief Technology Officer',
//       ar: 'مدير التكنولوجيا'
//     },
//     bio: {
//       en: 'Rachel leads our technology initiatives, ensuring our platform delivers a seamless experience for users. With a background in both tourism and software development, she bridges the gap between industry needs and technological solutions.',
//       ar: 'تقود راشيل مبادراتنا التكنولوجية، مما يضمن أن منصتنا توفر تجربة سلسة للمستخدمين. مع خلفية في كل من السياحة وتطوير البرمجيات، فهي تسد الفجوة بين احتياجات الصناعة والحلول التكنولوجية.'
//     },
//     image: '/images/team/rachel.jpg',
//     social: {
//       email: 'rachel@tourminded.com',
//       linkedin: 'https://linkedin.com/in/rachelcohen',
//       twitter: 'https://twitter.com/racheltech'
//     }
//   },
//   {
//     id: 4,
//     name: 'David Levy',
//     role: {
//       en: 'Marketing Director',
//       ar: 'مدير التسويق'
//     },
//     bio: {
//       en: 'David oversees our marketing strategies, helping us reach travelers from around the world. His innovative approach to digital marketing and storytelling has been instrumental in growing our community of guides and travelers.',
//       ar: 'يشرف ديفيد على استراتيجيات التسويق لدينا، مما يساعدنا على الوصول إلى المسافرين من جميع أنحاء العالم. كان نهجه المبتكر في التسويق الرقمي ورواية القصص أساسيًا في تنمية مجتمعنا من المرشدين والمسافرين.'
//     },
//     image: '/images/team/david.jpg',
//     social: {
//       email: 'david@tourminded.com',
//       linkedin: 'https://linkedin.com/in/davidlevy',
//       twitter: 'https://twitter.com/davidlevy'
//     }
//   },
  {
    id: 5,
    name: 'Layla Nasser',
    role: {
      en: 'Customer Experience Manager',
      ar: 'مدير تجربة العملاء'
    },
    bio: {
      en: 'Layla ensures that every traveler and guide has an exceptional experience with Watermelon Tours. Her attention to detail and commitment to service excellence has helped us maintain our high standards of customer satisfaction.',
      ar: 'تضمن ليلى أن كل مسافر ومرشد يحظى بتجربة استثنائية مع Watermelon Tours. ساعدها اهتمامها بالتفاصيل والتزامها بالتميز في الخدمة على الحفاظ على معاييرنا العالية لرضا العملاء.'
    },
    image: '/images/team/layla.jpg',
    social: {
      email: 'layla@tourminded.com',
      linkedin: 'https://linkedin.com/in/laylanasser'
    }
  },
//   {
//     id: 6,
//     name: 'Michael Ben-David',
//     role: {
//       en: 'Head of Business Development',
//       ar: 'رئيس تطوير الأعمال'
//     },
//     bio: {
//       en: 'Michael focuses on strategic partnerships and growth opportunities for Tourminded. His extensive network in the tourism industry and business acumen have been key to our expansion across the region.',
//       ar: 'يركز مايكل على الشراكات الاستراتيجية وفرص النمو لـ Tourminded. كانت شبكته الواسعة في صناعة السياحة وفطنته التجارية مفتاحًا لتوسعنا في جميع أنحاء المنطقة.'
//     },
//     image: '/images/team/michael.jpg',
//     social: {
//       email: 'michael@tourminded.com',
//       linkedin: 'https://linkedin.com/in/michaelbendavid',
//       twitter: 'https://twitter.com/michaelbd'
//     }
//   }
];

export default async function TeamPage({ params }) {
  const { locale } = await params;
  
  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {locale === 'en' ? 'Meet Our Team' : 'تعرف على فريقنا'}
            </h1>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {locale === 'en' 
                ? 'We\'re a diverse team of tourism experts, technology enthusiasts, and cultural ambassadors dedicated to transforming how people experience the Holy Land.' 
                : 'نحن فريق متنوع من خبراء السياحة وعشاق التكنولوجيا والسفراء الثقافيين المكرسين لتغيير طريقة تجربة الناس للأرض المقدسة.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64 w-full">
                  <Image 
                    src={member.image} 
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-1">{member.name}</h2>
                  <p className="text-primary-600 font-medium mb-4">
                    {locale === 'en' ? member.role.en : member.role.ar}
                  </p>
                  
                  <p className="text-gray-600 mb-6 line-clamp-4">
                    {locale === 'en' ? member.bio.en : member.bio.ar}
                  </p>
                  
                  <div className="flex space-x-3">
                    {member.social.email && (
                      <a 
                        href={`mailto:${member.social.email}`} 
                        className="text-gray-500 hover:text-primary-600 transition-colors"
                        aria-label={`Email ${member.name}`}
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                    
                    {member.social.linkedin && (
                      <a 
                        href={member.social.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        aria-label={`${member.name}'s LinkedIn profile`}
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    
                    {member.social.twitter && (
                      <a 
                        href={member.social.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-400 transition-colors"
                        aria-label={`${member.name}'s Twitter profile`}
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 bg-primary-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {locale === 'en' ? 'Join Our Team' : 'انضم إلى فريقنا'}
            </h2>
            
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {locale === 'en' 
                ? 'We\'re always looking for passionate individuals to join our mission of connecting travelers with authentic local experiences.' 
                : 'نحن نبحث دائمًا عن أفراد متحمسين للانضمام إلى مهمتنا المتمثلة في ربط المسافرين بتجارب محلية أصيلة.'}
            </p>
{/*             
            <Link 
              href={`/${locale}/careers`}
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {locale === 'en' ? 'View Open Positions' : 'عرض الوظائف المفتوحة'}
            </Link> */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}