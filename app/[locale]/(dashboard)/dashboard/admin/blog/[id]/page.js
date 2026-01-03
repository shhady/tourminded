import React from 'react';
import BlogForm from '@/components/dashboard/admin/BlogForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { notFound } from 'next/navigation';

async function getBlog(id) {
  try {
    await connectDB();
    const blog = await Blog.findById(id);
    if (!blog) return null;
    return JSON.parse(JSON.stringify(blog));
  } catch (error) {
    return null;
  }
}

export default async function EditBlogPage({ params }) {
  const { id, locale } = await params;
  const blog = await getBlog(id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit">
        <Link href={`/${locale}/dashboard/admin/blog`} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog List</span>
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
        <p className="text-gray-600 mt-2">Edit existing blog post.</p>
      </div>

      <BlogForm initialData={blog} isEdit={true} />
    </div>
  );
}
