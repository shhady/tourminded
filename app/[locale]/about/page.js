import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';
import { Check, ArrowRight, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import ComparisonTable from '@/components/common/ComparisonTable';
import CallToAction from '@/components/common/CallToAction';

export const metadata = {
  title: 'About Watermelon Tours | Connecting Travelers with Local Guides',
  description: 'Learn about Watermelon Tours mission to transform tourism in the Holy Land by connecting travelers with expert local guides',
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
    { id: 'adventure', name: locale === 'en' ? 'Adventure Tours' : 'جولات مغامرة' },
    { id: 'nature', name: locale === 'en' ? 'Nature Tours' : 'جولات طبيعة' },
    { id: 'photography', name: locale === 'en' ? 'Photography Tours' : 'جولات تصوير' },
    { id: 'culinary', name: locale === 'en' ? 'Culinary Tours' : 'جولات طهي' },
    { id: 'all-inclusive', name: locale === 'en' ? 'All-Inclusive Tour' : 'جولة شاملة' },
  ];

  return (
    <MainLayout locale={locale} user={user}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-200 to-primary-400 text-black py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {locale === 'en' ? 'About Watermelon Tours' : 'عن Watermelon Tours'}
            </h1>
            <p className="text-xl opacity-90 mb-8">
              {locale === 'en' 
                ? 'Transforming tourism in the Holy Land through authentic connections' 
                : 'تحويل السياحة في الأرض المقدسة من خلال روابط أصيلة'}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}></div>
      </section>
      
      {/* Why We Exist Section */}
      <section className="py-16 bg-primary-200 text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {locale === 'en' ? 'Why We Exist' : 'لماذا نحن موجودون'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-md p-8 mb-12">
              <h3 className="text-xl font-semibold mb-6 text-center">
                {locale === 'en' ? 'The answer is simple. Travelers deserve the truth.' : 'الإجابة بسيطة. المسافرون يستحقون الحقيقة.'}
              </h3>
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Image */}
                <div className="w-full md:w-1/2 relative h-64 md:h-auto min-h-[300px] rounded-lg overflow-hidden shadow-md order-1 md:order-2">
                  <Image 
                    src="/whyweexist.jpg" 
                    alt={locale === 'en' ? 'Authentic travel experience' : 'تجربة سفر أصيلة'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Text Content Part 1 */}
                <div className="w-full md:w-1/2 space-y-6 text-gray-700 leading-relaxed order-2 md:order-1">
                  <p>
                    {locale === 'en' 
                      ? 'For decades, tourism in Israel and Palestine has been shaped by large agencies. They decide what you see, what you hear, and who leads the experience. Stories are filtered. History turns into a script. And the people with the deepest connection to the land are often pushed aside.' 
                      : 'لعقود من الزمان، تشكلت السياحة في إسرائيل وفلسطين من قبل وكالات كبيرة. هم يقررون ما تراه، وما تسمعه، ومن يقود التجربة. يتم تصفية القصص. يتحول التاريخ إلى نص مكتوب. وغالبًا ما يتم تهميش الأشخاص الذين لديهم أعمق ارتباط بالأرض.'}
                  </p>
                  <p className=" text-primary-700">
                    {locale === 'en' 
                      ? 'I didn’t want to be part of that. So we built Watermelon Tours to do things differently.' 
                      : 'لم أكن أريد أن أكون جزءًا من ذلك. لذلك قمنا ببناء Watermelon Tours للقيام بالأشياء بشكل مختلف.'}
                  </p>
                </div>
              </div>

              {/* Text Content Part 2 */}
              <div className="mt-6 space-y-6 text-gray-700 leading-relaxed">
                  <h3 className="text-xl font-semibold mb-6 text-center">
                  For the first time, locals with full independence lead.
                  </h3>
                  <p>
                    {locale === 'en' 
                      ? ' Here, tours are led by people who call this place home. People who grew up here. Whose families have lived here for generations. Not trained to repeat a script. Not told what they are allowed to say. You’ll hear stories passed down within families, not written by agencies.' 
                      : 'لأول مرة، يقود السكان المحليون باستقلالية تامة. هنا، يتم قيادة الجولات من قبل أشخاص يعتبرون هذا المكان وطنهم. أشخاص نشأوا هنا. عاشت عائلاتهم هنا لأجيال. غير مدربين على تكرار نص مكتوب. لا يُملى عليهم ما يُسمح لهم بقوله. ستسمع قصصًا متوارثة داخل العائلات، وليست مكتوبة من قبل الوكالات.'}
                  </p>
                  <p>
                    {locale === 'en' 
                      ? 'They share what daily life feels like. What the land means to them. And the context you would never hear on a bus tour or read in a brochure.' 
                      : 'يشاركون شعور الحياة اليومية. ماذا تعني الأرض بالنسبة لهم. والسياق الذي لن تسمعه أبدًا في جولة بالحافلة أو تقرأه في كتيب.'}
                  </p>
                  <p>
                    {locale === 'en' 
                      ? 'People come here to walk sacred paths, visit ancient cities, explore history, and understand one of the most complex places in the world. We believe those experiences mean more when they are guided by lived experience.' 
                      : 'يأتي الناس إلى هنا للمشي في مسارات مقدسة، وزيارة المدن القديمة، واستكشاف التاريخ، وفهم أحد أكثر الأماكن تعقيدًا في العالم. نحن نؤمن أن هذه التجارب تعني أكثر عندما يتم توجيهها من خلال التجربة المعاشة.'}
                  </p>
                  <p>
                    {locale === 'en' 
                      ? 'For you as a traveler, this means something simple. You know who your guide is. You pay a fair price. And you experience the land through real human connection.' 
                      : 'بالنسبة لك كمسافر، هذا يعني شيئًا بسيطًا. أنت تعرف من هو مرشدك. تدفع سعرًا عادلاً. وتختبر الأرض من خلال تواصل إنساني حقيقي.'}
                  </p>
                  
                  <div className="bg-primary-50 p-6 rounded-lg border border-primary-100 my-6">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <span className="mr-2">🛡️</span>
                      {locale === 'en' ? 'Your safety matters' : 'سلامتك تهمنا'}
                    </h4>
                    <p className="text-sm">
                      {locale === 'en' 
                        ? 'Our guides move through this land every day. They understand access, conditions, and how quickly things can change. Every experience is planned with care, clear communication, and your well being as the top priority.' 
                        : 'يتحرك مرشدونا عبر هذه الأرض كل يوم. يفهمون إمكانية الوصول، والظروف، ومدى سرعة تغير الأشياء. يتم التخطيط لكل تجربة بعناية، وتواصل واضح، ورفاهيتك كأولوية قصوى.'}
                    </p>
                    <p className="text-sm">
                    {locale === 'en' 
                      ? 'That’s why Watermelon Tours exists. Not to sell a version of a place, but to let you experience it through the people who live it.' 
                      : 'لهذا السبب توجد Watermelon Tours. ليس لبيع نسخة من مكان ما، ولكن لتتيح لك تجربته من خلال الأشخاص الذين يعيشونه.'}
                  </p>
                  </div>
              </div>
              
              <div className="text-center mt-10">
                <Button 
                  href={`/${locale}/quiz`}
                  variant="primary"
                  className="text-white"
                >
                  {locale === 'en' ? 'I am ready to find my perfect tour' : 'أنا مستعد للعثور على جولتي المثالية'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 bg-primary-200 text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {locale === 'en' ? 'Our Story' : 'قصتنا'}
            </h2>
            
            <div className="flex flex-col md:flex-row gap-10 items-center mb-12">
              <div className="md:w-1/2">
                <div className="relative h-80 w-[390px] md:w-full rounded-xl overflow-hidden shadow-lg">
                  <Image 
                    src="https://res.cloudinary.com/shhady/image/upload/v1741752805/tour-image-2_g7gvby.jpg" 
                    alt="Watermelon Tours founders"
                    fill
                    sizes='100vw'
                    className="object-cover"
                  />
                </div>
              </div>
              
              <div className="md:w-1/2">
                <p className="text-gray-700 mb-4">
                  {locale === 'en'
                    ? "The name Watermelon carries a piece of home with it. My father comes from Sakhnin, a town known for its red, sun-grown watermelons, a symbol of summer, land, and togetherness."
                    : "يحمل اسم البطيخ قطعة من الوطن بداخله. والدي من سخنين، بلدة مشهورة بالبطيخ الأحمر المزروع تحت الشمس، رمز الصيف والأرض ولمّة الأحبة."
                  }
                </p>
                <p className="text-gray-700 mb-4">
                  {locale === 'en'
                    ? "For me, watermelon isn’t just a fruit; it’s a memory of the Mediterranean heat, of bringing people together, and of something that feels like home."
                    : "بالنسبة لي، البطيخ ليس مجرد فاكهة، بل هو ذكرى حرّ المتوسط، ولمّة الناس، وإحساس بشيء يشبه الوطن."
                  }
                </p>
                <p className="text-gray-700 mb-4">
                  {locale === 'en'
                    ? "Watermelon Tours was born from that same spirit, sharing the sweetness of our land and stories with travelers from all over the world."
                    : "ولدت Watermelon Tours من تلك الروح نفسها، لنشارك حلاوة أرضنا وقصصنا مع المسافرين من كل بقاع العالم."
                  }
                </p>
                <p className="text-gray-700 mb-4">
                  {locale === 'en'
                    ? "It all started with a simple observation: the Holy Land is filled with incredible stories, but travelers often miss the authentic experiences that make this region so special."
                    : "بدأ كل شيء بملاحظة بسيطة: الأرض المقدسة مليئة بالقصص المذهلة، لكن المسافرين غالبًا ما يفوتون التجارب الأصيلة التي تجعل هذه المنطقة مميزة للغاية."
                  }
                </p>
               
              </div>
            </div>
            <p className="text-gray-700 mb-4">
                  {locale === 'en'
                    ? "Founded in 2023, Watermelon Tours connects travelers directly with licensed local guides who offer personalized, genuine experiences that go beyond the typical tourist routes."
                    : "تأسست Watermelon Tours في عام 2023، وتربط المسافرين مباشرةً بالمرشدين المحليين المرخصين الذين يقدمون تجارب أصيلة وشخصية تتجاوز المسارات السياحية المعتادة."
                  }
                </p>
                <p className="text-gray-700">
                  {locale === 'en'
                    ? "We believe that meaningful travel comes from real human connection, from meeting the people who live the stories, not just hearing about them. Through local expertise and heartfelt encounters, we aim to make every journey as warm, refreshing, and unforgettable as a slice of watermelon on a summer day."
                    : "نؤمن أن السفر الهادف ينبع من التواصل الإنساني الحقيقي، من لقاء أصحاب القصص وليس فقط سماعها. ومن خلال الخبرة المحلية واللقاءات الصادقة، نطمح أن نجعل كل رحلة دافئة، منعشة، ولا تُنسى… تماماً كقطعة بطيخ في يوم صيفي."
                  }
                </p>
          </div>
        </div>
      </section>
      
      {/* Tour Types Section */}
      <section className="py-16 bg-primary-200 text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              {locale === 'en' ? 'See the world through the eyes of a local' : 'شاهد العالم من خلال عيون محلية'}
            </h2>
            <p className="text-lg text-gray-600 text-center mb-10">
              {locale === 'en' 
                ? 'Choose from hundreds of guided tours that will bring the rich land fascinating heritage to life.' 
                : 'اختر من بين مئات الجولات المصحوبة بمرشدين التي ستحيي التراث الرائع لهذه الأرض الغنية.'}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tourTypes.map((type) => (
                <Link 
                  key={type.id}
                  href={`/${locale}/tours?type=${type.id}`}
                  className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow"
                >
                  <span className="text-gray-800 font-medium">{type.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Comparison Table Section */}
      <section className="py-16 bg-primary-200 text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
           
            <ComparisonTable locale={locale} />
          </div>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section className="py-16 bg-primary-200 text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {locale === 'en' ? 'Our Mission' : 'مهمتنا'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-md p-8 mb-12">
              <p className="text-xl text-center text-gray-700 italic mb-6">
                {locale === 'en' 
                  ? '"To transform tourism in the Holy Land by connecting travelers with authentic local experiences, empowering guides, and fostering cultural understanding."' 
                  : '"تحويل السياحة في الأرض المقدسة من خلال ربط المسافرين بتجارب محلية أصيلة، وتمكين المرشدين، وتعزيز التفاهم الثقافي."'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-primary-50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {locale === 'en' ? 'Authentic Experiences' : 'تجارب أصيلة'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {locale === 'en' 
                      ? 'Creating meaningful connections between travelers and local culture' 
                      : 'خلق روابط ذات معنى بين المسافرين والثقافة المحلية'}
                  </p>
                </div>
                
                <div className="bg-primary-50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {locale === 'en' ? 'Guide Empowerment' : 'تمكين المرشدين'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {locale === 'en' 
                      ? 'Supporting local guides to share their expertise and build sustainable careers' 
                      : 'دعم المرشدين المحليين لمشاركة خبراتهم وبناء مهن مستدامة'}
                  </p>
                </div>
                
                <div className="bg-primary-50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {locale === 'en' ? 'Cultural Bridge' : 'جسر ثقافي'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {locale === 'en' 
                      ? 'Fostering understanding and appreciation across diverse cultures' 
                      : 'تعزيز التفاهم والتقدير عبر الثقافات المتنوعة'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Watermelon Tours is the Best Choice Section */}
        <section className="py-16 bg-primary-200 text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">
              {locale === 'en' ? 'Why Watermelon Tours is the best choice for your trip to the Holy Land' : 'لماذا Watermelon Tours هو الخيار الأفضل لرحلتك إلى الأرض المقدسة'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">💰</span>
                  </span>
                  {locale === 'en' ? 'No extra fees' : 'لا رسوم إضافية'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                    ? 'You will pay the lowest possible price. Guaranteed.' 
                    : 'ستدفع أقل سعر ممكن. مضمون.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">✏️</span>
                  </span>
                  {locale === 'en' ? 'Completely customizable' : 'قابل للتخصيص بالكامل'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                    ? 'Down to the finest detail. Even the car you will be picked up in.' 
                    : 'حتى أدق التفاصيل. حتى السيارة التي سيتم اصطحابك فيها.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🎭</span>
                  </span>
                  {locale === 'en' ? 'An unforgettable adventure' : 'مغامرة لا تنسى'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                    ? 'Each tour is personally vetted and designed for maximum fun!' 
                    : 'يتم فحص كل جولة شخصيًا وتصميمها لتحقيق أقصى قدر من المرح!'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🎓</span>
                  </span>
                  {locale === 'en' ? 'Engaging, licensed guides' : 'مرشدون مرخصون وجذابون'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                      ? 'From religion to history, politics or bird watching, you will connect with a topic expert.' 
                    : 'من الدين إلى التاريخ، السياسة أو مراقبة الطيور، ستتواصل مع خبير في الموضوع.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🗣️</span>
                  </span>
                  {locale === 'en' ? 'Verified language proficiency' : 'إتقان لغوي موثق'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                    ? 'Check the language ratings and choose a guide you can communicate well with.' 
                    : 'تحقق من تقييمات اللغة واختر مرشدًا يمكنك التواصل معه بشكل جيد.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">💬</span>
                  </span>
                  {locale === 'en' ? 'Chat and support' : 'الدردشة والدعم'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                      ? 'Got a question? You can message a guide directly or reach us via chat anytime.' 
                    : 'هل لديك سؤال؟ يمكنك مراسلة مرشد مباشرة أو الوصول إلينا عبر الدردشة في أي وقت.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-16 bg-primary-200 text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {locale === 'en' ? 'Our Values' : 'قيمنا'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">✨</span>
                  </span>
                  {locale === 'en' ? 'Authenticity' : 'الأصالة'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                    ? 'We believe in real experiences that showcase the true essence of a place and its people.' 
                    : 'نؤمن بالتجارب الحقيقية التي تعرض الجوهر الحقيقي للمكان وشعبه.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🔍</span>
                  </span>
                  {locale === 'en' ? 'Transparency' : 'الشفافية'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                    ? 'We maintain clear communication and honest practices in all our operations.' 
                    : 'نحافظ على التواصل الواضح والممارسات الصادقة في جميع عملياتنا.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🌱</span>
                  </span>
                  {locale === 'en' ? 'Sustainability' : 'الاستدامة'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                    ? 'We promote responsible tourism that respects local communities and environments.' 
                    : 'نحن نشجع السياحة المسؤولة التي تحترم المجتمعات المحلية والبيئات.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">💡</span>
                  </span>
                  {locale === 'en' ? 'Innovation' : 'الابتكار'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en' 
                    ? 'We continuously seek better ways to connect travelers with meaningful experiences.' 
                    : 'نحن نسعى باستمرار إلى طرق أفضل لربط المسافرين بتجارب ذات مغزى.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-primary-200 text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">
              {locale === 'en' ? 'What Our Travelers Say' : 'ماذا يقول مسافرونا'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center text-yellow-400 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6">
                    {locale === 'en' ? 'Boulos was an absolute joy on our tour and made the experience so smooth and wonderful.' : ' كانت جوله جميلًا جدًا وتجربة سلسة ورائعة.'}
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                        <p className="font-medium">Sarah M.</p>
                      <p className="text-sm text-gray-500">United States</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Link Section */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              {locale === 'en' ? 'Meet Our Team' : 'تعرف على فريقنا'}
            </h2>
            <p className="text-gray-600 mb-8">
              {locale === 'en' 
                ? 'Get to know the passionate people behind Watermelon Tours who are dedicated to transforming tourism in the Holy Land.' 
                : 'تعرف على الأشخاص المتحمسين وراء Watermelon Tours المكرسين لتحويل السياحة في الأرض المقدسة.'}
            </p>
            <Link 
              href={`/${locale}/team`}
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {locale === 'en' ? 'View Our Team' : 'عرض فريقنا'}
            </Link>
          </div>
        </div>
      </section> */}
      
      {/* Call to Action */}
      <CallToAction locale={locale} />
    </MainLayout>
  );
}