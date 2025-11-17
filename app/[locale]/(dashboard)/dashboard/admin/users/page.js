import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const metadata = {
  title: 'Admin Users | Watermelon Tours',
  description: 'View and manage users',
};

export default async function AdminUsersPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
    return null;
  }

  await connectDB();
  const admin = await User.findById(session.user.id) || await User.findOne({ email: session.user.email });
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
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Actions' : 'إجراءات'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-100">
              {users.map(u => (
                <tr key={u._id}>
                  <td className="px-6 py-4 text-sm text-secondary-900">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-secondary-700">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-secondary-700">{u.role}</td>
                  <td className="px-6 py-4 text-sm text-secondary-700">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={`/${locale}/dashboard/admin/users/${u._id}/password`}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-black text-white hover:bg-gray-800"
                    >
                      {locale === 'en' ? 'Set/Change Password' : 'تعيين/تغيير كلمة المرور'}
                    </a>
                  </td>
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
              <div className="mt-3">
                <a
                  href={`/${locale}/dashboard/admin/users/${u._id}/password`}
                  className="inline-flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  {locale === 'en' ? 'Set/Change Password' : 'تعيين/تغيير كلمة المرور'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


