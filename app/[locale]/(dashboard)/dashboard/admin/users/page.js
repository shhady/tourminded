import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const metadata = {
  title: 'Admin Users | Watermelon Tours',
  description: 'View and manage users',
};

export default async function AdminUsersPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect(`/${locale}/sign-in`);
    return null;
  }

  await connectDB();
  const admin = await User.findOne({ clerkId: clerkUser.id });
  if (!admin || admin.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
    return null;
  }

  const users = await User.find({}).sort({ createdAt: -1 }).lean();

  const formatDate = (date) => new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">{locale === 'en' ? 'Users' : 'المستخدمون'}</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Name' : 'الاسم'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Role' : 'الدور'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Joined' : 'تاريخ الانضمام'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-100">
              {users.map(u => (
                <tr key={u._id}>
                  <td className="px-6 py-4 text-sm text-secondary-900">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-secondary-700">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-secondary-700">{u.role}</td>
                  <td className="px-6 py-4 text-sm text-secondary-700">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-secondary-100">
          {users.map(u => (
            <div key={u._id} className="p-4">
              <div className="font-semibold text-secondary-900">{u.name}</div>
              <div className="text-sm text-secondary-700">{u.email}</div>
              <div className="text-sm text-secondary-700 mt-1">{locale === 'en' ? 'Role:' : 'الدور:'} {u.role}</div>
              <div className="text-xs text-secondary-500 mt-1">{formatDate(u.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


