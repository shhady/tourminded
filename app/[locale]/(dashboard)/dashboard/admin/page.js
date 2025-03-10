'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { User, Users, Check, X, Edit, Trash, Eye } from 'lucide-react';

export default function AdminDashboardPage({ params }) {
  // Unwrap params Promise
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams?.locale || 'en';
  const router = useRouter();
  
  const [users, setUsers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('guides');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch guides
        const guidesResponse = await fetch('/api/guides');
        const guidesData = await guidesResponse.json();
        
        if (!guidesResponse.ok) {
          throw new Error(guidesData.message || 'Failed to fetch guides');
        }
        
        // Fetch users
        const usersResponse = await fetch('/api/users');
        const usersData = await usersResponse.json();
        
        if (!usersResponse.ok) {
          throw new Error(usersData.message || 'Failed to fetch users');
        }
        
        setGuides(guidesData.guides || []);
        setUsers(usersData.users || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleActivateGuide = async (guideId) => {
    try {
      const response = await fetch(`/api/guides/${guideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: true }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to activate guide');
      }
      
      // Update guides list
      setGuides(guides.map(guide => 
        guide._id === guideId ? { ...guide, active: true } : guide
      ));
    } catch (error) {
      console.error('Error activating guide:', error);
      setError(error.message);
    }
  };
  
  const handleDeactivateGuide = async (guideId) => {
    try {
      const response = await fetch(`/api/guides/${guideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: false }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to deactivate guide');
      }
      
      // Update guides list
      setGuides(guides.map(guide => 
        guide._id === guideId ? { ...guide, active: false } : guide
      ));
    } catch (error) {
      console.error('Error deactivating guide:', error);
      setError(error.message);
    }
  };
  
  const handleDeleteGuide = async (guideId) => {
    if (!confirm(locale === 'en' ? 'Are you sure you want to delete this guide?' : 'هل أنت متأكد أنك تريد حذف هذا المرشد؟')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/guides/${guideId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete guide');
      }
      
      // Update guides list
      setGuides(guides.filter(guide => guide._id !== guideId));
    } catch (error) {
      console.error('Error deleting guide:', error);
      setError(error.message);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!confirm(locale === 'en' ? 'Are you sure you want to delete this user?' : 'هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }
      
      // Update users list
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-secondary-900">
        {locale === 'en' ? 'Admin Dashboard' : 'لوحة تحكم المسؤول'}
      </h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-secondary-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'guides'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-600 hover:text-primary-600'
          }`}
          onClick={() => setActiveTab('guides')}
        >
          {locale === 'en' ? 'Guides' : 'المرشدين'}
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'users'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-600 hover:text-primary-600'
          }`}
          onClick={() => setActiveTab('users')}
        >
          {locale === 'en' ? 'Users' : 'المستخدمين'}
        </button>
      </div>
      
      {/* Guides Tab */}
      {activeTab === 'guides' && (
        <div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'Guide' : 'المرشد'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'Email' : 'البريد الإلكتروني'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'Status' : 'الحالة'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'Actions' : 'الإجراءات'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {guides.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-secondary-500">
                        {locale === 'en' ? 'No guides found' : 'لم يتم العثور على مرشدين'}
                      </td>
                    </tr>
                  ) : (
                    guides.map((guide) => (
                      <tr key={guide._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-secondary-900">
                                {guide.name?.en || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {guide.user?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            guide.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {guide.active
                              ? (locale === 'en' ? 'Active' : 'نشط')
                              : (locale === 'en' ? 'Inactive' : 'غير نشط')
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => guide.active ? handleDeactivateGuide(guide._id) : handleActivateGuide(guide._id)}
                              className={`p-1 rounded ${
                                guide.active
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={guide.active
                                ? (locale === 'en' ? 'Deactivate' : 'إلغاء التنشيط')
                                : (locale === 'en' ? 'Activate' : 'تنشيط')
                              }
                            >
                              {guide.active ? <X size={18} /> : <Check size={18} />}
                            </button>
                            <Link
                              href={`/${locale}/guides/${guide._id}`}
                              className="text-primary-600 hover:text-primary-900 p-1"
                              title={locale === 'en' ? 'View' : 'عرض'}
                            >
                              <Eye size={18} />
                            </Link>
                            <button
                              onClick={() => handleDeleteGuide(guide._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title={locale === 'en' ? 'Delete' : 'حذف'}
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'Name' : 'الاسم'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'Email' : 'البريد الإلكتروني'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'Role' : 'الدور'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      {locale === 'en' ? 'Actions' : 'الإجراءات'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-secondary-500">
                        {locale === 'en' ? 'No users found' : 'لم يتم العثور على مستخدمين'}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-secondary-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'guide'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'admin'
                              ? (locale === 'en' ? 'Admin' : 'مسؤول')
                              : user.role === 'guide'
                                ? (locale === 'en' ? 'Guide' : 'مرشد')
                                : (locale === 'en' ? 'User' : 'مستخدم')
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/${locale}/admin/users/${user._id}`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title={locale === 'en' ? 'Edit' : 'تعديل'}
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title={locale === 'en' ? 'Delete' : 'حذف'}
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 