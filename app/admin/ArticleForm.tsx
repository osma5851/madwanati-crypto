"use client";

import { useState, useEffect } from "react";
import { Article, CATEGORIES } from "@/lib/types";

interface Props {
  article?: Article | null;
  onSave: (data: Partial<Article>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOGE", "AVAX", "DOT", "MATIC"];

export default function ArticleForm({ article, onSave, onCancel, loading }: Props) {
  const [title, setTitle] = useState(article?.title || "");
  const [titleEn, setTitleEn] = useState(article?.title_en || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [excerptEn, setExcerptEn] = useState(article?.excerpt_en || "");
  const [content, setContent] = useState(article?.content || "");
  const [contentEn, setContentEn] = useState(article?.content_en || "");
  const [category, setCategory] = useState(article?.category || "تعليم");
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [authorName, setAuthorName] = useState(article?.author_name || "مجهول");
  const [featured, setFeatured] = useState(article?.featured || false);
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");
  const [cryptoSymbols, setCryptoSymbols] = useState<string[]>(article?.crypto_symbols || []);
  const [langTab, setLangTab] = useState<"ar" | "en">("ar");
  const [contentTab, setContentTab] = useState<"edit" | "preview">("edit");
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const isEditing = !!article;

  // Listen for AI prefill events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.title) setTitle(detail.title);
      if (detail.content) setContent(detail.content);
      if (detail.category) setCategory(detail.category);
      if (detail.tags) setTags(detail.tags);
    };
    window.addEventListener("ai-prefill", handler);
    return () => window.removeEventListener("ai-prefill", handler);
  }, []);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagInput("");
  };

  const toggleCryptoSymbol = (symbol: string) => {
    setCryptoSymbols((prev) => prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedSlug = slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u0600-\u06FF-]/g, "").substring(0, 60) + "-" + Date.now();
    onSave({
      title, title_en: titleEn || undefined,
      slug: generatedSlug,
      excerpt: excerpt || content.substring(0, 200).replace(/[#*>\-\n]/g, "").trim(),
      excerpt_en: excerptEn || undefined,
      content, content_en: contentEn || undefined,
      category, tags, author_name: authorName,
      featured, coverImage, crypto_symbols: cryptoSymbols,
    });
  };

  const handleAiAction = async (action: string) => {
    setAiLoading(action);
    try {
      let prompt = "";
      if (action === "excerpt") prompt = `Summarize this article in 2 sentences in Arabic:\n\n${content.substring(0, 2000)}`;
      else if (action === "tags") prompt = `Suggest 5 relevant tags (single words) for this crypto article. Return only comma-separated tags in Arabic:\n\n${content.substring(0, 1500)}`;
      else if (action === "translate") prompt = `Translate this Arabic article title and content to English. Return format:\nTITLE: [english title]\n---\n[english content]\n\nArabic title: ${title}\n\nArabic content:\n${content.substring(0, 3000)}`;

      const res = await fetch("/api/ai/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) return;
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let text = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) text += decoder.decode(value, { stream: true });
      }

      if (action === "excerpt") setExcerpt(text.trim());
      else if (action === "tags") {
        const newTags = text.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5);
        setTags((prev) => [...new Set([...prev, ...newTags])]);
      } else if (action === "translate") {
        const titleMatch = text.match(/TITLE:\s*(.+)/);
        if (titleMatch) setTitleEn(titleMatch[1].trim());
        const contentParts = text.split("---");
        if (contentParts[1]) setContentEn(contentParts[1].trim());
      }
    } catch { /* silent */ }
    finally { setAiLoading(null); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.85rem',
    background: '#0f172a', border: '1px solid rgba(30,58,95,0.8)',
    color: '#e2e8f0', borderRadius: 10, fontSize: '0.875rem', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6,
  };

  const cardStyle: React.CSSProperties = {
    background: '#1e293b', border: '1px solid rgba(30,58,95,0.8)', borderRadius: 16, padding: '1.25rem', marginBottom: 16,
  };

  const aiBtn = (action: string, label: string, color: string) => (
    <button
      type="button" onClick={() => handleAiAction(action)} disabled={!!aiLoading}
      style={{
        fontSize: '0.7rem', padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
        background: `${color}20`, color, fontWeight: 600, opacity: aiLoading ? 0.5 : 1,
      }}
    >
      {aiLoading === action ? "..." : `🤖 ${label}`}
    </button>
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>{isEditing ? "تعديل المقالة" : "مقالة جديدة"}</h1>
          {isEditing && <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>تعديل: {article?.title}</p>}
        </div>
        <button type="button" onClick={onCancel} style={{ fontSize: '0.85rem', color: '#64748b', background: 'rgba(30,58,95,0.3)', border: 'none', padding: '0.4rem 1rem', borderRadius: 8, cursor: 'pointer' }}>← رجوع</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        {/* Main Column */}
        <div>
          {/* Language Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {(["ar", "en"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLangTab(l)} style={{
                padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: langTab === l ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: langTab === l ? '#f59e0b' : '#64748b', fontWeight: langTab === l ? 700 : 500, fontSize: '0.85rem',
              }}>
                {l === "ar" ? "العربية" : "English"}
              </button>
            ))}
            {content && aiBtn("translate", "ترجمة تلقائية", "#3b82f6")}
          </div>

          {/* Title */}
          <div style={cardStyle}>
            <label style={labelStyle}>{langTab === "ar" ? "عنوان المقالة *" : "Article Title (EN)"}</label>
            <input
              type="text"
              value={langTab === "ar" ? title : titleEn}
              onChange={(e) => langTab === "ar" ? setTitle(e.target.value) : setTitleEn(e.target.value)}
              placeholder={langTab === "ar" ? "أدخل عنواناً جذاباً..." : "Enter article title..."}
              style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: 700 }}
              dir={langTab === "ar" ? "rtl" : "ltr"}
              required={langTab === "ar"}
            />
          </div>

          {/* Excerpt */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>{langTab === "ar" ? "الملخص" : "Excerpt (EN)"}</label>
              {langTab === "ar" && content && aiBtn("excerpt", "إنشاء ملخص", "#f59e0b")}
            </div>
            <textarea
              value={langTab === "ar" ? excerpt : excerptEn}
              onChange={(e) => langTab === "ar" ? setExcerpt(e.target.value) : setExcerptEn(e.target.value)}
              placeholder={langTab === "ar" ? "ملخص قصير..." : "Short excerpt..."}
              rows={3} dir={langTab === "ar" ? "rtl" : "ltr"}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Content Editor */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(30,58,95,0.6)', padding: '0 1rem' }}>
              {(["edit", "preview"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setContentTab(t)} style={{
                  padding: '0.6rem 1rem', border: 'none', cursor: 'pointer', background: 'transparent',
                  color: contentTab === t ? '#f59e0b' : '#64748b', fontWeight: contentTab === t ? 700 : 500,
                  fontSize: '0.85rem', borderBottom: contentTab === t ? '2px solid #f59e0b' : '2px solid transparent',
                }}>
                  {t === "edit" ? "تحرير" : "معاينة"}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: '0.7rem', color: '#475569', alignSelf: 'center' }}>Markdown</span>
            </div>

            <div style={{ padding: '1rem' }}>
              {contentTab === "edit" ? (
                <>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                    {[
                      { label: "H1", md: "\n# " }, { label: "H2", md: "\n## " }, { label: "H3", md: "\n### " },
                      { label: "B", md: "**نص غامق**" }, { label: "I", md: "*نص مائل*" },
                      { label: "❝", md: "\n> اقتباس" }, { label: "—", md: "\n- " },
                      { label: "📊", md: "\n\n[TradingView: BTCUSDT]\n\n" },
                      { label: "🎬", md: "\n\n[YouTube: VIDEO_URL]\n\n" },
                    ].map((btn) => (
                      <button key={btn.label} type="button"
                        onClick={() => { const setter = langTab === "ar" ? setContent : setContentEn; setter((c) => c + btn.md); }}
                        style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'rgba(30,58,95,0.5)', color: '#94a3b8', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'monospace' }}
                      >{btn.label}</button>
                    ))}
                  </div>
                  <textarea
                    value={langTab === "ar" ? content : contentEn}
                    onChange={(e) => langTab === "ar" ? setContent(e.target.value) : setContentEn(e.target.value)}
                    placeholder={langTab === "ar" ? "اكتب المحتوى هنا..." : "Write content here..."}
                    rows={18} dir={langTab === "ar" ? "rtl" : "ltr"}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.8 }}
                    required={langTab === "ar"}
                  />
                </>
              ) : (
                <div style={{ minHeight: 300, padding: 12, background: '#0f172a', borderRadius: 10 }}>
                  {(langTab === "ar" ? content : contentEn) ? (
                    <div className="prose-arabic" dir={langTab === "ar" ? "rtl" : "ltr"} style={{ fontSize: '0.9rem' }}
                      dangerouslySetInnerHTML={{ __html: (langTab === "ar" ? content : contentEn).replace(/\n/g, "<br>") }}
                    />
                  ) : (
                    <p style={{ color: '#475569', textAlign: 'center', padding: 40 }}>لا يوجد محتوى للمعاينة</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Publish */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>النشر</h3>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '0.65rem', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a', fontWeight: 700,
              fontSize: '0.9rem', opacity: loading ? 0.6 : 1, marginBottom: 8,
            }}>
              {loading ? "جاري الحفظ..." : isEditing ? "حفظ التغييرات" : "نشر المقالة"}
            </button>
            <button type="button" onClick={onCancel} style={{
              width: '100%', padding: '0.5rem', borderRadius: 10, background: 'transparent',
              border: '1px solid rgba(30,58,95,0.8)', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem',
            }}>إلغاء</button>

            {/* Featured Toggle */}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(30,58,95,0.4)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setFeatured(!featured)}>
              <div style={{
                width: 40, height: 22, borderRadius: 11, position: 'relative', transition: 'background 0.2s',
                background: featured ? '#f59e0b' : 'rgba(30,58,95,0.5)',
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 8, background: '#fff', position: 'absolute', top: 3,
                  transition: 'right 0.2s, left 0.2s',
                  ...(featured ? { left: 21 } : { left: 3 }),
                }} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>مقالة مميزة</div>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>تظهر في القسم المميز</div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div style={cardStyle}>
            <label style={labelStyle}>صورة الغلاف (URL)</label>
            <input style={inputStyle} value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." dir="ltr" />
            {coverImage && (
              <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden' }}>
                <img src={coverImage} alt="" style={{ width: '100%', height: 120, objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* Category */}
          <div style={cardStyle}>
            <label style={labelStyle}>التصنيف</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategory(cat)} style={{
                  padding: '0.4rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: category === cat ? 'rgba(245,158,11,0.15)' : 'rgba(30,58,95,0.3)',
                  color: category === cat ? '#f59e0b' : '#64748b', fontSize: '0.75rem', fontWeight: category === cat ? 700 : 500,
                }}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Crypto Symbols */}
          <div style={cardStyle}>
            <label style={labelStyle}>رموز العملات</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {CRYPTO_SYMBOLS.map((s) => (
                <button key={s} type="button" onClick={() => toggleCryptoSymbol(s)} style={{
                  padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                  background: cryptoSymbols.includes(s) ? 'rgba(245,158,11,0.2)' : 'rgba(30,58,95,0.3)',
                  color: cryptoSymbols.includes(s) ? '#f59e0b' : '#475569',
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>الوسوم</label>
              {content && aiBtn("tags", "اقتراح", "#22c55e")}
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} placeholder="أضف وسماً..." dir="rtl" />
              <button type="button" onClick={handleAddTag} style={{ padding: '0 12px', background: 'rgba(20,184,166,0.15)', color: '#5eead4', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>+</button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tags.map((tag) => (
                  <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(30,58,95,0.5)', color: '#94a3b8', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 20 }}>
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Author + Slug */}
          <div style={cardStyle}>
            <label style={labelStyle}>الكاتب</label>
            <input style={inputStyle} value={authorName} onChange={(e) => setAuthorName(e.target.value)} dir="rtl" />
            <label style={{ ...labelStyle, marginTop: 12 }}>الرابط المخصص</label>
            <input style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.75rem' }} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="تلقائي" dir="ltr" />
          </div>
        </div>
      </div>
    </form>
  );
}
