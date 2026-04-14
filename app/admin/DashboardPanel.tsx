"use client";

import { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  articles: Article[];
  onNavigate: (view: string) => void;
}

export default function DashboardPanel({ articles, onNavigate }: Props) {
  const stats = {
    total: articles.length,
    featured: articles.filter((a) => a.featured).length,
    categories: [...new Set(articles.map((a) => a.category))].length,
  };

  const recentArticles = articles.slice(0, 5);

  const statCards = [
    { label: "إجمالي المقالات", value: stats.total, color: "#14b8a6", icon: "📄" },
    { label: "مقالات مميزة", value: stats.featured, color: "#f59e0b", icon: "⭐" },
    { label: "التصنيفات", value: stats.categories, color: "#8b5cf6", icon: "📂" },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>لوحة التحكم</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>مرحباً بك في لوحة إدارة مدونات الكريبتو</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#1e293b',
              border: '1px solid rgba(30,58,95,0.8)',
              borderRadius: 16,
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${stat.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <button
          onClick={() => onNavigate("new-article")}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#0f172a', fontWeight: 700, fontSize: '0.85rem',
            padding: '0.6rem 1.2rem', borderRadius: 10, border: 'none', cursor: 'pointer',
          }}
        >
          + مقالة جديدة
        </button>
        <button
          onClick={() => onNavigate("ai-tools")}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff', fontWeight: 600, fontSize: '0.85rem',
            padding: '0.6rem 1.2rem', borderRadius: 10, border: 'none', cursor: 'pointer',
          }}
        >
          🤖 أدوات الذكاء الاصطناعي
        </button>
        <button
          onClick={() => onNavigate("settings")}
          style={{
            background: 'rgba(30,58,95,0.5)',
            color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem',
            padding: '0.6rem 1.2rem', borderRadius: 10, border: '1px solid rgba(30,58,95,0.8)', cursor: 'pointer',
          }}
        >
          ⚙️ إعدادات الموقع
        </button>
      </div>

      {/* Recent Articles */}
      <div style={{
        background: '#1e293b', border: '1px solid rgba(30,58,95,0.8)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(30,58,95,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>آخر المقالات</h2>
          <button
            onClick={() => onNavigate("articles")}
            style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            عرض الكل →
          </button>
        </div>
        {recentArticles.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
            لا توجد مقالات بعد
          </div>
        ) : (
          recentArticles.map((article, i) => (
            <div
              key={article.id}
              style={{
                padding: '0.75rem 1.25rem',
                borderBottom: i < recentArticles.length - 1 ? '1px solid rgba(30,58,95,0.4)' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {article.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>
                  {article.category} • {formatDate(article.publishedAt)}
                </div>
              </div>
              {article.featured && (
                <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                  مميزة
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
