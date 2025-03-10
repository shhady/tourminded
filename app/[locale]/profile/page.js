import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { User, Mail, Lock, History, Heart, Star } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

export const metadata = {
  title: 'My Profile | Tourminded',
  description: 'View and update your profile information',
};

export default async function ProfilePage({ params }) {
  // Ensure params.locale is properly awaited
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
    
    // If we have a user, get the latest data directly from the database
    if (user && user._id) {
      await connectDB();
      const freshUserData = await UserModel.findById(user._id).lean();
      if (freshUserData) {
        // Update the user object with the latest role
        user = {
          ...user,
          role: freshUserData.role
        };
      }
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  console.log(user);
  // Redirect if not authenticated
  if (!user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/profile`);
  }
  
  return (
    <MainLayout locale={locale} user={user}>
      <div className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-secondary-900">
              {locale === 'en' ? 'My Profile' : 'الملف الشخصي'}
            </h1>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              {/* Profile Header */}
              <div className="bg-primary-600 p-6 text-black">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <User className="text-primary-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-primary-100">{user.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Profile Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-secondary-900 border-b border-secondary-200 pb-2">
                      {locale === 'en' ? 'Personal Information' : 'المعلومات الشخصية'}
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-center">
                        <User className="text-primary-600 mr-3" size={18} />
                        <div>
                          <p className="text-sm text-secondary-900">
                            {locale === 'en' ? 'Name' : 'الاسم'}
                          </p>
                          <p className="text-secondary-900">{user.name}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <Mail className="text-primary-600 mr-3" size={18} />
                        <div>
                          <p className="text-sm text-secondary-900">
                            {locale === 'en' ? 'Email' : 'البريد الإلكتروني'}
                          </p>
                          <p className="text-secondary-900">{user.email}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <Lock className="text-primary-600 mr-3" size={18} />
                        <div>
                          <p className="text-sm text-secondary-900">
                            {locale === 'en' ? 'Password' : 'كلمة المرور'}
                          </p>
                          <p className="text-secondary-900">••••••••</p>
                        </div>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Button 
                        href={`/${locale}/profile/edit`}
                        variant="outline"
                        className="text-black"
                      >
                        {locale === 'en' ? 'Edit Profile' : 'تعديل الملف الشخصي'}
                      </Button>
                      <Button 
                        href={`/${locale}/profile/change-password`}
                        variant="outline"
                        className="ml-3 text-black"
                      >
                        {locale === 'en' ? 'Change Password' : 'تغيير كلمة المرور'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Account Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-secondary-900 border-b border-secondary-200 pb-2">
                      {locale === 'en' ? 'Account Information' : 'معلومات الحساب'}
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="bg-primary-100 p-2 rounded-full text-primary-600 mt-1 mr-3">
                          <User className="text-sm" size={14} />
                        </div>
                        <div>
                          <p className="text-sm text-secondary-900">
                            {locale === 'en' ? 'Account Type' : 'نوع الحساب'}
                          </p>
                          <p className="text-secondary-900">
                            {user.role === 'admin' 
                              ? (locale === 'en' ? 'Administrator' : 'مدير')
                              : user.role === 'guide'
                                ? (locale === 'en' ? 'Guide' : 'مرشد')
                                : (locale === 'en' ? 'User' : 'مستخدم')
                            }
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-primary-100 p-2 rounded-full text-primary-600 mt-1 mr-3">
                          <History className="text-sm" size={14} />
                        </div>
                        <div>
                          <p className="text-sm text-secondary-900">
                            {locale === 'en' ? 'Member Since' : 'عضو منذ'}
                          </p>
                          <p className="text-secondary-900">
                            {new Date(user.createdAt).toLocaleDateString(
                              locale === 'en' ? 'en-US' : 'ar-SA',
                              { year: 'numeric', month: 'long', day: 'numeric' }
                            )}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href={`/${locale}/bookings`}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="bg-primary-100 p-4 rounded-full text-primary-600 mb-4">
                  <History className="text-xl" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                  {locale === 'en' ? 'My Bookings' : 'حجوزاتي'}
                </h3>
                <p className="text-secondary-900">
                  {locale === 'en' 
                    ? 'View and manage your tour bookings' 
                    : 'عرض وإدارة حجوزات الجولات الخاصة بك'}
                </p>
              </Link>
              
              <Link 
                href={`/${locale}/wishlist`}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="bg-primary-100 p-4 rounded-full text-primary-600 mb-4">
                  <Heart className="text-xl" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                  {locale === 'en' ? 'My Wishlist' : 'قائمة الرغبات'}
                </h3>
                <p className="text-secondary-900">
                  {locale === 'en' 
                    ? 'View tours and guides you saved' 
                    : 'عرض الجولات والمرشدين الذين قمت بحفظهم'}
                </p>
              </Link>
              
              <Link 
                href={`/${locale}/reviews`}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="bg-primary-100 p-4 rounded-full text-primary-600 mb-4">
                  <Star className="text-xl" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                  {locale === 'en' ? 'My Reviews' : 'تقييماتي'}
                </h3>
                <p className="text-secondary-900">
                  {locale === 'en' 
                    ? 'View and manage your reviews' 
                    : 'عرض وإدارة التقييمات الخاصة بك'}
                </p>
              </Link>
            </div>
            
            {/* Dashboard Link for Guides and Admins */}
            {(user.role === 'guide' || user.role === 'admin') && (
              <div className="mt-8 bg-primary-50 rounded-lg p-6 border border-primary-100">
                <h3 className="text-lg font-semibold mb-2 text-secondary-900">
                  {user.role === 'guide'
                    ? (locale === 'en' ? 'Guide Dashboard' : 'لوحة تحكم المرشد')
                    : (locale === 'en' ? 'Admin Dashboard' : 'لوحة تحكم المدير')
                  }
                </h3>
                <p className="text-secondary-900 mb-4">
                  {user.role === 'guide'
                    ? (locale === 'en' 
                        ? 'Manage your tours, bookings, and guide profile' 
                        : 'إدارة جولاتك وحجوزاتك وملف المرشد الخاص بك')
                    : (locale === 'en' 
                        ? 'Access the admin dashboard to manage the platform' 
                        : 'الوصول إلى لوحة تحكم المدير لإدارة المنصة')
                  }
                </p>
                <Button 
                  href={user.role === 'guide' 
                    ? `/${locale}/dashboard/guide` 
                    : `/${locale}/dashboard/admin`
                  }
                  variant="primary"
                  className="text-black"
                >
                  {locale === 'en' ? 'Go to Dashboard' : 'الذهاب إلى لوحة التحكم'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 