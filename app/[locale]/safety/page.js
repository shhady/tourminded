import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, AlertTriangle, Check, Info, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Safety Information | Watermelon Tours',
  description: 'Learn about safety measures and guidelines for traveling in the Holy Land',
};

export default async function SafetyPage({ params }) {
    const localeParams = await params
  const locale = await localeParams.locale || 'en';
  
  return (
    <MainLayout locale={locale}>
      <div className="bg-gradient-to-b from-primary-50 to-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <Shield className="text-primary-600" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              {locale === 'en' ? 'Your Safety is Our Priority' : 'سلامتك هي أولويتنا'}
            </h1>
            <p className="text-lg text-secondary-700 mb-8">
              {locale === 'en' 
                ? 'Comprehensive information to ensure a safe and enjoyable journey in the Holy Land' 
                : 'معلومات شاملة لضمان رحلة آمنة وممتعة في الأرض المقدسة'}
            </p>
          </div>
        </div>
        
        {/* General Safety Information */}
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8">
              {locale === 'en' ? 'General Safety Information' : 'معلومات السلامة العامة'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
              <p className="text-secondary-700 mb-6">
                {locale === 'en' 
                  ? 'The Holy Land is generally a safe destination for tourists. However, like any travel destination, it is important to stay informed and take common-sense precautions. Our guides are trained to prioritize your safety and will provide up-to-date information during your tour.' 
                  : 'الأرض المقدسة بشكل عام وجهة آمنة للسياح. ومع ذلك، مثل أي وجهة سفر، من المهم البقاء على اطلاع واتخاذ احتياطات الحس السليم. مرشدونا مدربون على إعطاء الأولوية لسلامتك وسيقدمون معلومات محدثة أثناء جولتك.'}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Check className="text-green-500 mr-2" />
                    {locale === 'en' ? 'What We Do' : 'ما نقوم به'}
                  </h3>
                  <ul className="space-y-3 text-secondary-700">
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Monitor local conditions and adjust tours as needed' 
                        : 'مراقبة الظروف المحلية وتعديل الجولات حسب الحاجة'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Provide guides with emergency training and protocols' 
                        : 'تزويد المرشدين بتدريب وبروتوكولات الطوارئ'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Ensure all tour vehicles meet safety standards' 
                        : 'ضمان استيفاء جميع مركبات الجولة لمعايير السلامة'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Maintain communication with local authorities' 
                        : 'الحفاظ على التواصل مع السلطات المحلية'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Provide 24/7 emergency contact for all travelers' 
                        : 'توفير اتصال طوارئ على مدار الساعة لجميع المسافرين'}
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <AlertTriangle className="text-amber-500 mr-2" />
                    {locale === 'en' ? 'Traveler Recommendations' : 'توصيات المسافر'}
                  </h3>
                  <ul className="space-y-3 text-secondary-700">
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Register with your embassy or consulate before travel' 
                        : 'سجل لدى سفارتك أو قنصليتك قبل السفر'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Purchase comprehensive travel insurance' 
                        : 'شراء تأمين سفر شامل'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Keep copies of important documents (passport, visa, etc.)' 
                        : 'احتفظ بنسخ من المستندات المهمة (جواز السفر، التأشيرة، إلخ)'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Stay hydrated, especially during summer months' 
                        : 'حافظ على رطوبة جسمك، خاصة خلال أشهر الصيف'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Follow your guide\'s instructions at religious sites' 
                        : 'اتبع تعليمات مرشدك في المواقع الدينية'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Regional Safety Information */}
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8">
              {locale === 'en' ? 'Regional Safety Information' : 'معلومات السلامة الإقليمية'}
            </h2>
            
            <div className="space-y-6 mb-12">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center mb-4">
                  <MapPin className="text-primary-600 mr-3" size={24} />
                  <h3 className="text-xl font-semibold">
                    {locale === 'en' ? 'Jerusalem' : 'القدس'}
                  </h3>
                </div>
                <p className="text-secondary-700 mb-4">
                  {locale === 'en' 
                    ? 'Jerusalem is generally safe for tourists. The Old City has a visible security presence, especially around religious sites. Be respectful of local customs and dress modestly when visiting religious sites. During religious holidays, some areas may become crowded.' 
                    : 'القدس آمنة بشكل عام للسياح. المدينة القديمة لديها وجود أمني مرئي، خاصة حول المواقع الدينية. كن محترمًا للعادات المحلية والبس بتواضع عند زيارة المواقع الدينية. خلال الأعياد الدينية، قد تصبح بعض المناطق مزدحمة.'}
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center mb-4">
                  <MapPin className="text-primary-600 mr-3" size={24} />
                  <h3 className="text-xl font-semibold">
                    {locale === 'en' ? 'Tel Aviv' : 'تل أبيب'}
                  </h3>
                </div>
                <p className="text-secondary-700 mb-4">
                  {locale === 'en' 
                    ? 'Tel Aviv is a modern, cosmopolitan city with a relaxed atmosphere. Standard urban precautions apply. The beach areas are generally safe but avoid leaving valuables unattended. The city has an excellent public transportation system that is safe to use.' 
                    : 'تل أبيب مدينة حديثة وعالمية ذات أجواء مريحة. تنطبق احتياطات المدن القياسية. مناطق الشاطئ آمنة بشكل عام ولكن تجنب ترك الأشياء الثمينة دون مراقبة. المدينة لديها نظام نقل عام ممتاز وآمن للاستخدام.'}
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center mb-4">
                  <MapPin className="text-primary-600 mr-3" size={24} />
                  <h3 className="text-xl font-semibold">
                    {locale === 'en' ? 'Bethlehem & West Bank' : 'بيت لحم والضفة الغربية'}
                  </h3>
                </div>
                <p className="text-secondary-700 mb-4">
                  {locale === 'en' 
                    ? 'Tourist areas in Bethlehem and other parts of the West Bank are generally safe to visit. Our guides are experienced in navigating these areas and will ensure your safety. You\'ll need your passport for crossing checkpoints. Dress modestly when visiting religious sites.' 
                    : 'المناطق السياحية في بيت لحم وأجزاء أخرى من الضفة الغربية آمنة بشكل عام للزيارة. مرشدونا ذوو خبرة في التنقل في هذه المناطق وسيضمنون سلامتك. ستحتاج إلى جواز سفرك لعبور نقاط التفتيش. البس بتواضع عند زيارة المواقع الدينية.'}
                </p>
              </div>
            </div>
            
            {/* Health & Medical Information */}
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8">
              {locale === 'en' ? 'Health & Medical Information' : 'معلومات صحية وطبية'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
              <div className="flex items-center mb-6">
                <Info className="text-primary-600 mr-3" size={24} />
                <h3 className="text-xl font-semibold">
                  {locale === 'en' ? 'Medical Facilities' : 'المرافق الطبية'}
                </h3>
              </div>
              
              <p className="text-secondary-700 mb-6">
                {locale === 'en' 
                  ? 'The Holy Land has excellent medical facilities with well-trained medical professionals. Most doctors speak English, and many hospitals have international patient services. We recommend purchasing comprehensive travel insurance that includes medical coverage before your trip.' 
                  : 'الأرض المقدسة لديها مرافق طبية ممتازة مع متخصصين طبيين مدربين جيدًا. معظم الأطباء يتحدثون الإنجليزية، والعديد من المستشفيات لديها خدمات للمرضى الدوليين. نوصي بشراء تأمين سفر شامل يشمل التغطية الطبية قبل رحلتك.'}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">
                    {locale === 'en' ? 'Emergency Numbers' : 'أرقام الطوارئ'}
                  </h4>
                  <ul className="space-y-2 text-secondary-700">
                    <li>
                      <span className="font-medium">{locale === 'en' ? 'Police:' : 'الشرطة:'}</span> 100
                    </li>
                    <li>
                      <span className="font-medium">{locale === 'en' ? 'Ambulance:' : 'الإسعاف:'}</span> 101
                    </li>
                    <li>
                      <span className="font-medium">{locale === 'en' ? 'Fire:' : 'الإطفاء:'}</span> 102
                    </li>
                    <li>
                      <span className="font-medium">{locale === 'en' ? 'Tourist Police:' : 'شرطة السياحة:'}</span> +972-2-5394200
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">
                    {locale === 'en' ? 'Health Recommendations' : 'توصيات صحية'}
                  </h4>
                  <ul className="space-y-2 text-secondary-700">
                    <li>
                      {locale === 'en' 
                        ? 'Bring any prescription medications in original containers' 
                        : 'أحضر أي أدوية موصوفة في حاوياتها الأصلية'}
                    </li>
                    <li>
                      {locale === 'en' 
                        ? 'Drink bottled water in remote areas' 
                        : 'اشرب المياه المعبأة في المناطق النائية'}
                    </li>
                    <li>
                      {locale === 'en' 
                        ? 'Use sunscreen and stay hydrated, especially in summer' 
                        : 'استخدم واقي الشمس وحافظ على رطوبة جسمك، خاصة في الصيف'}
                    </li>
                    <li>
                      {locale === 'en' 
                        ? 'Consider travel insurance with evacuation coverage' 
                        : 'فكر في تأمين السفر مع تغطية الإجلاء'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Section */}
        <div className="bg-primary-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">
                {locale === 'en' ? 'Have Safety Questions?' : 'هل لديك أسئلة حول السلامة؟'}
              </h2>
              <p className="text-lg text-secondary-700 mb-8">
                {locale === 'en' 
                  ? 'Our team is available to address any safety concerns you might have before booking your tour.' 
                  : 'فريقنا متاح لمعالجة أي مخاوف تتعلق بالسلامة قد تكون لديك قبل حجز جولتك.'}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href={`/${locale}/contact`}>
                  <Button className="w-full sm:w-auto">
                    {locale === 'en' ? 'Contact Us' : 'اتصل بنا'}
                  </Button>
                </Link>
                <Link href={`/${locale}/help`}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    {locale === 'en' ? 'Visit Help Center' : 'زيارة مركز المساعدة'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 