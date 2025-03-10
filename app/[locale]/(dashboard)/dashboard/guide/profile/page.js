import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Guide Profile | Tourminded',
  description: 'Update your guide profile information',
};

async function getGuideProfile(userId) {
  await connectDB();
  
  try {
    // Get guide profile
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: userId });
    
    if (!guide) {
      return null;
    }
    
    return guide;
  } catch (error) {
    console.error('Error getting guide profile:', error);
    return null;
  }
}

export default async function GuideProfilePage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user
  const user = await getCurrentUser();
  
  // Redirect if not authenticated or not a guide
  if (!user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/dashboard/guide/profile`);
  }
  
  if (user.role !== 'guide') {
    redirect(`/${locale}/dashboard`);
  }
  
  // Get guide profile
  const guide = await getGuideProfile(user._id);
  
  if (!guide) {
    // If guide profile doesn't exist, show a message to create one
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {locale === 'en' ? 'Guide Profile' : 'الملف الشخصي للمرشد'}
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900">
            {locale === 'en' ? 'Profile Not Found' : 'لم يتم العثور على الملف الشخصي'}
          </h2>
          <p className="text-secondary-600 mb-6">
            {locale === 'en' 
              ? 'You need to create your guide profile to start offering tours.' 
              : 'تحتاج إلى إنشاء ملف المرشد الخاص بك لبدء تقديم الجولات.'}
          </p>
          <Button 
            href={`/${locale}/dashboard/guide/profile/create`}
            variant="primary"
            className="text-black"
          >
            {locale === 'en' ? 'Create Profile' : 'إنشاء ملف شخصي'}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {locale === 'en' ? 'Guide Profile' : 'الملف الشخصي للمرشد'}
        </h1>
        <Button 
          href={`/${locale}/dashboard/guide/profile/edit`}
          variant="primary"
          className="text-black"
        >
          {locale === 'en' ? 'Edit Profile' : 'تعديل الملف الشخصي'}
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary-600 p-6 text-black">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
              {guide.profileImage ? (
                <img 
                  src={typeof guide.profileImage === 'object' ? guide.profileImage.url : guide.profileImage} 
                  alt={guide.name?.[locale] || 'Guide'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary-200 flex items-center justify-center text-secondary-500">
                  <span className="text-4xl font-bold">
                    {(guide.name?.[locale]?.charAt(0) || 'G').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">{guide.name?.[locale] || 'Guide'}</h2>
              <p className="text-primary-100 mt-1">
                {guide.nickname || ''}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {guide.expertise?.[locale]?.map((exp, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-white/20 text-black text-xs px-2 py-1 rounded-full"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-secondary-900 border-b border-secondary-200 pb-2">
                {locale === 'en' ? 'About' : 'نبذة عني'}
              </h3>
              <p className="text-secondary-700 whitespace-pre-line">
                {guide.about?.[locale] || (locale === 'en' ? 'No information provided.' : 'لم يتم تقديم معلومات.')}
              </p>
            </div>
            
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-secondary-900 border-b border-secondary-200 pb-2">
                {locale === 'en' ? 'Contact Information' : 'معلومات الاتصال'}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-secondary-500 font-medium w-24">
                    {locale === 'en' ? 'Email:' : 'البريد الإلكتروني:'}
                  </span>
                  <span className="text-secondary-900">{guide.email || user.email}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-500 font-medium w-24">
                    {locale === 'en' ? 'Phone:' : 'الهاتف:'}
                  </span>
                  <span className="text-secondary-900">{guide.phone || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-500 font-medium w-24">
                    {locale === 'en' ? 'Address:' : 'العنوان:'}
                  </span>
                  <span className="text-secondary-900">{guide.address || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                </li>
              </ul>
            </div>
            
            {/* Languages */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-secondary-900 border-b border-secondary-200 pb-2">
                {locale === 'en' ? 'Languages' : 'اللغات'}
              </h3>
              {guide.languages && guide.languages.length > 0 ? (
                <ul className="space-y-2">
                  {guide.languages.map((lang, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-secondary-900">{lang.language}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-800">
                        {lang.proficiency}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary-500">
                  {locale === 'en' ? 'No languages specified.' : 'لم يتم تحديد لغات.'}
                </p>
              )}
            </div>
            
            {/* Driver License */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-secondary-900 border-b border-secondary-200 pb-2">
                {locale === 'en' ? 'Driver License' : 'رخصة القيادة'}
              </h3>
              {guide.driverLicense ? (
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-secondary-500 font-medium w-24">
                      {locale === 'en' ? 'Number:' : 'الرقم:'}
                    </span>
                    <span className="text-secondary-900">{guide.driverLicense.number || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary-500 font-medium w-24">
                      {locale === 'en' ? 'Expiry:' : 'تاريخ الانتهاء:'}
                    </span>
                    <span className="text-secondary-900">
                      {guide.driverLicense.expiryDate 
                        ? new Date(guide.driverLicense.expiryDate).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA')
                        : (locale === 'en' ? 'Not provided' : 'غير متوفر')}
                    </span>
                  </li>
                </ul>
              ) : (
                <p className="text-secondary-500">
                  {locale === 'en' ? 'No driver license information provided.' : 'لم يتم تقديم معلومات رخصة القيادة.'}
                </p>
              )}
            </div>
            
            {/* Vehicle Information */}
            {guide.vehicle && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-secondary-900 border-b border-secondary-200 pb-2">
                  {locale === 'en' ? 'Vehicle Information' : 'معلومات المركبة'}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-secondary-500 font-medium w-24">
                      {locale === 'en' ? 'Make:' : 'الصنع:'}
                    </span>
                    <span className="text-secondary-900">{guide.vehicle.make || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary-500 font-medium w-24">
                      {locale === 'en' ? 'Model:' : 'الموديل:'}
                    </span>
                    <span className="text-secondary-900">{guide.vehicle.model || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary-500 font-medium w-24">
                      {locale === 'en' ? 'Year:' : 'السنة:'}
                    </span>
                    <span className="text-secondary-900">{guide.vehicle.year || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary-500 font-medium w-24">
                      {locale === 'en' ? 'Capacity:' : 'السعة:'}
                    </span>
                    <span className="text-secondary-900">{guide.vehicle.capacity || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 