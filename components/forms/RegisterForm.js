'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';

const RegisterForm = ({ locale }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies in the request
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      // Wait a moment for the auth cookie to be set
      setTimeout(() => {
        // If user wants to become a guide, redirect to guide registration form
        if (data.becomeGuide) {
          window.location.href = `/${locale}/guide/register`;
        } else {
          // Redirect to home page
          window.location.href = `/${locale}`;
        }
      }, 500);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {locale === 'en' ? 'Create an Account' : 'إنشاء حساب'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
            {locale === 'en' ? 'Full Name' : 'الاسم الكامل'}
          </label>
          <input
            id="name"
            type="text"
            {...register('name', {
              required: locale === 'en' ? 'Name is required' : 'الاسم مطلوب',
              minLength: {
                value: 2,
                message: locale === 'en' ? 'Name must be at least 2 characters' : 'يجب أن يتكون الاسم من حرفين على الأقل',
              },
            })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        
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
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-1">
            {locale === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: locale === 'en' ? 'Please confirm your password' : 'يرجى تأكيد كلمة المرور',
              validate: value => 
                value === password || 
                (locale === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة')
            })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="becomeGuide"
            type="checkbox"
            {...register('becomeGuide')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
          />
          <label htmlFor="becomeGuide" className="ml-2 block text-sm text-secondary-700">
            {locale === 'en' 
              ? 'I want to become a guide' 
              : 'أريد أن أصبح مرشدًا'}
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            {...register('terms', {
              required: locale === 'en' ? 'You must agree to the terms and conditions' : 'يجب أن توافق على الشروط والأحكام',
            })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-secondary-700">
            {locale === 'en' 
              ? 'I agree to the Terms of Service and Privacy Policy' 
              : 'أوافق على شروط الخدمة وسياسة الخصوصية'}
          </label>
        </div>
        {errors.terms && (
          <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
        )}
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? (locale === 'en' ? 'Registering...' : 'جاري التسجيل...')
            : (locale === 'en' ? 'Register' : 'التسجيل')}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-600">
          {locale === 'en' ? 'Already have an account?' : 'لديك حساب بالفعل؟'}{' '}
          <Link
            href={`/${locale}/auth/login`}
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            {locale === 'en' ? 'Login' : 'تسجيل الدخول'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 