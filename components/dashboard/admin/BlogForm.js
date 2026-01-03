"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from 'next/dynamic';
import ImageUploader from '@/components/ui/ImageUploader';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function BlogForm({ initialData = {}, isEdit = false }) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    slug: initialData.slug || "",
    content: initialData.content || "",
    excerpt: initialData.excerpt || "",
    tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : (initialData.tags || ""),
    isPublished: initialData.isPublished || false,
    seoTitle: initialData.seoTitle || "",
    seoDescription: initialData.seoDescription || "",
    mainImage: initialData.mainImage || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageUploaded = (url) => {
    setFormData((prev) => ({ ...prev, mainImage: url }));
  };

  const guideHtml = useMemo(() => {
    return `<h2>H2 Title</h2>
<p>This is a regular paragraph with <strong>bold text</strong> and a link <a href="/contact">Contact Us</a>.</p>
<h3>H3 Title</h3>
<ul>
  <li>First Item</li>
  <li>Second Item</li>
</ul>`;
  }, []);

  const plainTextPrompts = useMemo(() => {
    return `The most effective way is to use one of the following requests:
1) "Please write an article about [topic] in Plain Text format, ready to copy and paste into a text document, without any code tags or formatting."
2) "Return the content on [topic] as raw text only."
3) "Write me about [topic] in clean text, without HTML or Markdown."`;
  }, []);

  const guideTemplateLiteral = useMemo(() => {
    return `\`${guideHtml}\``;
  }, [guideHtml]);

  useEffect(() => {
    if (!isGuideOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsGuideOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isGuideOpen]);

  const copyTemplateLiteral = async () => {
    try {
      await navigator.clipboard.writeText(guideTemplateLiteral);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  };

  const copyForEditor = async () => {
    try {
      if (typeof window !== "undefined" && "ClipboardItem" in window && navigator.clipboard?.write) {
        const htmlBlob = new Blob([guideHtml], { type: "text/html" });
        const textBlob = new Blob([guideHtml], { type: "text/plain" });
        // eslint-disable-next-line no-undef
        const item = new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(guideHtml);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  };

  const copyPlainTextPrompts = async () => {
    try {
      await navigator.clipboard.writeText(plainTextPrompts);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  };

  const generateSlug = () => {
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0590-\u05FF\s-]/g, "") // Allow Hebrew/Arabic chars + alphanumeric
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
      
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const processedData = {
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || formData.excerpt,
      };

      const url = isEdit
        ? `/api/blogs/${initialData._id}`
        : "/api/blogs";
      
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const json = await res.json();
      if (json.success) {
        router.push(`/${locale}/dashboard/admin/blog`);
        router.refresh();
      } else {
        setError(json.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean'],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }]
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image', 'direction', 'align'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div>
          <p className="text-sm font-bold text-gray-800">Form Guide</p>
          <p className="text-xs text-gray-600 mt-1">
            Includes SEO + how to write/paste content correctly so headers (H1/H2/H3) work.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsGuideOpen(true)}
          className="w-full md:w-auto rounded-xl bg-[#183417] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#90a955] hover:text-[#183417] transition-colors"
        >
          Open Guide
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Article Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter title..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-[#183417] focus:ring-1 focus:ring-[#183417]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex justify-between">
            <span>Slug (URL)</span>
            <button type="button" onClick={generateSlug} className="text-xs text-[#90a955] hover:underline">
              Generate automatically from title
            </button>
          </label>
          <input
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="my-new-blog-post"
            className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-[#183417] focus:ring-1 focus:ring-[#183417]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Content</label>
        <div className="bg-white text-gray-900">
            <ReactQuill 
                theme="snow" 
                value={formData.content} 
                onChange={handleContentChange} 
                modules={modules}
                formats={formats}
                className="h-64 mb-12"
            />
        </div>
      </div>

      {isGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Blog Writing Guide"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsGuideOpen(false);
          }}
        >
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white text-left shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="relative border-b border-white/10 bg-linear-to-l from-[#183417] to-[#132a13] px-6 py-5 text-white">
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-lg text-white hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
              <h2 className="text-xl md:text-2xl font-extrabold">Guide to Uploading an Article (Simple and Clear)</h2>
              <p className="mt-1 text-sm text-white/85 leading-relaxed">
                Most importantly: If you are working with AI — ask it to return <span className="font-bold">Plain Text</span> without HTML/Markdown.
              </p>
            </div>

            {/* Body */}
            <div className="max-h-[75vh] overflow-y-auto px-6 py-6 space-y-5">
              {/* Steps */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-bold text-gray-900 mb-3">How to fill the form (5 steps)</h3>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-5">
                  <li><span className="font-bold">Title:</span> 6–12 words, clear and focused.</li>
                  <li><span className="font-bold">Slug:</span> Click &quot;Generate automatically from title&quot;.</li>
                  <li><span className="font-bold">Content:</span> Paste plain text into the editor and then (if needed) mark headers/lists via the toolbar.</li>
                  <li><span className="font-bold">Excerpt:</span> 1–2 sentences — this is also the default Google Description.</li>
                  <li><span className="font-bold">Tags:</span> 3–7 tags separated by commas.</li>
                </ol>
              </section>

              {/* Content / AI */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Article Content (The Important Part)</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      The best way: Ask the AI to write <span className="font-bold">Plain Text</span> — no HTML and no Markdown (no code blocks).
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={copyPlainTextPrompts}
                      className="rounded-xl bg-[#183417] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#90a955] hover:text-[#183417] transition-colors"
                    >
                      {copied ? "Copied!" : "Copy Prompt for AI (Plain Text)"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
                  <p className="font-bold mb-2">Copying with AI — Recommended Prompts</p>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 overflow-auto">
{plainTextPrompts}
                  </pre>
                </div>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Tip: After pasting plain text, you can highlight lines and turn them into H2/H3 via the editor toolbar to get large headers.
                </div>

                <details className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                  <summary className="cursor-pointer text-sm font-bold text-gray-900">
                    Advanced: Want headers/lists to arrive &quot;ready&quot; without manual formatting?
                  </summary>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      You can ask the AI to return the content in format:
                      {" "}
                      <span className="font-bold">HTML (HyperText Markup Language) wrapped in a JavaScript Template Literal</span>
                      .
                    </p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <button
                        type="button"
                        onClick={copyForEditor}
                        className="rounded-xl bg-[#183417] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#90a955] hover:text-[#183417] transition-colors"
                      >
                        {copied ? "Copied!" : "Copy HTML to paste in editor"}
                      </button>
                      <button
                        type="button"
                        onClick={copyTemplateLiteral}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-[#183417] hover:bg-gray-50"
                      >
                        Copy as Template Literal
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-bold text-gray-700 mb-2">Visual Display (How it should look)</p>
                        <div className="prose prose-sm max-w-none text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-900 prose-li:text-gray-900 prose-a:text-[#90a955]" dangerouslySetInnerHTML={{ __html: guideHtml }} />
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-bold text-gray-700 mb-2">Example (Template Literal)</p>
                        <pre className="text-xs text-gray-900 whitespace-pre overflow-x-auto">
{guideTemplateLiteral}
                        </pre>
                        <p className="mt-2 text-xs text-gray-500">
                          In the editor itself, paste only the HTML (what&apos;s between the backticks), without the <span className="font-mono">`</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </details>
              </section>

              {/* SEO */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-bold text-gray-900 mb-3">SEO (For those who don&apos;t know — simply put)</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-800">SEO Title</p>
                    <p className="mt-1 text-sm text-gray-600">The title that appears in Google. If left empty — we&apos;ll use the article title.</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-800">SEO Description</p>
                    <p className="mt-1 text-sm text-gray-600">The line below the title in Google. If left empty — we&apos;ll use the excerpt.</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  If unsure — just fill in a good title + excerpt, and leave advanced SEO empty.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Excerpt (Meta Description)</label>
        <textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          required
          rows={3}
          placeholder="Short description that appears in search results..."
          className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-[#183417] focus:ring-1 focus:ring-[#183417]"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Main Image (Optional)</label>
            <div className="flex flex-col gap-2">
              <ImageUploader 
                onImageUploaded={handleImageUploaded}
                label="Upload Image"
                folder="blog-images"
                showPreview={true}
              />
              <input
                  name="mainImage"
                  value={formData.mainImage}
                  onChange={handleChange}
                  placeholder="Or enter URL: /hero1.jpg or https://..."
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-[#183417] focus:ring-1 focus:ring-[#183417]"
              />
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Tags (separated by comma)</label>
            <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Tag1, Tag2, Tag3"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-[#183417] focus:ring-1 focus:ring-[#183417]"
            />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Advanced SEO Settings (Optional)</h3>
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">SEO Title (if different from title)</label>
                <input
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleChange}
                    placeholder="Default: Article Title"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-[#183417] focus:ring-1 focus:ring-[#183417]"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">SEO Description (if different from excerpt)</label>
                <input
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleChange}
                    placeholder="Default: Excerpt"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-[#183417] focus:ring-1 focus:ring-[#183417]"
                />
            </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-6">
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 text-[#183417] focus:ring-[#183417]"
            />
            <span className="font-bold text-gray-700">Publish immediately to site</span>
        </label>
        <div className="flex gap-4">
            <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-[#183417] text-white hover:bg-[#90a955] hover:text-[#183417] font-bold disabled:opacity-50 transition-colors"
            >
                {loading ? "Saving..." : isEdit ? "Update Article" : "Create New Article"}
            </button>
        </div>
      </div>
    </form>
  );
}
