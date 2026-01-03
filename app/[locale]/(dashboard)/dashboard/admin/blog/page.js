import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash, Eye, EyeOff } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { formatDate } from '@/lib/utils'; // Assuming this exists or I'll just format manually
import DeleteBlogButton from './DeleteBlogButton'; // Client component for delete action

// Helper to format date if utility doesn't exist
const formatDateHelper = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

async function getBlogs() {
  await connectDB();
  const blogs = await Blog.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(blogs));
}

export default async function AdminBlogPage({ params }) {
  const { locale } = await params;
  const blogs = await getBlogs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Create, edit, and manage blog posts.</p>
        </div>
        <Link 
          href={`/${locale}/dashboard/admin/blog/new`}
          className="flex items-center gap-2 px-4 py-2 bg-[#183417] text-white rounded-lg hover:bg-[#90a955] transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Create New Post
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-700">Image</th>
                <th className="p-4 font-semibold text-gray-700">Title</th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
                <th className="p-4 font-semibold text-gray-700">Date</th>
                <th className="p-4 font-semibold text-gray-700">Views</th>
                <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No blog posts found. Create your first one!
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 w-24">
                      {blog.mainImage ? (
                        <div className="relative w-16 h-12 rounded-md overflow-hidden">
                          <Image 
                            src={blog.mainImage} 
                            alt={blog.title} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-medium text-gray-900 truncate" title={blog.title}>{blog.title}</div>
                      <div className="text-xs text-gray-500 truncate" title={blog.slug}>/{blog.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDateHelper(blog.createdAt)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {blog.views || 0}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/${locale}/dashboard/admin/blog/${blog._id}`}
                          className="p-2 text-gray-500 hover:text-[#183417] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <DeleteBlogButton id={blog._id} title={blog.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
