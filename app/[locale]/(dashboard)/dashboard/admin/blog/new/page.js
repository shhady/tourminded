import React from 'react';
import BlogForm from '@/components/dashboard/admin/BlogForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CreateBlogPage({ params }) {
  const { locale } = await params;
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit">
        <Link href={`/${locale}/dashboard/admin/blog`} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog List</span>
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
        <p className="text-gray-600 mt-2">Write a new blog post for the website.</p>
      </div>

      <BlogForm />
    </div>
  );
}
