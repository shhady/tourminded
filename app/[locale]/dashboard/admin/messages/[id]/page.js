import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageCircle, Clock, User as UserIcon } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

export default async function AdminMessageViewPage({ params }) {
  const { locale, id } = await params;
  
  // Check if user is authenticated and is admin
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
  }

  await connectDB();
  
  // Find user in database and check if admin
  const user = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
  if (!user || user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  // Get the specific chat with messages
  const chat = await Chat.findById(id)
    .populate('participants', 'firstName lastName name')
    .populate('messages.senderId', 'firstName lastName name')
    .lean();

  if (!chat) {
    notFound();
  }

  // Format user data
  const getFullName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.name) {
      return user.name;
    }
    return 'User';
  };

  const [user1, user2] = chat.participants;
  const formattedUser1 = {
    _id: user1._id.toString(),
    name: getFullName(user1)
  };
  const formattedUser2 = {
    _id: user2._id.toString(),
    name: getFullName(user2)
  };

  // Format messages
  const formattedMessages = chat.messages.map(message => {
    const sender = message.senderId;
    return {
      _id: message._id.toString(),
      message: message.message,
      senderId: sender._id.toString(),
      senderName: getFullName(sender),
      createdAt: message.createdAt,
      isUser1: sender._id.toString() === user1._id.toString()
    };
  });

  // Helper function to format message time
  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/${locale}/dashboard/admin/messages`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'en' ? 'Back to Messages' : 'العودة إلى الرسائل'}
            </Link>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image 
                        src="/no-image-cover.png"
                        alt={formattedUser1.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{formattedUser1.name}</h2>
                      <p className="text-sm text-gray-500">User ID: {formattedUser1._id}</p>
                    </div>
                  </div>
                  
                  <span className="text-2xl text-gray-400">↔</span>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image 
                        src="/no-image-cover.png"
                        alt={formattedUser2.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{formattedUser2.name}</h2>
                      <p className="text-sm text-gray-500">User ID: {formattedUser2._id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {formattedMessages.length} {locale === 'en' ? 'messages' : 'رسائل'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {locale === 'en' ? 'Started' : 'بدأت'} {new Date(chat.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === 'en' ? 'Conversation History' : 'تاريخ المحادثة'}
              </h3>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {formattedMessages.length > 0 ? (
                <div className="space-y-4">
                  {formattedMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.isUser1 ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className="max-w-xs lg:max-w-md">
                        <div className="flex items-center mb-1">
                          {message.isUser1 ? (
                            <>
                              <UserIcon className="w-4 h-4 mr-1 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">
                                {formattedUser1.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-4 h-4 mr-1 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                {formattedUser2.name}
                              </span>
                            </>
                          )}
                          <span className="text-xs text-gray-500 ml-2">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            message.isUser1
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-green-100 text-green-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {locale === 'en' ? 'No messages yet' : 'لا توجد رسائل بعد'}
                  </h3>
                  <p className="text-gray-500">
                    {locale === 'en' 
                      ? 'This conversation has no messages' 
                      : 'هذه المحادثة لا تحتوي على رسائل'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Info */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'en' ? 'Chat Information' : 'معلومات المحادثة'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">
                  {locale === 'en' ? 'Chat ID:' : 'معرف المحادثة:'}
                </span>
                <span className="ml-2 text-gray-600">{chat._id.toString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  {locale === 'en' ? 'Created:' : 'تم الإنشاء:'}
                </span>
                <span className="ml-2 text-gray-600">
                  {new Date(chat.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  {locale === 'en' ? 'Last Message:' : 'آخر رسالة:'}
                </span>
                <span className="ml-2 text-gray-600">
                  {new Date(chat.lastMessageAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  {locale === 'en' ? 'Total Messages:' : 'إجمالي الرسائل:'}
                </span>
                <span className="ml-2 text-gray-600">{formattedMessages.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}