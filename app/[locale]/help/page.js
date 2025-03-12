import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import FaqAccordion from '@/components/help/FaqAccordion';

export const metadata = {
  title: 'Help Center | Tourminded',
  description: 'Find answers to frequently asked questions about tours in the Holy Land',
};

export default async function HelpCenter({ params }) {
    const localeParams = await params
  const locale = await localeParams.locale || 'en';
  
  const faqItems = [
    {
      question: locale === 'en' ? "When is the best time to visit the Holy Land?" : "ما هو أفضل وقت لزيارة الأرض المقدسة؟",
      answer: locale === 'en' 
        ? "The best time to visit the Holy Land depends on what you're looking for in your trip. If you want to chill out on the beach, the summer months bring daily blue skies and fantastic beach weather – with lively beach bars and nonstop excitement in the capital, Tel Aviv. Be prepared for temperatures in the high 80º's F and 90º's F / 30º C up to 40º C, plus bigger crowds, and higher hotel prices if you visit in summertime.\n\nSpring and fall bring more mild weather and smaller crowds. With daytime temperatures in the 60'sº F and 70's° F / 15ºC to 25ºC in most of the country (but still hot around the Red Sea and Dead Sea), it's an ideal time to explore the endless incredible sights the Holy Land has to offer."
        : "يعتمد أفضل وقت لزيارة الأرض المقدسة على ما تبحث عنه في رحلتك. إذا كنت ترغب في الاسترخاء على الشاطئ، فإن أشهر الصيف تجلب سماء زرقاء يومية وطقسًا رائعًا للشاطئ - مع حانات شاطئية نابضة بالحياة وإثارة لا تتوقف في العاصمة، تل أبيب. كن مستعدًا لدرجات حرارة في الثمانينات والتسعينات فهرنهايت / 30 درجة مئوية حتى 40 درجة مئوية، بالإضافة إلى حشود أكبر، وأسعار فنادق أعلى إذا قمت بالزيارة في فصل الصيف.\n\nيجلب الربيع والخريف طقسًا أكثر اعتدالًا وحشودًا أصغر. مع درجات حرارة النهار في الستينات والسبعينات فهرنهايت / 15 درجة مئوية إلى 25 درجة مئوية في معظم أنحاء البلاد (ولكن لا يزال حارًا حول البحر الأحمر والبحر الميت)، إنه وقت مثالي لاستكشاف المشاهد الرائعة التي لا نهاية لها والتي تقدمها الأرض المقدسة."
    },
    {
      question: locale === 'en' ? "What are the top Christian sites in the Holy Land?" : "ما هي أهم المواقع المسيحية في الأرض المقدسة؟",
      answer: locale === 'en' 
        ? "The Holy Land is home to numerous significant Christian sites. Some of the most important include the Church of the Holy Sepulchre (where Jesus was crucified and buried), the Church of the Nativity in Bethlehem (Jesus's birthplace), the Mount of Olives, the Garden of Gethsemane, the Sea of Galilee, Nazareth (Jesus's childhood home), the Jordan River (where Jesus was baptized), and the Via Dolorosa (the path Jesus walked carrying his cross)."
        : "تضم الأرض المقدسة العديد من المواقع المسيحية المهمة. من بين أهمها كنيسة القيامة (حيث صُلب يسوع ودُفن)، وكنيسة المهد في بيت لحم (مكان ولادة يسوع)، وجبل الزيتون، وحديقة جثسيماني، وبحر الجليل، والناصرة (موطن طفولة يسوع)، ونهر الأردن (حيث تعمد يسوع)، وطريق الآلام (المسار الذي سار فيه يسوع حاملاً صليبه)."
    },
    {
      question: locale === 'en' ? "What does \"Israeli licensed tour guide\" mean?" : "ماذا تعني \"مرشد سياحي مرخص إسرائيلي\"؟",
      answer: locale === 'en' 
        ? "In Israel, it's a legal requirement for all tour guides to be licensed by the Ministry of Tourism. Guides must renew their license every two years and partake in one training course each year. All guides on Tourminded are fully licensed."
        : "في إسرائيل، يُشترط قانونًا أن يكون جميع المرشدين السياحيين مرخصين من قبل وزارة السياحة. يجب على المرشدين تجديد ترخيصهم كل عامين والمشاركة في دورة تدريبية واحدة كل عام. جميع المرشدين على Tourminded مرخصون بالكامل."
    },
    {
      question: locale === 'en' ? "What is the tipping culture in the Holy Land?" : "ما هي ثقافة البقشيش في الأرض المقدسة؟",
      answer: locale === 'en' 
        ? "Tipping in restaurants is expected in Israel (between 10 to 15% depending on the quality of the service).\n\nTipping taxi drivers is not common, nor is tipping when ordering at a cafe counter or getting information from your hotel.\n\nOn guided tours, a tip between $3 and $5 is the minimum, but feel free to tip more if you are really happy with the guide and if the tour lasts multiple days."
        : "البقشيش في المطاعم متوقع في إسرائيل (بين 10 إلى 15٪ اعتمادًا على جودة الخدمة).\n\nإعطاء البقشيش لسائقي سيارات الأجرة ليس شائعًا، وكذلك البقشيش عند الطلب من كاونتر المقهى أو الحصول على معلومات من الفندق الخاص بك.\n\nفي الجولات المصحوبة بمرشدين، يعتبر البقشيش بين 3 و 5 دولارات هو الحد الأدنى، ولكن لا تتردد في إعطاء المزيد إذا كنت سعيدًا حقًا بالمرشد وإذا استمرت الجولة لعدة أيام."
    },
    {
      question: locale === 'en' ? "Are there guides who can give a tour of Israel and Palestine?" : "هل هناك مرشدون يمكنهم تقديم جولة في إسرائيل وفلسطين؟",
      answer: locale === 'en' 
        ? "Yes! Tourminded has guides that will show you around both Israel and Palestine. You can see the regions each guide visits on their personal guide page."
        : "نعم! لدى Tourminded مرشدون سيصطحبونك في جولة في كل من إسرائيل وفلسطين. يمكنك رؤية المناطق التي يزورها كل مرشد على صفحة المرشد الشخصية."
    },
    {
      question: locale === 'en' ? "Why should I book through Tourminded?" : "لماذا يجب أن أحجز من خلال Tourminded؟",
      answer: locale === 'en' 
        ? "Tourminded tours are more customizable than tours through any other operator. We are the only travel agency that matches you with a perfect-fit guide, ensuring you get exactly the trip you're hoping for, nothing less! Explore our wide range of tours with engaging guides knowledgeable about religion, history, architecture, food, and more. Plus, you pay significantly less than you would when booking through other agencies because we don't charge a premium."
        : "جولات Tourminded أكثر قابلية للتخصيص من الجولات من خلال أي مشغل آخر. نحن وكالة السفر الوحيدة التي تطابقك مع مرشد مثالي، مما يضمن حصولك على الرحلة التي تأملها بالضبط، لا أقل! استكشف مجموعتنا الواسعة من الجولات مع مرشدين جذابين على دراية بالدين والتاريخ والعمارة والطعام والمزيد. بالإضافة إلى ذلك، فإنك تدفع أقل بكثير مما ستدفعه عند الحجز من خلال وكالات أخرى لأننا لا نفرض رسومًا إضافية."
    },
    {
      question: locale === 'en' ? "How do you choose the guides?" : "كيف تختارون المرشدين؟",
      answer: locale === 'en' 
        ? "We interview each guide individually to assess their qualifications, areas of expertise, and language proficiency. Additionally, a member of our team goes on their tour before we add them to Tourminded.\n\nSo, you can rest assured that your guided tour meets the highest quality standards and there are no unpleasant surprises on your visit to the Holy Land. Just kick back, relax, and let your guide show you the endless wonders there are to discover!"
        : "نقوم بمقابلة كل مرشد بشكل فردي لتقييم مؤهلاتهم ومجالات خبرتهم وإتقانهم للغة. بالإضافة إلى ذلك، يذهب أحد أعضاء فريقنا في جولتهم قبل إضافتهم إلى Tourminded.\n\nلذلك، يمكنك أن تطمئن إلى أن جولتك المصحوبة بمرشدين تلبي أعلى معايير الجودة وأنه لا توجد مفاجآت غير سارة في زيارتك للأرض المقدسة. ما عليك سوى الاسترخاء والاستمتاع ودع مرشدك يريك العجائب التي لا نهاية لها للاكتشاف!"
    },
    {
      question: locale === 'en' ? "What type of electrical outlets are used in Israel? Should I bring an adapter?" : "ما نوع المنافذ الكهربائية المستخدمة في إسرائيل؟ هل يجب أن أحضر محولًا؟",
      answer: locale === 'en' 
        ? "Israel has two types of sockets: type C (two prongs) and type H (3 prongs in a triangle). If you are traveling from the U.S., you will need an adaptor and voltage converter. If you are coming from Europe, you don't need an adaptor."
        : "تستخدم إسرائيل نوعين من المقابس: النوع C (شوكتان) والنوع H (3 شوكات في مثلث). إذا كنت مسافرًا من الولايات المتحدة، فستحتاج إلى محول ومحول جهد. إذا كنت قادمًا من أوروبا، فلن تحتاج إلى محول."
    }
  ];
  
  return (
    <MainLayout locale={locale}>
      <div className="bg-gradient-to-b from-primary-50 to-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              {locale === 'en' ? 'Help Center' : 'مركز المساعدة'}
            </h1>
            <p className="text-lg text-secondary-700 mb-8">
              {locale === 'en' 
                ? 'Questions about our tours? Take a look at our FAQs or reach out to us.' 
                : 'أسئلة حول جولاتنا؟ ألق نظرة على الأسئلة الشائعة أو تواصل معنا.'}
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-12">
              <input
                type="text"
                placeholder={locale === 'en' ? "Search for answers..." : "ابحث عن إجابات..."}
                className="w-full px-5 py-4 pr-12 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>
        
        {/* FAQ Accordion */}
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8 text-center">
              {locale === 'en' ? 'Frequently Asked Questions' : 'الأسئلة الشائعة'}
            </h2>
            
            <FaqAccordion items={faqItems} locale={locale} />
          </div>
        </div>
        
        {/* Contact Section */}
        <div className="bg-primary-50 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">
                {locale === 'en' ? "Couldn't find what you're looking for?" : "لم تجد ما تبحث عنه؟"}
              </h2>
              <p className="text-lg text-secondary-700 mb-8">
                {locale === 'en' 
                  ? "Our team is here to help. Reach out to us through any of these channels." 
                  : "فريقنا هنا للمساعدة. تواصل معنا من خلال أي من هذه القنوات."}
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-10">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-primary-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {locale === 'en' ? "Email Us" : "راسلنا عبر البريد الإلكتروني"}
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    {locale === 'en' 
                      ? "We'll respond within 24 hours" 
                      : "سنرد خلال 24 ساعة"}
                  </p>
                  <a href="mailto:support@tourminded.com" className="text-primary-600 hover:text-primary-700 font-medium">
                    support@tourminded.com
                  </a>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="text-primary-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {locale === 'en' ? "Call Us" : "اتصل بنا"}
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    {locale === 'en' 
                      ? "Available 9am-5pm (Israel time)" 
                      : "متاح من 9 صباحًا حتى 5 مساءً (بتوقيت إسرائيل)"}
                  </p>
                  <a href="tel:+972123456789" className="text-primary-600 hover:text-primary-700 font-medium">
                    +972 12 345 6789
                  </a>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="text-primary-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {locale === 'en' ? "Live Chat" : "الدردشة المباشرة"}
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    {locale === 'en' 
                      ? "Chat with our support team" 
                      : "تحدث مع فريق الدعم لدينا"}
                  </p>
                  <Button className="text-white">
                    {locale === 'en' ? "Start Chat" : "ابدأ الدردشة"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}