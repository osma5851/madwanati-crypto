"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import ArticleForm from "./ArticleForm";
import DashboardPanel from "./DashboardPanel";
import SettingsPanel from "./SettingsPanel";
import AiToolsPanel from "./AiToolsPanel";

interface Props {
  articles: Article[];
}

type View = "dashboard" | "articles" | "new-article" | "edit-article" | "settings" | "ai-tools";

const sidebarItems: { key: View; label: string; icon: string }[] = [
  { key: "dashboard", label: "لوحة التحكم", icon: "📊" },
  { key: "articles", label: "المقالات", icon: "📄" },
  { key: "new-article", label: "مقالة جديدة", icon: "✏️" },
  { key: "settings", label: "الإعدادات", icon: "⚙️" },
  { key: "ai-tools", label: "أدوات AI", icon: "🤖" },
];

export default function AdminClient({ articles: initialArticles }: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [view, setView] = useState<View>("dashboard");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      } else showToast("فشل حذف المقالة", "error");
    } catch { showToast("حدث خطأ", "error"); }
    finally { setLoading(false); }
  };

  const handleSave = async (data: Partial<Article>) => {
    setLoading(true);
    try {
      if (editingArticle) {
        const res = await fetch(`/api/articles/${editingArticle.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        if (res.ok) {
          const { article } = await res.json();
          setArticles((prev) => prev.map((a) => (a.id === article.id ? article : a)));
          showToast("تم تحديث المقالة بنجاح");
          setView("articles"); setEditingArticle(null);
        } else showToast("فشل تحديث المقالة", "error");
      } else {
        const res = await fetch("/api/articles", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        if (res.ok) {
          const { article } = await res.json();
          setArticles((prev) => [article, ...prev]);
          showToast("تم إنشاء المقالة بنجاح");
          setView("articles");
        } else { const err = await res.json(); showToast(err.error || "فشل إنشاء المقالة", "error"); }
      }
    } catch { showToast("حدث خطأ", "error"); }
    finally { setLoading(false); }
  };

  const handleAiCreateArticle = (data: { title: string; content: string; category: string; tags: string[] }) => {
    setEditingArticle(null);
    setView("new-article");
    // We pass pre-filled data via a timeout to let the form mount first
    setTimeout(() => {
      const event = new CustomEvent("ai-prefill", { detail: data });
      window.dispatchEvent(event);
    }, 100);
  };

  const filteredArticles = articles.filter(
    (a) => !searchQuery || a.title.includes(searchQuery) || a.category.includes(searchQuery)
  );

  const activeView = view === "edit-article" ? "articles" : view;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f172a', color: '#f1f5f9' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
          padding: '0.65rem 1.5rem', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: '0.85rem',
          background: toast.type === "success" ? '#14b8a6' : '#ef4444',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 60,
        background: '#111827',
        borderLeft: '1px solid rgba(30,58,95,0.6)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(30,58,95,0.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', flexShrink: 0,
          }}>₿</div>
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f59e0b' }}>مدونات الكريبتو</span>}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '0.5rem' }}>
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setView(item.key); setEditingArticle(null); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: sidebarOpen ? '0.6rem 0.75rem' : '0.6rem',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                marginBottom: 2,
                background: activeView === item.key ? 'rgba(245,158,11,0.1)' : 'transparent',
                color: activeView === item.key ? '#f59e0b' : '#64748b',
                fontWeight: activeView === item.key ? 700 : 500,
                fontSize: '0.85rem', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(30,58,95,0.4)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '100%', padding: '0.5rem', borderRadius: 8,
              background: 'rgba(30,58,95,0.3)', border: 'none',
              color: '#64748b', cursor: 'pointer', fontSize: '0.8rem',
            }}
          >
            {sidebarOpen ? "→ تصغير" : "←"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid rgba(30,58,95,0.6)',
          background: '#0f172a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0' }}>
              {sidebarItems.find((s) => s.key === activeView)?.icon}{" "}
              {sidebarItems.find((s) => s.key === activeView)?.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              href="/" target="_blank"
              style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: 8, background: 'rgba(30,58,95,0.3)' }}
            >
              👁 عرض الموقع
            </Link>
            <button
              onClick={handleLogout}
              style={{ fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer' }}
            >
              خروج
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>

          {/* Dashboard */}
          {view === "dashboard" && (
            <DashboardPanel articles={articles} onNavigate={(v) => setView(v as View)} />
          )}

          {/* Articles List */}
          {view === "articles" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>المقالات</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث..."
                    dir="rtl"
                    style={{
                      padding: '0.45rem 0.75rem', background: '#1e293b',
                      border: '1px solid rgba(30,58,95,0.8)', color: '#e2e8f0',
                      borderRadius: 8, fontSize: '0.8rem', outline: 'none', width: 200,
                    }}
                  />
                  <button
                    onClick={() => { setEditingArticle(null); setView("new-article"); }}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#0f172a', fontWeight: 700, fontSize: '0.8rem',
                      padding: '0.45rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                    }}
                  >
                    + جديدة
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: '#1e293b', border: '1px solid rgba(30,58,95,0.8)', borderRadius: 16, overflow: 'hidden' }}>
                {filteredArticles.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center', color: '#475569' }}>لا توجد مقالات</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(30,58,95,0.6)', background: 'rgba(15,23,42,0.5)' }}>
                        <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>العنوان</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>التصنيف</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>التاريخ</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>مميزة</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArticles.map((article, i) => (
                        <tr key={article.id} style={{ borderBottom: i < filteredArticles.length - 1 ? '1px solid rgba(30,58,95,0.3)' : 'none' }}>
                          <td style={{ padding: '0.7rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{article.title}</div>
                          </td>
                          <td style={{ padding: '0.7rem 1rem' }}>
                            <span style={{ background: 'rgba(20,184,166,0.1)', color: '#5eead4', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 20 }}>{article.category}</span>
                          </td>
                          <td style={{ padding: '0.7rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>{formatDate(article.publishedAt)}</td>
                          <td style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>
                            {article.featured ? <span style={{ color: '#f59e0b' }}>⭐</span> : <span style={{ color: '#334155' }}>—</span>}
                          </td>
                          <td style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                              <button onClick={() => { setEditingArticle(article); setView("edit-article"); }} style={{ padding: '4px 8px', background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>تعديل</button>
                              <button onClick={() => setDeleteConfirm(article.id)} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>حذف</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* New / Edit Article */}
          {(view === "new-article" || view === "edit-article") && (
            <ArticleForm
              article={editingArticle}
              onSave={handleSave}
              onCancel={() => { setView("articles"); setEditingArticle(null); }}
              loading={loading}
            />
          )}

          {/* Settings */}
          {view === "settings" && <SettingsPanel onToast={showToast} />}

          {/* AI Tools */}
          {view === "ai-tools" && <AiToolsPanel onCreateArticle={handleAiCreateArticle} onToast={showToast} />}

        </main>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
        }}>
          <div style={{
            background: '#1e293b', borderRadius: 20, padding: '2rem',
            maxWidth: 380, width: '100%', textAlign: 'center',
            border: '1px solid rgba(30,58,95,0.8)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>حذف المقالة؟</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 24 }}>هذا الإجراء لا يمكن التراجع عنه</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '0.6rem', border: '1px solid rgba(30,58,95,0.8)', background: 'transparent', color: '#94a3b8', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={loading} style={{ flex: 1, padding: '0.6rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
                {loading ? "جاري الحذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
