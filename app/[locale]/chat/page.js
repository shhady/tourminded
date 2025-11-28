'use client';

import React, { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageCircle, User, Search } from 'lucide-react';

const UserChatPage = ({ params }) => {
  const { status } = useSession();
  const router = useRouter();
  const { locale } = use(params);

  const [currentUser, setCurrentUser] = useState(null);
  const [isUserGuide, setIsUserGuide] = useState(false);
  const [guideData, setGuideData] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/sign-in`);
    }
  }, [status, router, locale]);

  // Fetch current user data and their conversations
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData.user);
            
            // Check if this user is a guide
            const guideResponse = await fetch('/api/guides/me');
            if (guideResponse.ok) {
              const guideResult = await guideResponse.json();
              if (guideResult.success && guideResult.guide) {
                setIsUserGuide(true);
                setGuideData(guideResult.guide);
              } else {
                setIsUserGuide(false);
              }
            }
            
            // Fetch user's conversations
            const chatsResponse = await fetch('/api/chats');
            if (chatsResponse.ok) {
              const chatsData = await chatsResponse.json();
              if (chatsData.success) {
                setChatList(chatsData.chats || []);
              }
            }
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {locale === 'en' ? 'Loading...' : 'جاري التحميل...'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link 
            href={`/${locale}/guides`}
            className="text-primary-600 hover:text-primary-700"
          >
            {locale === 'en' ? 'Browse Guides' : 'تصفح المرشدين'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/${locale}/guides`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'en' ? 'Browse Guides' : 'تصفح المرشدين'}
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {locale === 'en' ? 'Messages' : 'الرسائل'}
            </h1>
            <p className="text-gray-600">
              {isUserGuide 
                ? (locale === 'en' 
                    ? 'Messages from travelers interested in your guide services' 
                    : 'رسائل من المسافرين المهتمين بخدماتك كمرشد')
                : (locale === 'en' 
                    ? 'Your conversations with local guides' 
                    : 'محادثاتك مع المرشدين المحليين')
              }
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center">
                  <MessageCircle className="w-6 h-6 mr-3 text-primary-600" />
                  <h2 className="text-xl font-semibold">
                    {locale === 'en' ? 'Messages' : 'الرسائل'}
                  </h2>
                </div>

                {/* Search Bar (for future enhancement) */}
                <div className="relative w-full md:w-auto md:min-w-[16rem]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={locale === 'en' ? 'Search conversations...' : 'البحث في المحادثات...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              {chatList.length > 0 ? (
                <div className="space-y-4">
                  {chatList.map((chat) => (
                    <Link 
                      key={chat._id} 
                      href={`/${locale}/chat/${chat.otherParticipant._id}`}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                        <Image 
                          src={chat.otherParticipant.profileImage || '/no-image-cover.png'}
                          alt={chat.otherParticipant.fullName || 'User'}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900">
                              {chat.otherParticipant.fullName || 'User'}
                            </h3>
                            {chat.unreadCount > 0 && (
                              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {chat.lastMessage ? new Date(chat.lastMessageAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {chat.lastMessage?.message || 'No messages yet'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {locale === 'en' ? 'No messages yet' : 'لا توجد رسائل بعد'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {isUserGuide 
                      ? (locale === 'en' 
                          ? 'When travelers contact you, their messages will appear here' 
                          : 'عندما يتواصل معك المسافرون، ستظهر رسائلهم هنا')
                      : (locale === 'en' 
                          ? 'Start a conversation by contacting a guide from their profile page' 
                          : 'ابدأ محادثة عن طريق التواصل مع مرشد من صفحة ملفه الشخصي')
                    }
                  </p>
                  
                  {/* Call to Action */}
                  {!isUserGuide && (
                    <Link 
                      href={`/${locale}/guides`}
                      className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {locale === 'en' ? 'Find a Guide' : 'ابحث عن مرشد'}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {isUserGuide ? (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {locale === 'en' ? 'Guide Dashboard' : 'لوحة المرشد'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {locale === 'en' 
                      ? 'Manage your profile, tours, and bookings' 
                      : 'إدارة ملفك الشخصي والجولات والحجوزات'}
                  </p>
                  <Link 
                    href={`/${locale}/dashboard/guide`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {locale === 'en' ? 'Go to Dashboard →' : 'انتقل إلى اللوحة ←'}
                  </Link>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {locale === 'en' ? 'My Profile' : 'ملفي الشخصي'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {locale === 'en' 
                      ? 'Update your guide information and showcase your expertise' 
                      : 'حدث معلومات المرشد واعرض خبراتك'}
                  </p>
                  <Link 
                    href={`/${locale}/guides/${guideData?._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {locale === 'en' ? 'View Profile →' : 'عرض الملف الشخصي ←'}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {locale === 'en' ? 'Find New Guides' : 'ابحث عن مرشدين جدد'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {locale === 'en' 
                      ? 'Discover experienced local guides for your next adventure' 
                      : 'اكتشف مرشدين محليين ذوي خبرة لمغامرتك القادمة'}
                  </p>
                  <Link 
                    href={`/${locale}/guides`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {locale === 'en' ? 'Browse Guides →' : 'تصفح المرشدين ←'}
                  </Link>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {locale === 'en' ? 'Plan Your Trip' : 'خطط لرحلتك'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {locale === 'en' 
                      ? 'Explore tours and create your perfect itinerary' 
                      : 'استكشف الجولات وأنشئ برنامجك المثالي'}
                  </p>
                  <Link 
                    href={`/${locale}/tours`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {locale === 'en' ? 'View Tours →' : 'عرض الجولات ←'}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChatPage;