'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Lock, ArrowLeft } from 'lucide-react';

export default function AdminSetPasswordPage({ params }) {
  const [unwrapped, setUnwrapped] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const p = await params;
      setUnwrapped(p);
    })();
  }, [params]);

  const locale = unwrapped?.[ 'locale' ] || 'en';
  const userId = unwrapped?.[ 'id' ];

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/users/${userId}`, { cache: 'no-store' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to load user');
        }
        const data = await res.json();
        setUser(data.user || data);
      } catch (e) {
        setError(e.message || 'Failed to load user.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, locale]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || password.length < 8) {
      setError(locale === 'en' ? 'Password must be at least 8 characters.' : 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.');
      return;
    }
    if (password !== confirm) {
      setError(locale === 'en' ? 'Passwords do not match.' : 'كلمات المرور غير متطابقة.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || (locale === 'en' ? 'Failed to update password.' : 'فشل تحديث كلمة المرور.'));
      }
      setSuccess(locale === 'en' ? 'Password has been set/updated successfully.' : 'تم تعيين/تحديث كلمة المرور بنجاح.');
      setPassword('');
      setConfirm('');
    } catch (e) {
      setError(e.message || (locale === 'en' ? 'Failed to update password.' : 'فشل تحديث كلمة المرور.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout locale={locale}>
        <div className="max-w-3xl mx-auto py-12">
          <div className="text-center text-secondary-700">Loading…</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout locale={locale}>
      <div className="max-w-3xl mx-auto py-10">
        <button
          onClick={() => router.push(`/${locale}/dashboard/admin/users`)}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {locale === 'en' ? 'Back to Users' : 'العودة إلى المستخدمين'}
        </button>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <Lock className="w-6 h-6 text-primary-600 mr-2" />
            <h1 className="text-2xl font-semibold text-secondary-900">
              {locale === 'en' ? 'Set / Change User Password' : 'تعيين / تغيير كلمة مرور المستخدم'}
            </h1>
          </div>

          {user && (
            <div className="mb-6 text-secondary-800">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-secondary-600">{user.email}</div>
            </div>
          )}

          {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>}
          {success && <div className="mb-4 p-3 rounded bg-green-100 text-green-700">{success}</div>}

          <form onSubmit={onSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'New Password' : 'كلمة المرور الجديدة'}
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={locale === 'en' ? 'Enter new password (min 8 chars)' : 'أدخل كلمة مرور جديدة (8 أحرف على الأقل)'}
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {locale === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={locale === 'en' ? 'Re-enter new password' : 'أعد إدخال كلمة المرور الجديدة'}
                minLength={8}
                required
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-60"
              >
                {saving ? (locale === 'en' ? 'Saving…' : 'جاري الحفظ…') : (locale === 'en' ? 'Save Password' : 'حفظ كلمة المرور')}
              </button>
            </div>
          </form>

          <p className="text-xs text-secondary-500 mt-4">
            {locale === 'en'
              ? 'If the user had no password (Google Sign-In), this will create one so they can also log in with email/password.'
              : 'إذا لم يكن لدى المستخدم كلمة مرور (تسجيل دخول عبر Google)، فسيؤدي ذلك إلى إنشاء واحدة حتى يتمكن من تسجيل الدخول بالبريد وكلمة المرور.'}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}


