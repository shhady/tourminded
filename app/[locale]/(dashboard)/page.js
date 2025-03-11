'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Tour from '@/models/Tour';
import Review from '@/models/Review';
import User from '@/models/User';
import { Calendar, Star, Map, Users } from 'lucide-react';
import { Compass } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Dashboard | Tourminded',
  description: 'Manage your tours, bookings, and profile',
};

async function getStats(userId, role) {
  await connectDB();
  
  let stats = {
    bookings: 0,
    tours: 0,
    reviews: 0,
    upcomingBookings: [],
  };
  
  if (role === 'admin') {
    // Admin sees all stats
    stats.bookings = await Booking.countDocuments();
    stats.tours = await Tour.countDocuments();
    stats.reviews = await Review.countDocuments();
    stats.users = await User.countDocuments();
    stats.guides = await User.countDocuments({ role: 'guide' });
    stats.locations = await (await import('@/models/Location')).default.countDocuments();
    
    // Get recent bookings
    stats.upcomingBookings = await Booking.find({ status: 'confirmed' })
      .populate('user', 'name')
      .populate('tour', 'title')
      .populate('guide', 'name')
      .sort({ 'dates.startDate': 1 })
      .limit(5);
  } else if (role === 'guide') {
    // Guide sees stats for their tours
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: userId });
    
    if (!guide) {
      return stats;
    }
    
    stats.bookings = await Booking.countDocuments({ guide: guide._id });
    stats.tours = await Tour.countDocuments({ guide: guide._id });
    stats.reviews = await Review.countDocuments({ guide: guide._id });
    
    // Get upcoming bookings
    stats.upcomingBookings = await Booking.find({ 
      guide: guide._id,
      status: 'confirmed',
      'dates.startDate': { $gte: new Date() }
    })
      .populate('user', 'name')
      .populate('tour', 'title')
      .sort({ 'dates.startDate': 1 })
      .limit(5);
  } else {
    // Regular user sees their bookings
    stats.bookings = await Booking.countDocuments({ user: userId });
    stats.reviews = await Review.countDocuments({ user: userId });
    
    // Get upcoming bookings
    stats.upcomingBookings = await Booking.find({ 
      user: userId,
      status: 'confirmed',
      'dates.startDate': { $gte: new Date() }
    })
      .populate('guide', 'name')
      .populate('tour', 'title')
      .sort({ 'dates.startDate': 1 })
      .limit(5);
  }
  
  return stats;
}

export default async function DashboardPage({ params }) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    const localeParams = await params;
    const locale = localeParams?.locale || 'en';
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  
  // Connect to database
  await connectDB();
  
  // Find user in our database
  const user = await User.findOne({ clerkId: clerkUser.id });
  
  if (!user) {
    redirect(`/${locale}/sign-in`);
    return;
  }
  
  // Check if user is a guide and if guide is active
  if (user.role === 'guide') {
    const Guide = (await import('@/models/Guide')).default;
    const guide = await Guide.findOne({ user: user._id });
    
    if (!guide) {
      redirect(`/${locale}/profile`);
      return;
    }
    
    if (!guide.active) {
      // Redirect inactive guides to profile
      redirect(`/${locale}/profile`);
      return;
    }
  }
  
  const stats = await getStats(user._id, user.role);
  
  // Format date based on locale
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <>
      <Header locale={locale} user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* <DashboardSidebar locale={locale} userRole={user.role} /> */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">
              {locale === 'en' ? 'Dashboard' : 'لوحة التحكم'}
            </h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-primary-100 p-3 mr-4">
                  <Calendar className="text-primary-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-secondary-500 text-sm font-medium">
                    {locale === 'en' ? 'Bookings' : 'الحجوزات'}
                  </h3>
                  <p className="text-2xl font-bold">{stats.bookings}</p>
                </div>
              </div>
              
              {user.role === 'admin' || user.role === 'guide' ? (
                <div className="bg-white rounded-lg shadow p-6 flex items-center">
                  <div className="rounded-full bg-primary-100 p-3 mr-4">
                    <Compass className="text-primary-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-secondary-500 text-sm font-medium">
                      {locale === 'en' ? 'Tours' : 'الجولات'}
                    </h3>
                    <p className="text-2xl font-bold">{stats.tours}</p>
                  </div>
                </div>
              ) : null}
              
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-primary-100 p-3 mr-4">
                  <Star className="text-primary-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-secondary-500 text-sm font-medium">
                    {locale === 'en' ? 'Reviews' : 'التقييمات'}
                  </h3>
                  <p className="text-2xl font-bold">{stats.reviews}</p>
                </div>
              </div>
              
              {user.role === 'admin' && (
                <>
                  <div className="bg-white rounded-lg shadow p-6 flex items-center">
                    <div className="rounded-full bg-primary-100 p-3 mr-4">
                      <Users className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-secondary-500 text-sm font-medium">
                        {locale === 'en' ? 'Users' : 'المستخدمين'}
                      </h3>
                      <p className="text-2xl font-bold">{stats.users}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6 flex items-center">
                    <div className="rounded-full bg-primary-100 p-3 mr-4">
                      <Users className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-secondary-500 text-sm font-medium">
                        {locale === 'en' ? 'Guides' : 'المرشدين'}
                      </h3>
                      <p className="text-2xl font-bold">{stats.guides}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6 flex items-center">
                    <div className="rounded-full bg-primary-100 p-3 mr-4">
                      <Map className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-secondary-500 text-sm font-medium">
                        {locale === 'en' ? 'Locations' : 'المواقع'}
                      </h3>
                      <p className="text-2xl font-bold">{stats.locations}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Upcoming Bookings */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-secondary-200">
                <h2 className="font-bold text-lg">
                  {locale === 'en' ? 'Upcoming Bookings' : 'الحجوزات القادمة'}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                {stats.upcomingBookings.length > 0 ? (
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          {locale === 'en' ? 'Tour' : 'الجولة'}
                        </th>
                        {user.role === 'admin' || user.role === 'guide' ? (
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            {locale === 'en' ? 'User' : 'المستخدم'}
                          </th>
                        ) : (
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            {locale === 'en' ? 'Guide' : 'المرشد'}
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          {locale === 'en' ? 'Date' : 'التاريخ'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          {locale === 'en' ? 'Status' : 'الحالة'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {stats.upcomingBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-secondary-900">
                              {booking.tour.title?.en || booking.tour.title}
                            </div>
                          </td>
                          {user.role === 'admin' || user.role === 'guide' ? (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-secondary-500">
                                {booking.user.name}
                              </div>
                            </td>
                          ) : (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-secondary-500">
                                {booking.guide.name?.en || booking.guide.name}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-secondary-500">
                              {formatDate(booking.dates.startDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {locale === 'en' ? 'Confirmed' : 'مؤكد'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-4 text-center text-secondary-500">
                    {locale === 'en' ? 'No upcoming bookings' : 'لا توجد حجوزات قادمة'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer locale={locale} />
    </>
  );
} 