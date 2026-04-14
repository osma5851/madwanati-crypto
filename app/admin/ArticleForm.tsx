"use client";

import { useState, useEffect } from "react";
import { Article, CATEGORIES } from "@/lib/types";

interface Props {
  article?: Article | null;
  onSave: (data: Partial<Article>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ArticleForm({ article, onSave, onCancel, loading }: Props) {
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [category, setCategory] = useState(article?.category || "تعليم");
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [author, setAuthor] = useState(article?.author_name || "مجهول");
  const [featured, setFeatured] = useState(article?.featured || false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const isEditing = !!article;

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0600-\u06FF-]/g, "")
        .substring(0, 60) +
        "-" +
        Date.now();

    onSave({
      title,
      slug: generatedSlug,
      excerpt: excerpt || content.substring(0, 200).replace(/[#*>\-\n]/g, "").trim(),
      content,
      category,
      tags,
      author_name: author,
      featured,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "تعديل المقالة" : "مقالة جديدة"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditing ? `تعديل: ${article.title}` : "أنشئ مقالة جديدة لمدونتك"}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          رجوع
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                عنوان المقالة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنواناً جذاباً للمقالة..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                dir="rtl"
                required
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الملخص
                <span className="text-gray-400 font-normal mr-1">(يظهر في قائمة المقالات)</span>
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="اكتب ملخصاً قصيراً يشجع القراء على القراءة..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none text-sm"
                dir="rtl"
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    activeTab === "edit"
                      ? "text-teal-600 border-b-2 border-teal-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  تحرير
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    activeTab === "preview"
                      ? "text-teal-600 border-b-2 border-teal-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  معاينة
                </button>
                <div className="flex-1 flex items-center justify-end px-4">
                  <span className="text-xs text-gray-400">يدعم Markdown</span>
                </div>
              </div>

              <div className="p-5">
                {activeTab === "edit" ? (
                  <>
                    {/* Markdown toolbar */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {[
                        { label: "H1", action: () => setContent((c) => c + "\n# ") },
                        { label: "H2", action: () => setContent((c) => c + "\n## ") },
                        { label: "H3", action: () => setContent((c) => c + "\n### ") },
                        { label: "**B**", action: () => setContent((c) => c + "**نص غامق**") },
                        { label: "*I*", action: () => setContent((c) => c + "*نص مائل*") },
                        { label: "❝", action: () => setContent((c) => c + "\n> اقتباس هنا") },
                        { label: "—", action: () => setContent((c) => c + "\n- عنصر القائمة") },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={btn.action}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-mono"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="اكتب محتوى المقالة هنا... يدعم Markdown&#10;&#10;# عنوان رئيسي&#10;## عنوان فرعي&#10;**نص غامق** *نص مائل*&#10;> اقتباس&#10;- قائمة"
                      rows={20}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-y font-mono text-sm leading-relaxed"
                      dir="rtl"
                      required
                    />
                  </>
                ) : (
                  <div className="min-h-64 p-4 bg-gray-50 rounded-xl">
                    {content ? (
                      <div className="prose-arabic text-sm" dir="rtl">
                        <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }} />
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-8">لا يوجد محتوى للمعاينة</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Publish Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">النشر</h3>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-all"
                >
                  {loading
                    ? "جاري الحفظ..."
                    : isEditing
                    ? "حفظ التغييرات"
                    : "نشر المقالة"}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full border border-gray-200 text-gray-600 font-medium py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>

              {/* Featured Toggle */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-11 h-6 rounded-full transition-all duration-200 ${
                      featured ? "bg-amber-400" : "bg-gray-200"
                    } relative`}
                    onClick={() => setFeatured(!featured)}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                        featured ? "right-1" : "left-1"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">مقالة مميزة</div>
                    <div className="text-xs text-gray-400">تظهر في قسم المميزات</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">التصنيف</h3>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-center ${
                      category === cat
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">الوسوم</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="أضف وسماً..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors text-sm"
                >
                  +
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Author */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">الكاتب</h3>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                dir="rtl"
              />
            </div>

            {/* Slug (optional advanced) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">الرابط المخصص</h3>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="سيتم إنشاؤه تلقائياً"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 text-gray-500"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
