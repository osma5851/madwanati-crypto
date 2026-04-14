"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import ArticleForm from "./ArticleForm";

interface Props {
  articles: Article[];
}

export default function AdminClient({ articles: initialArticles }: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setDeleteConfirm(null);
        showToast("تم حذف المقالة بنجاح");
      } else {
        showToast("فشل حذف المقالة", "error");
      }
    } catch {
      showToast("حدث خطأ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Article>) => {
    setLoading(true);
    try {
      if (editingArticle) {
        // Update
        const res = await fetch(`/api/articles/${editingArticle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const { article } = await res.json();
          setArticles((prev) => prev.map((a) => (a.id === article.id ? article : a)));
          showToast("تم تحديث المقالة بنجاح");
          setView("list");
          setEditingArticle(null);
        } else {
          showToast("فشل تحديث المقالة", "error");
        }
      } else {
        // Create
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const { article } = await res.json();
          setArticles((prev) => [article, ...prev]);
          showToast("تم إنشاء المقالة بنجاح");
          setView("list");
        } else {
          const err = await res.json();
          showToast(err.error || "فشل إنشاء المقالة", "error");
        }
      }
    } catch {
      showToast("حدث خطأ", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: articles.length,
    featured: articles.filter((a) => a.featured).length,
    categories: [...new Set(articles.map((a) => a.category))].length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium text-sm transition-all ${
            toast.type === "success" ? "bg-teal-600" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">م</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">لوحة التحكم</span>
              <span className="text-gray-400 text-xs mx-2">•</span>
              <span className="text-gray-500 text-sm">مدونتي</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-teal-600 transition-colors px-3 py-1.5 hover:bg-teal-50 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              عرض المدونة
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 hover:bg-red-50 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === "list" ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <div className="text-3xl font-black text-teal-600 mb-1">{stats.total}</div>
                <div className="text-gray-500 text-sm">إجمالي المقالات</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <div className="text-3xl font-black text-amber-500 mb-1">{stats.featured}</div>
                <div className="text-gray-500 text-sm">مقالات مميزة</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <div className="text-3xl font-black text-purple-500 mb-1">{stats.categories}</div>
                <div className="text-gray-500 text-sm">التصنيفات</div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في المقالات..."
                  className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  dir="rtl"
                />
              </div>
              <button
                onClick={() => {
                  setEditingArticle(null);
                  setView("create");
                }}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                مقالة جديدة
              </button>
            </div>

            {/* Articles Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  لا توجد مقالات
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-right text-gray-500 font-semibold px-5 py-3">العنوان</th>
                        <th className="text-right text-gray-500 font-semibold px-5 py-3 hidden md:table-cell">التصنيف</th>
                        <th className="text-right text-gray-500 font-semibold px-5 py-3 hidden lg:table-cell">التاريخ</th>
                        <th className="text-right text-gray-500 font-semibold px-5 py-3 hidden md:table-cell">مميزة</th>
                        <th className="text-right text-gray-500 font-semibold px-5 py-3">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArticles.map((article) => (
                        <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-medium text-gray-900 line-clamp-1">{article.title}</div>
                            <div className="text-gray-400 text-xs mt-0.5 line-clamp-1">{article.excerpt}</div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full font-medium">
                              {article.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-500 text-xs hidden lg:table-cell">
                            {formatDate(article.publishedAt)}
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            {article.featured ? (
                              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">نعم</span>
                            ) : (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/articles/${article.slug}`}
                                target="_blank"
                                className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title="عرض"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>
                              <button
                                onClick={() => {
                                  setEditingArticle(article);
                                  setView("edit");
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(article.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <ArticleForm
            article={editingArticle}
            onSave={handleSave}
            onCancel={() => {
              setView("list");
              setEditingArticle(null);
            }}
            loading={loading}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">حذف المقالة؟</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد من حذف هذه المقالة؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "جاري الحذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
