import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Users, Eye } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

export default async function AdminMessagesPage({ params }) {
  const { locale } = await params;
  
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

  // Get all chats with populated user data
  const chats = await Chat.find({})
    .populate('participants', 'firstName lastName name')
    .sort({ lastMessageAt: -1 })
    .lean();

  // Format chat data with user names
  const formattedChats = chats.map(chat => {
    const [user1, user2] = chat.participants;
    
    const getFullName = (user) => {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      } else if (user.name) {
        return user.name;
      }
      return 'User';
    };

    return {
      _id: chat._id.toString(),
      user1: {
        _id: user1._id.toString(),
        name: getFullName(user1)
      },
      user2: {
        _id: user2._id.toString(),
        name: getFullName(user2)
      },
      messageCount: chat.messages.length,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
      lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].message : 'No messages'
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/${locale}/dashboard/admin`}
              className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
            >
              ← {locale === 'en' ? 'Back to Admin Dashboard' : 'العودة إلى لوحة الإدارة'}
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {locale === 'en' ? 'User Messages' : 'رسائل المستخدمين'}
            </h1>
            <p className="text-gray-600">
              {locale === 'en' 
                ? 'View all conversations between users' 
                : 'عرض جميع المحادثات بين المستخدمين'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">
                    {locale === 'en' ? 'Total Conversations' : 'إجمالي المحادثات'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{formattedChats.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">
                    {locale === 'en' ? 'Total Messages' : 'إجمالي الرسائل'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formattedChats.reduce((total, chat) => total + chat.messageCount, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">
                    {locale === 'en' ? 'Active Today' : 'نشط اليوم'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formattedChats.filter(chat => {
                      const today = new Date();
                      const lastMessage = new Date(chat.lastMessageAt);
                      return lastMessage.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {locale === 'en' ? 'All Conversations' : 'جميع المحادثات'}
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {formattedChats.length > 0 ? (
                formattedChats.map((chat) => (
                  <div key={chat._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image 
                              src="/no-image-cover.png"
                              alt={chat.user1.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <span className="font-medium text-gray-900">{chat.user1.name}</span>
                        </div>
                        
                        <span className="text-gray-400">↔</span>
                        
                        <div className="flex items-center space-x-2">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image 
                              src="/no-image-cover.png"
                              alt={chat.user2.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <span className="font-medium text-gray-900">{chat.user2.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {chat.lastMessage}
                          </p>
                          <p className="text-xs text-gray-500">
                            {chat.messageCount} {locale === 'en' ? 'messages' : 'رسائل'} • 
                            {new Date(chat.lastMessageAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <Link 
                          href={`/${locale}/dashboard/admin/messages/${chat._id}`}
                          className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {locale === 'en' ? 'View' : 'عرض'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {locale === 'en' ? 'No conversations yet' : 'لا توجد محادثات بعد'}
                  </h3>
                  <p className="text-gray-500">
                    {locale === 'en' 
                      ? 'User conversations will appear here when they start chatting' 
                      : 'ستظهر محادثات المستخدمين هنا عندما يبدؤون في المحادثة'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}