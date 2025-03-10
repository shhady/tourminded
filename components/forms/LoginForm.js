'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';

const LoginForm = ({ locale }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      // Get the URL parameters to check for redirect
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      
      // Redirect to dashboard or home page based on user role or redirect parameter
      if (redirectPath) {
        router.push(redirectPath);
      } else if (result.user.role === 'admin') {
        router.push(`/${locale}/dashboard/admin`);
      } else if (result.user.role === 'guide') {
        router.push(`/${locale}/dashboard/guide`);
      } else {
        router.push(`/${locale}`);
      }
      
      // Force a refresh to ensure the user state is updated
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {locale === 'en' ? 'Login to Your Account' : 'تسجيل الدخول إلى حسابك'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
            {locale === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
          </label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: locale === 'en' ? 'Email is required' : 'البريد الإلكتروني مطلوب',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: locale === 'en' ? 'Invalid email address' : 'عنوان بريد إلكتروني غير صالح',
              },
            })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
            {locale === 'en' ? 'Password' : 'كلمة المرور'}
          </label>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: locale === 'en' ? 'Password is required' : 'كلمة المرور مطلوبة',
              minLength: {
                value: 6,
                message: locale === 'en' ? 'Password must be at least 6 characters' : 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
              },
            })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-secondary-700">
              {locale === 'en' ? 'Remember me' : 'تذكرني'}
            </label>
          </div>
          
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            {locale === 'en' ? 'Forgot password?' : 'نسيت كلمة المرور؟'}
          </Link>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? (locale === 'en' ? 'Logging in...' : 'جاري تسجيل الدخول...')
            : (locale === 'en' ? 'Login' : 'تسجيل الدخول')}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-600">
          {locale === 'en' ? "Don't have an account?" : 'ليس لديك حساب؟'}{' '}
          <Link
            href="/auth/register"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            {locale === 'en' ? 'Register' : 'التسجيل'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 