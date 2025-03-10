import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';
import { Check, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'About Us | Tourminded',
  description: 'Learn about Tourminded - the only travel agency in the Holy Land that matches you with a perfect fit guide for your journey.',
};

export default async function AboutPage({ params }) {
  // Ensure params.locale is properly handled
  const localeParams = await params;
  const locale = await localeParams?.locale || 'en';
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Tour types data
  const tourTypes = [
    { id: 'christian', name: locale === 'en' ? 'Christian pilgrimages' : 'الحج المسيحي' },
    { id: 'jewish', name: locale === 'en' ? 'Jewish Tours' : 'جولات يهودية' },
    { id: 'muslim', name: locale === 'en' ? 'Muslim Tours' : 'جولات إسلامية' },
    { id: 'political', name: locale === 'en' ? 'Political Tours' : 'جولات سياسية' },
    { id: 'historical', name: locale === 'en' ? 'Historical Tours' : 'جولات تاريخية' },
    { id: 'cultural', name: locale === 'en' ? 'Cultural Tours' : 'جولات ثقافية' },
    { id: 'food', name: locale === 'en' ? 'Food Tours' : 'جولات طعام' },
    { id: 'all-inclusive', name: locale === 'en' ? 'All-Inclusive Tour' : 'جولة شاملة' },
  ];
  
  // Comparison table data
  const comparisonFeatures = [
    { id: 'licensed', name: locale === 'en' ? 'Licensed guides' : 'مرشدين مرخصين' },
    { id: 'customizable', name: locale === 'en' ? 'Private, customizable tours' : 'جولات خاصة قابلة للتخصيص' },
    { id: 'expertise', name: locale === 'en' ? 'Choose guide based on expertise' : 'اختيار المرشد بناءً على الخبرة' },
    { id: 'language', name: locale === 'en' ? 'Verified language proficiency' : 'إتقان اللغة المثبت' },
    { id: 'reviews', name: locale === 'en' ? 'Trusted reviews of the guide' : 'مراجعات موثوقة للمرشد' },
    { id: 'price', name: locale === 'en' ? 'Price' : 'السعر', tourminded: '$', others: '$$$' },
  ];
  
  return (
    <MainLayout locale={locale} user={user}>
      {/* Hero Section */}
      <div className="bg-primary-900 text-black py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {locale === 'en' ? 'About Tourminded' : 'عن توورمايندد'}
            </h1>
            <p className="text-xl md:text-2xl">
              {locale === 'en' 
                ? 'Seamless, fun-filled tours with local experts' 
                : 'جولات سلسة ومليئة بالمرح مع خبراء محليين'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Introduction Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-secondary-700 mb-12 text-center">
            {locale === 'en'
              ? 'You&rsquo;ll be matched with a personable guide who perfectly aligns with your passions and needs, so your trip to the Holy Land is everything you hoped for and more.'
              : 'سيتم مطابقتك مع مرشد ودود يتوافق تمامًا مع شغفك واحتياجاتك، حتى تكون رحلتك إلى الأرض المقدسة كل ما تمنيته وأكثر.'}
          </p>
          
          {/* Testimonials */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-16">
            <div className="relative h-64 md:h-80">
              <Image
                src="/tour-image-1.jpg"
                alt="Tour Image"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 md:p-8 bg-white">
              <div className="space-y-4">
                <blockquote className="text-lg md:text-xl italic text-secondary-700">
                  &ldquo;It was an amazing day and I learned so much.&rdquo;
                </blockquote>
                <blockquote className="text-lg md:text-xl italic text-secondary-700">
                  &ldquo;Ariel was an absolute joy on our tour and made the experience so smooth and wonderful.&rdquo;
                </blockquote>
                <blockquote className="text-lg md:text-xl italic text-secondary-700">
                  &ldquo;Ariel was an absolute joy on our tour and made the experience so smooth and wonderful.&rdquo;
                </blockquote>
                <blockquote className="text-lg md:text-xl italic text-secondary-700">
                  &ldquo;Ariel was an absolute joy on our tour and made the experience so smooth and wonderful.&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Why We Exist Section */}
      <div className="bg-secondary-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-secondary-900">
              {locale === 'en' ? 'Why we exist' : 'لماذا نحن موجودون'}
            </h2>
            
            <div className="bg-white rounded-lg shadow-md p-8 mb-12">
              <h3 className="text-2xl font-bold mb-4 text-secondary-900">
                {locale === 'en' ? 'Avoid unpleasant surprises on your vacation' : 'تجنب المفاجآت غير السارة في عطلتك'}
              </h3>
              <p className="text-secondary-700 mb-4">
                {locale === 'en'
                  ? 'Tickets have been booked for months. Bags are packed. Finally, the big day is here. It&rsquo;s time for your vacation.'
                  : 'تم حجز التذاكر منذ أشهر. الحقائب جاهزة. أخيرًا، اليوم الكبير هنا. حان وقت عطلتك.'}
              </p>
              <p className="text-secondary-700 mb-4">
                {locale === 'en'
                  ? 'But when you arrive after a long, exhausting flight, things aren&rsquo;t as you expected.'
                  : 'ولكن عندما تصل بعد رحلة طويلة ومرهقة، الأمور ليست كما توقعت.'}
              </p>
              <p className="text-secondary-700 mb-4">
                {locale === 'en'
                  ? 'Whether it&rsquo;s subpar accommodation, transportation hiccups, or a guide who can&rsquo;t answer your questions or you can&rsquo;t communicate with.'
                  : 'سواء كان ذلك إقامة دون المستوى، أو مشاكل في النقل، أو مرشد لا يستطيع الإجابة على أسئلتك أو لا يمكنك التواصل معه.'}
              </p>
              <p className="text-secondary-700 mb-4">
                {locale === 'en'
                  ? 'We know there&rsquo;s nothing worse than arriving at your long-awaited (and expensive) trip and finding yourself in this situation.'
                  : 'نعلم أنه لا يوجد شيء أسوأ من الوصول إلى رحلتك التي طال انتظارها (والمكلفة) ووجود نفسك في هذا الموقف.'}
              </p>
              <p className="text-secondary-700 font-medium">
                {locale === 'en'
                  ? 'And that&rsquo;s exactly why we&rsquo;re here.'
                  : 'وهذا بالضبط هو سبب وجودنا.'}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8 mb-12">
              <h3 className="text-2xl font-bold mb-4 text-secondary-900">
                {locale === 'en' 
                  ? 'The only travel agency in the Holy Land that matches you with a perfect fit guide' 
                  : 'وكالة السفر الوحيدة في الأرض المقدسة التي تطابقك مع مرشد مناسب تمامًا'}
              </h3>
              <p className="text-secondary-700 mb-6">
                {locale === 'en'
                  ? 'You&rsquo;ll tell us exactly what you&rsquo;re looking for and get a personalized recommendation for private tours fitting your specific needs. Plus, you&rsquo;ll pay significantly less because we match you directly with locals and don&rsquo;t charge a premium. Whether your tour is 1 day or 15, you can expect interesting cultural insights and unforgettable adventures at every turn.'
                  : 'ستخبرنا بالضبط عما تبحث عنه وستحصل على توصية شخصية للجولات الخاصة التي تناسب احتياجاتك المحددة. بالإضافة إلى ذلك، ستدفع أقل بكثير لأننا نطابقك مباشرة مع السكان المحليين ولا نفرض رسومًا إضافية. سواء كانت جولتك ليوم واحد أو 15 يومًا، يمكنك توقع رؤى ثقافية مثيرة للاهتمام ومغامرات لا تُنسى في كل منعطف.'}
              </p>
              <div className="text-center">
                <Button 
                  href={`/${locale}/quiz`}
                  variant="primary"
                  size="lg"
                >
                  {locale === 'en' ? 'I&rsquo;m ready to find my perfect tour' : 'أنا مستعد للعثور على جولتي المثالية'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* See Israel Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="md:w-1/2">
              <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/tour-image-2.jpg"
                  alt="Tour Image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4 text-secondary-900">
                {locale === 'en' ? 'See Israel through the eyes of a local' : 'شاهد إسرائيل من خلال عيون محلية'}
              </h2>
              <p className="text-lg text-secondary-700 mb-6">
                {locale === 'en'
                  ? 'Choose from hundreds of guided tours that will bring this rich land&rsquo;s fascinating heritage to life.'
                  : 'اختر من بين مئات الجولات المصحوبة بمرشدين التي ستحيي التراث الرائع لهذه الأرض الغنية.'}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {tourTypes.map((type) => (
                  <Link 
                    key={type.id}
                    href={`/${locale}/tours?expertise=${type.id}`}
                    className="text-secondary-800 hover:text-primary-600 transition-colors flex items-center"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 text-primary-600" />
                    <span>{type.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comparison Table Section */}
      <div className="bg-secondary-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-secondary-900">
              {locale === 'en' ? 'What makes Tourminded better?' : 'ما الذي يجعل توورمايندد أفضل؟'}
            </h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary-100">
                    <th className="py-4 px-6 text-left text-secondary-900">{locale === 'en' ? 'Feature' : 'الميزة'}</th>
                    <th className="py-4 px-6 text-center text-secondary-900">Tourminded</th>
                    <th className="py-4 px-6 text-center text-secondary-900">{locale === 'en' ? 'Other travel agencies' : 'وكالات السفر الأخرى'}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={feature.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                      <td className="py-4 px-6 text-secondary-800">{feature.name}</td>
                      <td className="py-4 px-6 text-center">
                        {feature.id === 'price' ? (
                          <span className="text-primary-600 font-bold">{feature.tourminded}</span>
                        ) : (
                          <Check className="w-5 h-5 text-primary-600 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {feature.id === 'price' ? (
                          <span className="text-secondary-600">{feature.others}</span>
                        ) : (
                          <span className="text-secondary-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary-900">
            {locale === 'en' ? 'The trip of your dreams is waiting for you' : 'رحلة أحلامك تنتظرك'}
          </h2>
          <p className="text-xl text-secondary-700 mb-8">
            {locale === 'en'
              ? 'Explore our vast selection of Holy Land tours for every traveler and style. Or take our short quiz and get a personalized recommendation sent to your inbox.'
              : 'استكشف مجموعتنا الواسعة من جولات الأرض المقدسة لكل مسافر وأسلوب. أو خذ اختبارنا القصير واحصل على توصية شخصية مرسلة إلى بريدك الإلكتروني.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              href={`/${locale}/tours`}
              variant="primary"
              size="lg"
            >
              {locale === 'en' ? 'Explore tours' : 'استكشف الجولات'}
            </Button>
            <Button 
              href={`/${locale}/quiz`}
              variant="secondary"
              size="lg"
            >
              {locale === 'en' ? 'Start quiz' : 'ابدأ الاختبار'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 