import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import User from '@/models/User';
import Guide from '@/models/Guide';

export const metadata = {
  title: 'Guide Profile | Tourminded',
  description: 'Update your guide profile information',
};

async function getGuideProfile(userId) {
  await connectDB();
  
  try {
    // Get guide profile
    const guide = await Guide.findOne({ user: userId });
    
    if (!guide) {
      return null;
    }
    
    // Convert Mongoose document to plain object
    const plainGuide = {
      _id: guide._id.toString(),
      name: {
        en: guide.name?.en || '',
        ar: guide.name?.ar || '',
      },
      email: guide.email || '',
      nickname: guide.nickname || '',
      address: guide.address || '',
      phone: guide.phone || '',
      languages: guide.languages || [],
      expertise: guide.expertise || [],
      about: {
        en: guide.about?.en || '',
        ar: guide.about?.ar || '',
      },
      // Convert complex objects to simple strings
      profileImage: typeof guide.profileImage === 'object' ? 
        guide.profileImage.url || '' : guide.profileImage || '',
      driverLicense: guide.driverLicense ? {
        date: guide.driverLicense.date ? new Date(guide.driverLicense.date).toISOString() : null,
        number: guide.driverLicense.number || '',
        image: typeof guide.driverLicense.image === 'object' ? 
          guide.driverLicense.image.url || '' : guide.driverLicense.image || '',
      } : null,
      vehicle: guide.vehicle || {},
      active: guide.active || false,
    };
    
    return plainGuide;
  } catch (error) {
    console.error('Error getting guide profile:', error);
    return null;
  }
}

export default async function GuideProfilePage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user with Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  // Connect to database
  await connectDB();
  
  // Find user in our database
  const user = await User.findOne({ clerkId: clerkUser.id });
  
  if (!user) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  // Redirect if not a guide
  if (user.role !== 'guide') {
    redirect(`/${locale}/dashboard`);
    return;
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
          href={`/${locale}/profile`}
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
                  src={guide.profileImage} 
                  alt={guide.name?.en || 'Guide'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
                  <span className="text-secondary-400 text-4xl">
                    {(guide.name?.en?.[0] || guide.name?.[0] || '').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">
                {guide.name?.en || guide.name}
              </h2>
              <p className="text-primary-100 mb-2">
                {guide.title?.en || guide.title}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {guide.active ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                    {locale === 'en' ? 'Active' : 'نشط'}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                    {locale === 'en' ? 'Inactive' : 'غير نشط'}
                  </span>
                )}
                
                {guide.verified && (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                    {locale === 'en' ? 'Verified' : 'موثق'}
                  </span>
                )}
                
                {guide.featured && (
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                    {locale === 'en' ? 'Featured' : 'مميز'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                {locale === 'en' ? 'About' : 'نبذة عني'}
              </h3>
              <p className="text-secondary-600 whitespace-pre-line">
                {guide.about?.en || guide.about || (locale === 'en' ? 'No information provided.' : 'لم يتم تقديم معلومات.')}
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary-900">
                {locale === 'en' ? 'Contact Information' : 'معلومات الاتصال'}
              </h3>
              <ul className="space-y-2 text-secondary-600">
                <li className="flex items-start">
                  <span className="font-medium mr-2">{locale === 'en' ? 'Email:' : 'البريد الإلكتروني:'}</span>
                  <span>{guide.email || user.email}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">{locale === 'en' ? 'Phone:' : 'الهاتف:'}</span>
                  <span>{guide.phone || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">{locale === 'en' ? 'Address:' : 'العنوان:'}</span>
                  <span>{guide.address?.en || guide.address || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                </li>
              </ul>
            </div>
            
            {/* Expertise & Languages */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                {locale === 'en' ? 'Expertise' : 'الخبرات'}
              </h3>
              {guide.expertise && guide.expertise.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {guide.expertise.map((exp, index) => (
                    <div key={index} className="bg-secondary-100 px-3 py-1 rounded-full text-secondary-800 text-sm">
                      {exp.area?.en || exp.area}
                      {exp.years && <span className="text-secondary-500 ml-1">({exp.years} {locale === 'en' ? 'years' : 'سنوات'})</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-500 mb-6">
                  {locale === 'en' ? 'No expertise listed.' : 'لم يتم إدراج أي خبرات.'}
                </p>
              )}
              
              <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                {locale === 'en' ? 'Languages' : 'اللغات'}
              </h3>
              {guide.languages && guide.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {guide.languages.map((lang, index) => (
                    <div key={index} className="bg-secondary-100 px-3 py-1 rounded-full text-secondary-800 text-sm">
                      {lang.language?.en || lang.language}
                      {lang.proficiency && <span className="text-secondary-500 ml-1">({lang.proficiency})</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-500">
                  {locale === 'en' ? 'No languages listed.' : 'لم يتم إدراج أي لغات.'}
                </p>
              )}
              
              {/* Driver License */}
              {guide.driverLicense && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                    {locale === 'en' ? 'Driver License' : 'رخصة القيادة'}
                  </h3>
                  <ul className="space-y-2 text-secondary-600">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'License Number:' : 'رقم الرخصة:'}</span>
                      <span>{guide.driverLicense.number || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'Expiry Date:' : 'تاريخ الانتهاء:'}</span>
                      <span>
                        {guide.driverLicense.expiryDate 
                          ? new Date(guide.driverLicense.expiryDate).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA')
                          : (locale === 'en' ? 'Not provided' : 'غير متوفر')}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
              
              {/* Vehicle Information */}
              {guide.vehicle && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-secondary-900">
                    {locale === 'en' ? 'Vehicle Information' : 'معلومات المركبة'}
                  </h3>
                  <ul className="space-y-2 text-secondary-600">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'Make:' : 'الصنع:'}</span>
                      <span>{guide.vehicle.make || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'Model:' : 'الطراز:'}</span>
                      <span>{guide.vehicle.model || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'Year:' : 'السنة:'}</span>
                      <span>{guide.vehicle.year || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">{locale === 'en' ? 'Capacity:' : 'السعة:'}</span>
                      <span>{guide.vehicle.capacity || (locale === 'en' ? 'Not provided' : 'غير متوفر')}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 