import { useLocale } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Personalized Tour Quiz | Watermelon Tours',
  description: 'Take our quiz to find the perfect tour for your Holy Land adventure',
};

export default async function QuizPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Quiz questions
  const questions = [
    {
      id: 'interests',
      title: locale === 'en' ? 'What are you most interested in?' : 'ما الذي تهتم به أكثر؟',
      description: locale === 'en' 
        ? 'Select all that apply to you' 
        : 'حدد كل ما ينطبق عليك',
      type: 'checkbox',
      options: [
        { value: 'Christian', label: locale === 'en' ? 'Christian heritage' : 'التراث المسيحي' },
        { value: 'Jewish', label: locale === 'en' ? 'Jewish heritage' : 'التراث اليهودي' },
        { value: 'Muslim', label: locale === 'en' ? 'Islamic heritage' : 'التراث الإسلامي' },
        { value: 'Historical', label: locale === 'en' ? 'Historical sites' : 'المواقع التاريخية' },
        { value: 'Cultural', label: locale === 'en' ? 'Local culture' : 'الثقافة المحلية' },
        { value: 'Food', label: locale === 'en' ? 'Food and cuisine' : 'الطعام والمطبخ' },
        { value: 'Adventure', label: locale === 'en' ? 'Adventure' : 'مغامرة' },
        { value: 'Nature', label: locale === 'en' ? 'Nature' : 'طبيعة' },
        { value: 'Photography', label: locale === 'en' ? 'Photography' : 'تصوير' },
        { value: 'Culinary', label: locale === 'en' ? 'Culinary' : 'طهي' },
        { value: 'All-inclusive', label: locale === 'en' ? 'All-inclusive' : 'شامل' },
      ],
    },
    {
      id: 'languages',
      title: locale === 'en' ? 'What languages do you speak?' : 'ما هي اللغات التي تتحدثها؟',
      description: locale === 'en' 
        ? 'Select all that apply to you' 
        : 'حدد كل ما ينطبق عليك',
      type: 'checkbox',
      options: [
        { value: 'English', label: locale === 'en' ? 'English' : 'الإنجليزية' },
        { value: 'Arabic', label: locale === 'en' ? 'Arabic' : 'العربية' },
        { value: 'Hebrew', label: locale === 'en' ? 'Hebrew' : 'العبرية' },
        { value: 'Spanish', label: locale === 'en' ? 'Spanish' : 'الإسبانية' },
        { value: 'French', label: locale === 'en' ? 'French' : 'الفرنسية' },
        { value: 'German', label: locale === 'en' ? 'German' : 'الألمانية' },
        { value: 'Italian', label: locale === 'en' ? 'Italian' : 'الإيطالية' },
        { value: 'Russian', label: locale === 'en' ? 'Russian' : 'الروسية' },
      ],
    },
    {
      id: 'duration',
      title: locale === 'en' ? 'How long would you like your tour to be?' : 'كم تريد أن تكون مدة جولتك؟',
      description: locale === 'en' 
        ? 'Select one option' 
        : 'حدد خيارًا واحدًا',
      type: 'radio',
      options: [
        { value: 'short', label: locale === 'en' ? 'Short (1-4 hours)' : 'قصيرة (1-4 ساعات)' },
        { value: 'medium', label: locale === 'en' ? 'Medium (4-8 hours or 1 day)' : 'متوسطة (4-8 ساعات أو يوم واحد)' },
        { value: 'long', label: locale === 'en' ? 'Long (Multiple days)' : 'طويلة (عدة أيام)' },
      ],
    },
    {
      id: 'groupSize',
      title: locale === 'en' ? 'How many people will be in your group?' : 'كم عدد الأشخاص في مجموعتك؟',
      description: locale === 'en' 
        ? 'Select one option' 
        : 'حدد خيارًا واحدًا',
      type: 'radio',
      options: [
        { value: '1', label: locale === 'en' ? 'Just me' : 'أنا فقط' },
        { value: '2', label: locale === 'en' ? 'Me and one other person' : 'أنا وشخص آخر' },
        { value: '3-5', label: locale === 'en' ? 'Small group (3-5 people)' : 'مجموعة صغيرة (3-5 أشخاص)' },
        { value: '6-10', label: locale === 'en' ? 'Medium group (6-10 people)' : 'مجموعة متوسطة (6-10 أشخاص)' },
        { value: '10+', label: locale === 'en' ? 'Large group (more than 10 people)' : 'مجموعة كبيرة (أكثر من 10 أشخاص)' },
      ],
    },
    {
      id: 'activityLevel',
      title: locale === 'en' ? 'What activity level do you prefer?' : 'ما هو مستوى النشاط الذي تفضله؟',
      description: locale === 'en' 
        ? 'Select one option' 
        : 'حدد خيارًا واحدًا',
      type: 'radio',
      options: [
        { value: 'easy', label: locale === 'en' ? 'Easy (minimal walking)' : 'سهل (الحد الأدنى من المشي)' },
        { value: 'moderate', label: locale === 'en' ? 'Moderate (some walking, stairs)' : 'معتدل (بعض المشي، السلالم)' },
        { value: 'challenging', label: locale === 'en' ? 'Challenging (lots of walking, hills)' : 'صعب (الكثير من المشي، التلال)' },
      ],
    },
    {
      id: 'specialRequirements',
      title: locale === 'en' ? 'Do you have any special requirements?' : 'هل لديك أي متطلبات خاصة؟',
      description: locale === 'en' 
        ? 'Select all that apply to you' 
        : 'حدد كل ما ينطبق عليك',
      type: 'checkbox',
      options: [
        { value: 'kidFriendly', label: locale === 'en' ? 'Kid-friendly tour' : 'جولة مناسبة للأطفال' },
        { value: 'handicappedFriendly', label: locale === 'en' ? 'Wheelchair accessible' : 'يمكن الوصول إليها بالكرسي المتحرك' },
      ],
    },
  ];
  
  return (
    <MainLayout locale={locale} user={user}>
      <div className="bg-primary-900 text-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">
            {locale === 'en' ? 'Find Your Perfect Tour' : 'ابحث عن جولتك المثالية'}
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-center">
            {locale === 'en'
              ? 'Answer a few questions and we\'ll recommend the best tours for you'
              : 'أجب على بعض الأسئلة وسنوصي بأفضل الجولات لك'}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 bg-primary-50 border-b border-primary-100">
              <h2 className="text-2xl font-bold text-primary-900">
                {locale === 'en' ? 'Personalized Tour Quiz' : 'اختبار الجولة الشخصية'}
              </h2>
              <p className="text-secondary-600 mt-2">
                {locale === 'en'
                  ? 'Tell us about your preferences so we can match you with the perfect tour'
                  : 'أخبرنا عن تفضيلاتك حتى نتمكن من مطابقتك مع الجولة المثالية'}
              </p>
            </div>
            
            <form className="p-6">
              {questions.map((question, index) => (
                <div key={question.id} className="mb-8 pb-8 border-b border-secondary-200 last:border-0 last:mb-0 last:pb-0">
                  <h3 className="text-xl font-semibold mb-2">
                    {index + 1}. {question.title}
                  </h3>
                  <p className="text-secondary-600 mb-4">{question.description}</p>
                  
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type={question.type}
                          id={`${question.id}-${option.value}`}
                          name={question.id}
                          value={option.value}
                          className={`h-5 w-5 ${
                            question.type === 'checkbox'
                              ? 'rounded text-primary-600 focus:ring-primary-500'
                              : 'rounded-full text-primary-600 focus:ring-primary-500'
                          } border-secondary-300`}
                        />
                        <label
                          htmlFor={`${question.id}-${option.value}`}
                          className="ml-3 text-secondary-700"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center mt-6">
                <Button type="submit" size="lg" className="flex items-center">
                  <div className='flex items-center'>{locale === 'en' ? 'Get Recommendations' : 'الحصول على التوصيات'}
                  <ArrowRight className="ml-2" />
                  </div>
                </Button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-secondary-600 mb-4">
              {locale === 'en'
                ? 'Not sure what you\'re looking for?'
                : 'غير متأكد مما تبحث عنه؟'}
            </p>
            <Link
              href={`/${locale}/tours`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {locale === 'en' ? 'Browse all tours instead' : 'تصفح جميع الجولات بدلاً من ذلك'}
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 