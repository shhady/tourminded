import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Cancellation Options | Watermelon Tours',
  description: 'Learn about our flexible cancellation policies for tours in the Holy Land',
};

export default async function CancellationPage({ params }) {
    const localeParams = await params
  const locale = await localeParams.locale || 'en';
  
  return (
    <MainLayout locale={locale}>
      <div className="bg-gradient-to-b from-primary-50 to-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <Calendar className="text-primary-600" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              {locale === 'en' ? 'Flexible Cancellation Options' : 'خيارات إلغاء مرنة'}
            </h1>
            <p className="text-lg text-secondary-700 mb-8">
              {locale === 'en' 
                ? 'We understand that plans change. That\'s why we offer flexible cancellation policies for our tours.' 
                : 'نحن نتفهم أن الخطط تتغير. لهذا السبب نقدم سياسات إلغاء مرنة لجولاتنا.'}
            </p>
          </div>
        </div>
        
        {/* Cancellation Policies */}
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8 text-center">
              {locale === 'en' ? 'Our Cancellation Policies' : 'سياسات الإلغاء لدينا'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
              <p className="text-secondary-700 mb-8">
                {locale === 'en' 
                  ? 'At Watermelon Tours, we strive to provide fair and transparent cancellation policies. We offer different levels of flexibility depending on the tour type and timing of your cancellation.' 
                  : 'في Watermelon Tours، نسعى جاهدين لتقديم سياسات إلغاء عادلة وشفافة. نقدم مستويات مختلفة من المرونة اعتمادًا على نوع الجولة وتوقيت الإلغاء.'}
              </p>
              
              <div className="space-y-8">
                <div className="border border-green-100 bg-green-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="text-green-500 mr-3" size={24} />
                    <h3 className="text-xl font-semibold text-secondary-900">
                      {locale === 'en' ? 'Free Cancellation (7+ days before tour)' : 'إلغاء مجاني (قبل 7+ أيام من الجولة)'}
                    </h3>
                  </div>
                  <p className="text-secondary-700 mb-4">
                    {locale === 'en' 
                      ? 'For most of our standard tours, you can cancel up to 7 days before the scheduled tour date and receive a full refund. This gives you the flexibility to adjust your plans if needed.' 
                      : 'بالنسبة لمعظم جولاتنا القياسية، يمكنك الإلغاء قبل 7 أيام من تاريخ الجولة المحدد والحصول على استرداد كامل. هذا يمنحك المرونة لتعديل خططك إذا لزم الأمر.'}
                  </p>
                  <ul className="text-secondary-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Full refund of tour cost' 
                        : 'استرداد كامل لتكلفة الجولة'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {locale === 'en' 
                        ? 'No questions asked' 
                        : 'بدون أسئلة'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Processed within 5-7 business days' 
                        : 'تتم المعالجة في غضون 5-7 أيام عمل'}
                    </li>
                  </ul>
                </div>
                
                <div className="border border-amber-100 bg-amber-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="text-amber-500 mr-3" size={24} />
                    <h3 className="text-xl font-semibold text-secondary-900">
                      {locale === 'en' ? 'Partial Refund (3-6 days before tour)' : 'استرداد جزئي (قبل 3-6 أيام من الجولة)'}
                    </h3>
                  </div>
                  <p className="text-secondary-700 mb-4">
                    {locale === 'en' 
                      ? 'If you need to cancel between 3-6 days before your scheduled tour, you\'ll receive a partial refund of 50% of the tour cost. This policy helps us balance flexibility for our customers with the commitments we\'ve made to our guides.' 
                      : 'إذا كنت بحاجة إلى الإلغاء بين 3-6 أيام قبل جولتك المجدولة، فستحصل على استرداد جزئي بنسبة 50٪ من تكلفة الجولة. تساعدنا هذه السياسة على تحقيق التوازن بين المرونة لعملائنا والالتزامات التي قدمناها لمرشدينا.'}
                  </p>
                  <ul className="text-secondary-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      {locale === 'en' 
                        ? '50% refund of tour cost' 
                        : 'استرداد 50٪ من تكلفة الجولة'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Processed within 5-7 business days' 
                        : 'تتم المعالجة في غضون 5-7 أيام عمل'}
                    </li>
                  </ul>
                </div>
                
                <div className="border border-red-100 bg-red-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <XCircle className="text-red-500 mr-3" size={24} />
                    <h3 className="text-xl font-semibold text-secondary-900">
                      {locale === 'en' ? 'No Refund (0-2 days before tour)' : 'لا استرداد (قبل 0-2 يوم من الجولة)'}
                    </h3>
                  </div>
                  <p className="text-secondary-700 mb-4">
                    {locale === 'en' 
                      ? 'Cancellations made within 48 hours of the scheduled tour time are not eligible for a refund. At this point, our guides have already committed their time and turned down other opportunities.' 
                      : 'عمليات الإلغاء التي تتم في غضون 48 ساعة من وقت الجولة المحدد غير مؤهلة للاسترداد. في هذه المرحلة، التزم مرشدونا بالفعل بوقتهم ورفضوا فرصًا أخرى.'}
                  </p>
                  <ul className="text-secondary-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {locale === 'en' 
                        ? 'No refund available' 
                        : 'لا يوجد استرداد متاح'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {locale === 'en' 
                        ? 'Consider rescheduling if possible' 
                        : 'فكر في إعادة الجدولة إذا كان ذلك ممكنًا'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Special Circumstances */}
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8 text-center">
              {locale === 'en' ? 'Special Circumstances' : 'ظروف خاصة'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-secondary-900">
                    {locale === 'en' ? 'Weather Conditions' : 'الظروف الجوية'}
                  </h3>
                  <p className="text-secondary-700">
                    {locale === 'en' 
                      ? 'If a tour needs to be canceled due to severe weather conditions that would make the experience unsafe or significantly diminished, we will offer you the option to reschedule or receive a full refund, regardless of timing.' 
                      : 'إذا كانت هناك حاجة لإلغاء جولة بسبب ظروف جوية قاسية من شأنها أن تجعل التجربة غير آمنة أو منخفضة بشكل كبير، فسنقدم لك خيار إعادة الجدولة أو الحصول على استرداد كامل، بغض النظر عن التوقيت.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-secondary-900">
                    {locale === 'en' ? 'Security Concerns' : 'المخاوف الأمنية'}
                  </h3>
                  <p className="text-secondary-700">
                    {locale === 'en' 
                      ? 'In the rare event that a security situation arises that would impact the safety of our tours, we will work with you to reschedule your tour or provide a full refund, regardless of when the cancellation occurs.' 
                      : 'في الحالة النادرة التي تنشأ فيها حالة أمنية من شأنها أن تؤثر على سلامة جولاتنا، سنعمل معك لإعادة جدولة جولتك أو تقديم استرداد كامل، بغض النظر عن وقت حدوث الإلغاء.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-secondary-900">
                    {locale === 'en' ? 'Medical Emergencies' : 'حالات الطوارئ الطبية'}
                  </h3>
                  <p className="text-secondary-700">
                    {locale === 'en' 
                      ? 'If you or a member of your party experiences a medical emergency that prevents participation in the tour, we will require documentation from a medical professional. With proper documentation, we can offer a full refund or the option to reschedule, even within our standard no-refund period.' 
                      : 'إذا واجهت أنت أو أحد أفراد مجموعتك حالة طوارئ طبية تمنع المشاركة في الجولة، فسنطلب وثائق من متخصص طبي. مع التوثيق المناسب، يمكننا تقديم استرداد كامل أو خيار إعادة الجدولة، حتى ضمن فترة عدم الاسترداد القياسية لدينا.'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Group Tours & Custom Policies */}
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8 text-center">
              {locale === 'en' ? 'Group Tours & Custom Policies' : 'جولات جماعية وسياسات مخصصة'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
              <p className="text-secondary-700 mb-6">
                {locale === 'en' 
                  ? 'For group tours (8 or more participants) and custom multi-day tours, different cancellation policies may apply. These will be clearly communicated during the booking process.' 
                  : 'بالنسبة للجولات الجماعية (8 مشاركين أو أكثر) والجولات المخصصة متعددة الأيام، قد تنطبق سياسات إلغاء مختلفة. سيتم توضيح هذه السياسات بوضوح أثناء عملية الحجز.'}
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  {locale === 'en' ? 'Group Tour Policies' : 'سياسات الجولات الجماعية'}
                </h3>
                <ul className="space-y-3 text-secondary-700">
                  <li className="flex items-start">
                    <Clock className="text-primary-600 mr-2 mt-1 flex-shrink-0" size={16} />
                    <span>
                      {locale === 'en' 
                        ? 'Full refund available up to 14 days before the tour date' 
                        : 'استرداد كامل متاح حتى 14 يومًا قبل تاريخ الجولة'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="text-primary-600 mr-2 mt-1 flex-shrink-0" size={16} />
                    <span>
                      {locale === 'en' 
                        ? '50% refund available 7-13 days before the tour date' 
                        : 'استرداد 50٪ متاح قبل 7-13 يومًا من تاريخ الجولة'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="text-primary-600 mr-2 mt-1 flex-shrink-0" size={16} />
                    <span>
                      {locale === 'en' 
                        ? 'No refund available within 7 days of the tour date' 
                        : 'لا يوجد استرداد متاح في غضون 7 أيام من تاريخ الجولة'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* How to Cancel */}
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8 text-center">
              {locale === 'en' ? 'How to Cancel or Modify Your Tour' : 'كيفية إلغاء أو تعديل جولتك'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
              <p className="text-secondary-700 mb-6">
                {locale === 'en' 
                  ? 'Canceling or modifying your tour is a simple process. You have several options:' 
                  : 'إلغاء أو تعديل جولتك هي عملية بسيطة. لديك عدة خيارات:'}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-primary-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {locale === 'en' ? 'Online Account' : 'الحساب عبر الإنترنت'}
                    </h3>
                    <p className="text-secondary-700">
                      {locale === 'en' 
                        ? 'Log in to your Watermelon Tours account and navigate to "My Bookings" to cancel or modify your reservation.' 
                        : 'قم بتسجيل الدخول إلى حساب Watermelon Tours الخاص بك وانتقل إلى "حجوزاتي" لإلغاء أو تعديل حجزك.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-primary-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {locale === 'en' ? 'Email' : 'البريد الإلكتروني'}
                    </h3>
                    <p className="text-secondary-700">
                      {locale === 'en' 
                        ? 'Send an email to cancellations@Watermelontours.com with your booking reference number and cancellation request.' 
                        : 'أرسل بريدًا إلكترونيًا إلى cancellations@Watermelontours.com مع رقم مرجع الحجز الخاص بك وطلب الإلغاء.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-primary-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {locale === 'en' ? 'Phone' : 'الهاتف'}
                    </h3>
                    <p className="text-secondary-700">
                      {locale === 'en' 
                        ? 'Call our customer service team at +972-12-345-6789 during business hours (9am-5pm Israel time, Sunday-Thursday).' 
                        : 'اتصل بفريق خدمة العملاء لدينا على +972-12-345-6789 خلال ساعات العمل (9 صباحًا - 5 مساءً بتوقيت إسرائيل، الأحد - الخميس).'}
                    </p>
                  </div>
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
                {locale === 'en' ? 'Need Help With Your Booking?' : 'هل تحتاج إلى مساعدة في حجزك؟'}
              </h2>
              <p className="text-lg text-secondary-700 mb-8">
                {locale === 'en' 
                  ? 'Our customer service team is ready to assist you with any questions about cancellations or modifications.' 
                  : 'فريق خدمة العملاء لدينا مستعد لمساعدتك في أي أسئلة حول الإلغاء أو التعديلات.'}
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