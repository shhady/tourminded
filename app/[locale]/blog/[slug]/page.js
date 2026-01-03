import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Calendar, User, Clock, Share2, ArrowRight } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { notFound } from 'next/navigation';
import { sanitizeHtml } from '@/lib/sanitize';

async function getBlogPost(slug) {
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug, isPublished: true });
    if (!blog) return null;
    
    // Increment views
    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });
    
    return JSON.parse(JSON.stringify(blog));
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.mainImage ? [{ url: post.mainImage }] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const { slug, locale } = resolvedParams;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sanitizedContent = sanitizeHtml(post.content);

  return (
    <MainLayout locale={locale}>
      <article className="pb-20">
        {/* Header/Hero */}
        <div className="relative h-[400px] w-full bg-secondary-900">
            {post.mainImage && (
                <Image
                src={post.mainImage}
                alt={post.title}
                fill
                className="object-cover opacity-60"
                priority
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12 text-white">
                <Link 
                href={`/${locale}/blog`}
                className="inline-flex items-center text-secondary-200 hover:text-white mb-6 transition-colors"
                >
                <ArrowRight className={`w-4 h-4 ${locale === 'en' ? 'rotate-180 mr-2' : 'ml-2'}`} />
                {locale === 'en' ? 'Back to Blog' : 'عودة للمدونة'}
                </Link>
                
                <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4 leading-tight max-w-4xl">
                {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-secondary-200">
                {/* <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{locale === 'en' ? 'Admin' : 'المشرف'}</span>
                </div> */}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.createdAt)}</span>
                </div>
                {/* {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{post.tags[0]}</span>
                    </div>
                )} */}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-secondary-100">
                        {/* Excerpt */}
                        <div className="text-xl md:text-2xl font-serif italic text-secondary-700 mb-8 pb-8 border-b border-secondary-100 leading-relaxed">
                            {post.excerpt}
                        </div>

                        {/* Rich Text Content */}
                        <div 
                            className="prose prose-lg max-w-none text-secondary-800 
                            prose-headings:text-secondary-900 prose-headings:font-bold prose-headings:font-heading
                            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-xl prose-img:shadow-md
                            prose-strong:text-secondary-900"
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                {/* <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-100">
                        <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            {locale === 'en' ? 'Share this article' : 'شارك هذا المقال'}
                        </h3>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-[#1877F2] text-white rounded hover:opacity-90 transition-opacity text-sm font-medium">Facebook</button>
                            <button className="flex-1 py-2 bg-[#1DA1F2] text-white rounded hover:opacity-90 transition-opacity text-sm font-medium">Twitter</button>
                            <button className="flex-1 py-2 bg-[#25D366] text-white rounded hover:opacity-90 transition-opacity text-sm font-medium">WhatsApp</button>
                        </div>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-100">
                            <h3 className="text-lg font-bold text-secondary-900 mb-4">
                                {locale === 'en' ? 'Tags' : 'الوسوم'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-secondary-50 text-secondary-700 text-sm rounded-full border border-secondary-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div> */}
            </div>
        </div>
      </article>
    </MainLayout>
  );
}
