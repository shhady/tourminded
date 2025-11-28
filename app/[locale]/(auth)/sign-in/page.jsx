'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from "react-icons/fc"
export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const localeMatch = pathname.match(/\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : 'en';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error || res?.status === 401) {
        const msg = locale === 'en' ? 'Invalid email or password' : 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        setError(msg);
        return;
      }
      if (res?.ok) {
        router.replace(`/${locale}`);
        return;
      }
    } catch {
      setError(locale === 'en' ? 'Login failed' : 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-secondary-50">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {locale === 'en' ? 'Login to Your Account' : 'تسجيل الدخول إلى حسابك'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
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
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black cursor-pointer hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? (locale === 'en' ? 'Logging in...' : 'جاري تسجيل الدخول...') : (locale === 'en' ? 'Login' : 'تسجيل الدخول')}
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
            {locale === 'en' ? "Don't have an account?" : 'ليس لديك حساب؟'}{' '}
            <Link href={`/${locale}/sign-up`} className="text-primary-600 hover:text-primary-500 font-medium">
              {locale === 'en' ? 'Register' : 'التسجيل'}
            </Link>
          </div>

          <div className="mt-2 text-center text-sm">
            <Link href={`/${locale}/auth/forgot-password`} className="text-primary-600 hover:text-primary-500">
              {locale === 'en' ? 'Forgot password?' : 'نسيت كلمة المرور؟'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
