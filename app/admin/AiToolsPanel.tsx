"use client";

import { useState } from "react";

interface Props {
  onCreateArticle: (data: { title: string; content: string; category: string; tags: string[] }) => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

export default function AiToolsPanel({ onCreateArticle, onToast }: Props) {
  const [topic, setTopic] = useState("");
  const [analysisSymbol, setAnalysisSymbol] = useState("BTC");
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [analysisContent, setAnalysisContent] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setGeneratedContent("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write a comprehensive Arabic cryptocurrency blog article about: ${topic}.
Format it in Markdown with:
- A compelling title (first line, prefixed with #)
- An introduction paragraph
- 3-4 main sections with ## headers
- Key takeaways
- Keep it informative and educational
- Write entirely in Arabic
- Include relevant crypto terminology`,
        }),
      });
      if (!res.ok) { onToast("فشل إنشاء المقالة - تأكد من تسجيل الدخول", "error"); return; }
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let text = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) { text += decoder.decode(value, { stream: true }); setGeneratedContent(text); }
      }
    } catch { onToast("خطأ في الاتصال", "error"); }
    finally { setGenerating(false); }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisContent("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Provide a comprehensive market analysis for ${analysisSymbol} cryptocurrency in Arabic. Include:
- Current market sentiment
- Key support and resistance levels
- Technical indicators overview
- Short-term and long-term outlook
- Risk factors
Write entirely in Arabic.`,
        }),
      });
      if (!res.ok) { onToast("فشل التحليل", "error"); return; }
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let text = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) { text += decoder.decode(value, { stream: true }); setAnalysisContent(text); }
      }
    } catch { onToast("خطأ في الاتصال", "error"); }
    finally { setAnalyzing(false); }
  };

  const handleUseAsArticle = () => {
    const lines = generatedContent.split("\n");
    const title = lines[0]?.replace(/^#\s*/, "").trim() || topic;
    onCreateArticle({
      title,
      content: generatedContent,
      category: "تعليم",
      tags: [topic.trim()],
    });
  };

  const cardStyle: React.CSSProperties = {
    background: '#1e293b', border: '1px solid rgba(30,58,95,0.8)',
    borderRadius: 16, padding: '1.5rem', marginBottom: 24,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.85rem',
    background: '#0f172a', border: '1px solid rgba(30,58,95,0.8)',
    color: '#e2e8f0', borderRadius: 10, fontSize: '0.875rem', outline: 'none',
  };

  const outputStyle: React.CSSProperties = {
    background: '#0f172a', border: '1px solid rgba(30,58,95,0.6)',
    borderRadius: 10, padding: '1rem', marginTop: 12,
    maxHeight: 400, overflowY: 'auto', fontSize: '0.85rem',
    color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-wrap',
    direction: 'rtl',
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>أدوات الذكاء الاصطناعي</h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 32 }}>إنشاء محتوى وتحليل السوق بالذكاء الاصطناعي</p>

      {/* Generate Article */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✍️ إنشاء مقالة
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 12 }}>أدخل موضوعاً وسيقوم الذكاء الاصطناعي بكتابة مقالة كاملة</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: مستقبل البيتكوين في 2025"
            dir="rtl"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#0f172a', fontWeight: 700, fontSize: '0.8rem',
              padding: '0 1.2rem', borderRadius: 10, border: 'none',
              cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {generating ? "جاري الإنشاء..." : "إنشاء"}
          </button>
        </div>
        {generatedContent && (
          <>
            <div style={outputStyle}>{generatedContent}</div>
            <button
              onClick={handleUseAsArticle}
              style={{
                marginTop: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontWeight: 600, fontSize: '0.8rem',
                padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
              }}
            >
              استخدام كمقالة جديدة →
            </button>
          </>
        )}
      </div>

      {/* Market Analysis */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          📊 تحليل السوق
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 12 }}>احصل على تحليل فني لأي عملة رقمية</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={analysisSymbol}
            onChange={(e) => setAnalysisSymbol(e.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: 120, cursor: 'pointer' }}
          >
            {["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOGE", "AVAX"].map((s) => (
              <option key={s} value={s} style={{ background: '#0f172a' }}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#fff', fontWeight: 600, fontSize: '0.8rem',
              padding: '0 1.2rem', borderRadius: 10, border: 'none',
              cursor: analyzing ? 'not-allowed' : 'pointer', opacity: analyzing ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {analyzing ? "جاري التحليل..." : "تحليل"}
          </button>
        </div>
        {analysisContent && <div style={outputStyle}>{analysisContent}</div>}
      </div>
    </div>
  );
}
