import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Faq from '@/models/Faq';
import AdminFaqManager from '@/components/admin/AdminFaqManager';

export const metadata = {
  title: 'Admin FAQ | Watermelon Tours',
  description: 'Manage FAQ entries for Watermelon Tours',
};

export default async function AdminFaqPage({ params }) {
  const session = await getServerSession(authOptions);
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
    return null;
  }

  await connectDB();
  const user =
    (await User.findById(session.user.id)) ||
    (await User.findOne({ email: session.user.email }));

  if (!user || user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
    return null;
  }

  const faqs = await Faq.find().sort({ order: 1, createdAt: -1 }).lean();

  const serializedFaqs = faqs.map((f) => ({
    _id: f._id.toString(),
    question: f.question,
    answer: f.answer,
    order: typeof f.order === 'number' ? f.order : 0,
    createdAt: f.createdAt?.toISOString?.() || null,
    updatedAt: f.updatedAt?.toISOString?.() || null,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AdminFaqManager initialFaqs={serializedFaqs} />
      </div>
    </div>
  );
}

