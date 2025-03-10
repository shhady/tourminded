'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';

const ChangePasswordForm = ({ locale, userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    reset
  } = useForm();
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to change password');
      }
      
      setSuccess(locale === 'en' 
        ? 'Password changed successfully!' 
        : 'تم تغيير كلمة المرور بنجاح!'
      );
      reset();
      
      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/profile`);
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Password */}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-secondary-700 mb-1">
          {locale === 'en' ? 'Current Password' : 'كلمة المرور الحالية'}
          <span className="text-error-600">*</span>
        </label>
        <input
          id="currentPassword"
          type="password"
          {...register('currentPassword', { 
            required: locale === 'en' ? 'Current password is required' : 'كلمة المرور الحالية مطلوبة' 
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.currentPassword ? 'border-error-500' : 'border-secondary-300'
          }`}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-error-600">{errors.currentPassword.message}</p>
        )}
      </div>
      
      {/* New Password */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-700 mb-1">
          {locale === 'en' ? 'New Password' : 'كلمة المرور الجديدة'}
          <span className="text-error-600">*</span>
        </label>
        <input
          id="newPassword"
          type="password"
          {...register('newPassword', { 
            required: locale === 'en' ? 'New password is required' : 'كلمة المرور الجديدة مطلوبة',
            minLength: {
              value: 8,
              message: locale === 'en' 
                ? 'Password must be at least 8 characters' 
                : 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'
            }
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.newPassword ? 'border-error-500' : 'border-secondary-300'
          }`}
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-error-600">{errors.newPassword.message}</p>
        )}
      </div>
      
      {/* Confirm New Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-1">
          {locale === 'en' ? 'Confirm New Password' : 'تأكيد كلمة المرور الجديدة'}
          <span className="text-error-600">*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword', { 
            required: locale === 'en' ? 'Please confirm your password' : 'يرجى تأكيد كلمة المرور',
            validate: value => 
              value === watch('newPassword') || 
              (locale === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة')
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.confirmPassword ? 'border-error-500' : 'border-secondary-300'
          }`}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-error-50 border border-error-200 text-error-800 rounded-md">
          {error}
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="p-3 bg-success-50 border border-success-200 text-success-800 rounded-md">
          {success}
        </div>
      )}
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          className="text-black"
          disabled={isLoading}
        >
          {isLoading 
            ? (locale === 'en' ? 'Updating...' : 'جاري التحديث...') 
            : (locale === 'en' ? 'Change Password' : 'تغيير كلمة المرور')
          }
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm; 