'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';

const ChatPage = ({ params }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { id, locale } = use(params); // id is the guide's user ID
  const messagesEndRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [targetGuide, setTargetGuide] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data and set up chat
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded || !isSignedIn) return;
      
      try {
        setLoading(true);
        
        // Get current user data
        const userResponse = await fetch('/api/users/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
          
          // Get target user data (the other person we're chatting with)
          const targetUserResponse = await fetch(`/api/users/profile/${id}`);
          if (targetUserResponse.ok) {
            const targetUserData = await targetUserResponse.json();
            if (targetUserData.success && targetUserData.user) {
              setTargetGuide(targetUserData.user);
              
              // Try to find existing chat (don't create if it doesn't exist)
              try {
                const chatResponse = await fetch(`/api/chats/with/${id}`);
                if (chatResponse.ok) {
                  const chatData = await chatResponse.json();
                  if (chatData.success && chatData.chat) {
                    setChat(chatData.chat);
                    
                    // Fetch messages for this chat
                    const messagesResponse = await fetch(`/api/chats/${chatData.chat._id}`);
                    if (messagesResponse.ok) {
                      const messagesData = await messagesResponse.json();
                      if (messagesData.success) {
                        // Messages already have correct isCurrentUser flag from API
                        setMessages(messagesData.chat.messages);
                      }
                    }
                  }
                } else {
                  console.log('No existing chat found');
                }
              } catch (chatError) {
                console.log('No existing chat:', chatError);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load chat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn, id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending messages via API
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      let chatId = chat?._id;
      
      // If no chat exists, create one first via API
      if (!chatId) {
        const createChatResponse = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ otherUserId: id }),
        });
        
        if (createChatResponse.ok) {
          const createChatData = await createChatResponse.json();
          if (createChatData.success) {
            chatId = createChatData.chat._id;
            setChat(createChatData.chat);
          }
        }
      }
      
      if (chatId && currentUser) {
        // Send message via API
        const sendMessageResponse = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: newMessage.trim(),
            senderId: currentUser._id,
          }),
        });
        
        if (sendMessageResponse.ok) {
          const messageData = await sendMessageResponse.json();
          if (messageData.success) {
            // Add the new message to the local state
            const newMsg = {
              ...messageData.newMessage,
              isCurrentUser: true
            };
            setMessages(prev => [...prev, newMsg]);
            setNewMessage('');
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const getUserName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || user?.fullName || 'User';
  };

  if (!isLoaded || loading) {
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

  if (!isSignedIn) {
    router.push(`/${locale}/sign-in`);
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-600 text-black rounded-lg hover:bg-primary-700"
          >
            {locale === 'en' ? 'Retry' : 'إعادة المحاولة'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto py-6 px-4">
        {/* Back Link */}
        <Link
          href={`/${locale}/chat`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {locale === 'en' ? 'Back to Chats' : 'العودة إلى المحادثات'}
        </Link>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-black p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 ring-3 ring-white/20">
                <Image
                  src={targetGuide?.profileImage || '/no-image-cover.png'}
                  alt={getUserName(targetGuide)}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {getUserName(targetGuide)}
                </h1>
                {/* <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <p className="text-primary-100 text-sm font-medium">
                    {locale === 'en' ? 'Online' : 'متصل'}
                  </p>
                </div> */}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-primary-200">
                {locale === 'en' ? 'Tour Guide' : 'مرشد سياحي'}
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 bg-gray-50/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {locale === 'en' ? 'Start your conversation' : 'ابدأ محادثتك'}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {locale === 'en' 
                    ? 'Send a message to begin chatting with your tour guide'
                    : 'أرسل رسالة لبدء الدردشة مع مرشدك السياحي'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message._id || index}
                    className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`group max-w-sm lg:max-w-md`}>
                      {!message.isCurrentUser && (
                        <div className="flex items-center mb-1">
                          <div className="w-6 h-6 rounded-full overflow-hidden mr-2 mb-2">
                            <Image
                              src={targetGuide?.profileImage || '/no-image-cover.png'}
                              alt={getUserName(targetGuide)}
                              width={24}
                              height={24}
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {getUserName(targetGuide)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          message.isCurrentUser
                            ? 'bg-gradient-to-r from-green-100 to-green-200 text-black rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        <p className={`text-xs mt-2 ${
                          message.isCurrentUser 
                            ? 'text-primary-100' 
                            : 'text-gray-400'
                        }`}>
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white p-6">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={locale === 'en' ? 'Type your message...' : 'اكتب رسالتك...'}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 text-black rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-500 disabled:hover:to-primary-600 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2 px-1">
              {locale === 'en' 
                ? 'Press Enter to send'
                : 'اضغط Enter للإرسال'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;