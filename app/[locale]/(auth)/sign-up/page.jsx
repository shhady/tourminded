'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from "react-icons/fc"

export default function Page() {
  const pathname = usePathname();
  const localeMatch = pathname.match(/\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : 'en';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [becomeGuide, setBecomeGuide] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(locale === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, becomeGuide }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || (locale === 'en' ? 'Registration failed' : 'فشل التسجيل'));
      }
      await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: becomeGuide ? `/${locale}/guide/register` : `/${locale}`,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-secondary-50">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {locale === 'en' ? 'Create an Account' : 'إنشاء حساب'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Full Name' : 'الاسم الكامل'}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Password' : 'كلمة المرور'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                minLength={6}
              />
            </div>

            {/* <div className="flex items-center">
              <input
                id="becomeGuide"
                type="checkbox"
                checked={becomeGuide}
                onChange={(e) => setBecomeGuide(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="becomeGuide" className="ml-2 block text-sm text-secondary-700">
                {locale === 'en' ? 'I want to become a guide' : 'أريد أن أصبح مرشدًا'}
              </label>
            </div> */}

            <button
              type="submit"
              className="w-full bg-black hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? (locale === 'en' ? 'Registering...' : 'جاري التسجيل...') : (locale === 'en' ? 'Register' : 'التسجيل')}
            </button>
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-1 h-px bg-secondary-200" />
            <span className="px-3 text-secondary-500 text-sm">{locale === 'en' ? 'or' : 'أو'}</span>
            <div className="flex-1 h-px bg-secondary-200" />
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: `/${locale}` })}
            className="flex items-center justify-center w-full border border-secondary-300 hover:bg-secondary-50 text-secondary-800 font-medium py-2 px-4 rounded-md transition-colors"
          >
           <FcGoogle className='mr-2' size={20}/> {locale === 'en' ? 'Continue with Google' : 'المتابعة باستخدام جوجل'}
          </button>

          <div className="mt-6 text-center text-sm text-secondary-600">
            {locale === 'en' ? 'Already have an account?' : 'لديك حساب بالفعل؟'}{' '}
            <Link href={`/${locale}/sign-in`} className="text-primary-600 hover:text-primary-500 font-medium">
              {locale === 'en' ? 'Login' : 'تسجيل الدخول'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
