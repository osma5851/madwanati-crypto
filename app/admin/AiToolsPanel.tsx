"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onCreateArticle: (data: { title: string; content: string; category: string; tags: string[] }) => void;
  onPublishArticle: (data: { title: string; content: string; category: string; tags: string[]; featured: boolean; author_name: string }) => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type Tab = "writer" | "analysis" | "studio" | "config";

const CATEGORIES = ["بيتكوين", "إيثيريوم", "تمويل لامركزي", "NFT", "تداول", "تحليل فني", "أخبار السوق", "تعليم"];
const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOGE", "AVAX", "DOT", "MATIC", "LINK", "UNI"];

export default function AiToolsPanel({ onCreateArticle, onPublishArticle, onToast }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("writer");

  // Writer state
  const [topic, setTopic] = useState("");
  const [writerCategory, setWriterCategory] = useState("تعليم");
  const [writerLang, setWriterLang] = useState<"ar" | "en">("ar");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [autoPublish, setAutoPublish] = useState(false);

  // Analysis state
  const [analysisSymbol, setAnalysisSymbol] = useState("BTC");
  const [analysisType, setAnalysisType] = useState<"technical" | "fundamental" | "sentiment">("technical");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisContent, setAnalysisContent] = useState("");

  // Studio (chat) state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("You are an expert crypto analyst. Respond in Arabic unless asked otherwise.");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Config state
  const [provider, setProvider] = useState("anthropic");
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // Stream helper
  const streamFromApi = async (body: object, onChunk: (text: string) => void): Promise<string> => {
    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("API error");
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");
    const decoder = new TextDecoder();
    let full = "";
    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) { const t = decoder.decode(value, { stream: true }); full += t; onChunk(full); }
    }
    return full;
  };

  // Chat stream helper
  const streamChat = async (messages: ChatMessage[], onChunk: (text: string) => void): Promise<string> => {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error("API error");
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");
    const decoder = new TextDecoder();
    let full = "";
    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) { const t = decoder.decode(value, { stream: true }); full += t; onChunk(full); }
    }
    return full;
  };

  // === WRITER ===
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setGeneratedContent("");
    const lang = writerLang === "ar" ? "Arabic" : "English";
    try {
      const full = await streamFromApi({
        prompt: `Write a comprehensive ${lang} cryptocurrency blog article about: "${topic}".
Category: ${writerCategory}

Format in Markdown:
# [Compelling title]

[Introduction paragraph]

## [Section 1 title]
[Content...]

## [Section 2 title]
[Content...]

## [Section 3 title]
[Content...]

## الخلاصة / Conclusion
[Key takeaways]

Requirements:
- Write entirely in ${lang}
- Be informative, educational, and engaging
- Include relevant crypto data and terminology
- 800-1200 words
- Professional tone`,
      }, (text) => setGeneratedContent(text));

      if (autoPublish && full) {
        const lines = full.split("\n");
        const title = lines[0]?.replace(/^#\s*/, "").trim() || topic;
        onPublishArticle({
          title, content: full, category: writerCategory,
          tags: [topic.trim()], featured: false, author_name: "AI Writer",
        });
        onToast("تم إنشاء ونشر المقالة تلقائياً", "success");
      }
    } catch { onToast("فشل إنشاء المقالة - تأكد من إعدادات API", "error"); }
    finally { setGenerating(false); }
  };

  const handleUseAsArticle = () => {
    const lines = generatedContent.split("\n");
    const title = lines[0]?.replace(/^#\s*/, "").trim() || topic;
    onCreateArticle({ title, content: generatedContent, category: writerCategory, tags: [topic.trim()] });
  };

  // === ANALYSIS ===
  const analysisPrompts: Record<string, string> = {
    technical: `Provide a detailed TECHNICAL ANALYSIS for ${analysisSymbol}:
- Price action and trend analysis
- Key support and resistance levels
- Moving averages (MA50, MA200)
- RSI, MACD, Bollinger Bands interpretation
- Volume analysis
- Chart patterns
- Entry/exit suggestions (with disclaimer)
Write in Arabic.`,
    fundamental: `Provide FUNDAMENTAL ANALYSIS for ${analysisSymbol}:
- Project overview and technology
- Team and development activity
- Tokenomics (supply, distribution, inflation)
- Adoption metrics and partnerships
- Competitive advantages
- Risks and concerns
- Long-term value proposition
Write in Arabic.`,
    sentiment: `Provide SENTIMENT ANALYSIS for ${analysisSymbol}:
- Current market sentiment (Fear & Greed)
- Social media trends and discussion volume
- Whale activity and on-chain metrics
- News impact analysis
- Institutional interest
- Retail trader positioning
- Overall outlook based on sentiment
Write in Arabic.`,
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisContent("");
    try {
      await streamFromApi({ prompt: analysisPrompts[analysisType] }, (text) => setAnalysisContent(text));
    } catch { onToast("فشل التحليل", "error"); }
    finally { setAnalyzing(false); }
  };

  const handlePublishAnalysis = () => {
    const title = `تحليل ${analysisType === "technical" ? "فني" : analysisType === "fundamental" ? "أساسي" : "المعنويات"} - ${analysisSymbol}`;
    onPublishArticle({
      title, content: analysisContent, category: "تحليل فني",
      tags: [analysisSymbol, analysisType], featured: false, author_name: "AI Analyst",
    });
    onToast("تم نشر التحليل كمقالة", "success");
  };

  // === STUDIO CHAT ===
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      setChatMessages([...newMessages, { role: "assistant", content: "" }]);
      const full = await streamChat(newMessages, (text) => {
        setChatMessages([...newMessages, { role: "assistant", content: text }]);
      });
      setChatMessages([...newMessages, { role: "assistant", content: full }]);
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "عذراً، حدث خطأ. تأكد من إعدادات API." }]);
    } finally { setChatLoading(false); }
  };

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '0.6rem 1.2rem', borderRadius: 10, border: 'none', cursor: 'pointer',
    background: activeTab === t ? 'rgba(245,158,11,0.15)' : 'transparent',
    color: activeTab === t ? '#f59e0b' : '#64748b',
    fontWeight: activeTab === t ? 700 : 500, fontSize: '0.85rem',
  });

  const cardStyle: React.CSSProperties = {
    background: '#1e293b', border: '1px solid rgba(30,58,95,0.8)',
    borderRadius: 16, padding: '1.5rem', marginBottom: 20,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.85rem',
    background: '#0f172a', border: '1px solid rgba(30,58,95,0.8)',
    color: '#e2e8f0', borderRadius: 10, fontSize: '0.875rem', outline: 'none',
  };

  const outputStyle: React.CSSProperties = {
    background: '#0f172a', border: '1px solid rgba(30,58,95,0.6)',
    borderRadius: 10, padding: '1rem', marginTop: 12,
    maxHeight: 450, overflowY: 'auto', fontSize: '0.85rem',
    color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-wrap', direction: 'rtl',
  };

  const btnPrimary = (color: string, disabled: boolean): React.CSSProperties => ({
    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
    color: color === '#f59e0b' ? '#0f172a' : '#fff',
    fontWeight: 700, fontSize: '0.8rem',
    padding: '0.5rem 1.2rem', borderRadius: 10, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>🧪 LLM Studio</h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 24 }}>إنشاء محتوى، تحليل السوق، والتفاعل مع الذكاء الاصطناعي</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab("writer")} style={tabStyle("writer")}>✍️ كاتب المقالات</button>
        <button onClick={() => setActiveTab("analysis")} style={tabStyle("analysis")}>📊 تحليل السوق</button>
        <button onClick={() => setActiveTab("studio")} style={tabStyle("studio")}>💬 استوديو المحادثة</button>
        <button onClick={() => setActiveTab("config")} style={tabStyle("config")}>⚙️ إعدادات LLM</button>
      </div>

      {/* === WRITER TAB === */}
      {activeTab === "writer" && (
        <div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginBottom: 16 }}>✍️ كاتب المقالات بالذكاء الاصطناعي</h2>

            {/* Topic */}
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>الموضوع</label>
            <input
              style={{ ...inputStyle, marginBottom: 12 }}
              value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: مستقبل التمويل اللامركزي DeFi في 2025"
              dir="rtl" onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />

            {/* Options Row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
              {/* Category */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'block' }}>التصنيف</label>
                <select value={writerCategory} onChange={(e) => setWriterCategory(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', minWidth: 120, cursor: 'pointer', padding: '0.5rem 0.75rem' }}>
                  {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
                </select>
              </div>
              {/* Language */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'block' }}>اللغة</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(["ar", "en"] as const).map((l) => (
                    <button key={l} onClick={() => setWriterLang(l)} style={{
                      padding: '0.45rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: writerLang === l ? 'rgba(245,158,11,0.2)' : 'rgba(30,58,95,0.4)',
                      color: writerLang === l ? '#f59e0b' : '#64748b', fontSize: '0.8rem', fontWeight: 600,
                    }}>{l === "ar" ? "عربي" : "English"}</button>
                  ))}
                </div>
              </div>
              {/* Auto Publish */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'block' }}>نشر تلقائي</label>
                <div onClick={() => setAutoPublish(!autoPublish)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div style={{
                    width: 36, height: 20, borderRadius: 10, position: 'relative',
                    background: autoPublish ? '#22c55e' : 'rgba(30,58,95,0.5)', transition: 'background 0.2s',
                  }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: 7, background: '#fff',
                      position: 'absolute', top: 3, transition: 'left 0.2s',
                      left: autoPublish ? 19 : 3,
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: autoPublish ? '#22c55e' : '#475569' }}>
                    {autoPublish ? "مفعل" : "معطل"}
                  </span>
                </div>
              </div>
            </div>

            {/* Generate */}
            <button onClick={handleGenerate} disabled={generating || !topic.trim()} style={btnPrimary('#f59e0b', generating || !topic.trim())}>
              {generating ? "⏳ جاري الإنشاء..." : "🚀 إنشاء المقالة"}
            </button>
          </div>

          {/* Output */}
          {generatedContent && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>📝 المقالة المُنشأة</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleUseAsArticle} style={btnPrimary('#3b82f6', false)}>تعديل قبل النشر →</button>
                  <button onClick={() => {
                    const lines = generatedContent.split("\n");
                    const title = lines[0]?.replace(/^#\s*/, "").trim() || topic;
                    onPublishArticle({ title, content: generatedContent, category: writerCategory, tags: [topic.trim()], featured: false, author_name: "AI Writer" });
                    onToast("تم نشر المقالة", "success");
                  }} style={btnPrimary('#22c55e', false)}>نشر مباشر ✓</button>
                </div>
              </div>
              <div style={outputStyle}>{generatedContent}</div>
            </div>
          )}
        </div>
      )}

      {/* === ANALYSIS TAB === */}
      {activeTab === "analysis" && (
        <div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6', marginBottom: 16 }}>📊 تحليل السوق المتقدم</h2>

            {/* Symbol Select */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'block' }}>العملة</label>
                <select value={analysisSymbol} onChange={(e) => setAnalysisSymbol(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', minWidth: 100, cursor: 'pointer', padding: '0.5rem 0.75rem' }}>
                  {SYMBOLS.map((s) => <option key={s} value={s} style={{ background: '#0f172a' }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'block' }}>نوع التحليل</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {([
                    { key: "technical", label: "فني", icon: "📈" },
                    { key: "fundamental", label: "أساسي", icon: "🔬" },
                    { key: "sentiment", label: "معنويات", icon: "🧠" },
                  ] as const).map((t) => (
                    <button key={t.key} onClick={() => setAnalysisType(t.key)} style={{
                      padding: '0.45rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: analysisType === t.key ? 'rgba(59,130,246,0.2)' : 'rgba(30,58,95,0.4)',
                      color: analysisType === t.key ? '#93c5fd' : '#64748b', fontSize: '0.8rem', fontWeight: 600,
                    }}>{t.icon} {t.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleAnalyze} disabled={analyzing} style={btnPrimary('#3b82f6', analyzing)}>
              {analyzing ? "⏳ جاري التحليل..." : `🔍 تحليل ${analysisSymbol}`}
            </button>
          </div>

          {analysisContent && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>
                  📊 تحليل {analysisSymbol}
                </h3>
                <button onClick={handlePublishAnalysis} style={btnPrimary('#22c55e', false)}>نشر كمقالة ✓</button>
              </div>
              <div style={outputStyle}>{analysisContent}</div>
            </div>
          )}
        </div>
      )}

      {/* === STUDIO CHAT TAB === */}
      {activeTab === "studio" && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>💬 استوديو المحادثة</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 16 }}>تحدث مع الذكاء الاصطناعي حول أي موضوع في الكريبتو</p>

          {/* System Prompt */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'block' }}>System Prompt</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
              rows={2} dir="ltr"
              style={{ ...inputStyle, fontSize: '0.75rem', fontFamily: 'monospace', resize: 'vertical' }}
            />
          </div>

          {/* Chat Messages */}
          <div style={{
            background: '#0f172a', border: '1px solid rgba(30,58,95,0.6)',
            borderRadius: 12, height: 380, overflowY: 'auto', padding: '1rem', marginBottom: 12,
          }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#475569', paddingTop: 120 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🤖</div>
                <p style={{ fontSize: '0.85rem' }}>ابدأ المحادثة — اسأل عن أي شيء!</p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === "user" ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                <div style={{
                  maxWidth: '80%', padding: '0.6rem 0.85rem', borderRadius: 12,
                  fontSize: '0.85rem', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                  background: msg.role === "user" ? '#3b82f6' : 'rgba(30,58,95,0.5)',
                  color: msg.role === "user" ? '#fff' : '#cbd5e1',
                }}>
                  {msg.content || <span style={{ opacity: 0.5 }}>...</span>}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
              placeholder="اكتب رسالتك..." dir="auto"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()} style={btnPrimary('#8b5cf6', chatLoading || !chatInput.trim())}>
              إرسال
            </button>
            {chatMessages.length > 0 && (
              <button onClick={() => setChatMessages([])} style={{ ...btnPrimary('#475569', false), background: 'rgba(30,58,95,0.5)', color: '#64748b' }}>
                مسح
              </button>
            )}
          </div>
        </div>
      )}

      {/* === CONFIG TAB === */}
      {activeTab === "config" && (
        <div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginBottom: 16 }}>⚙️ إعدادات LLM</h2>

            {/* Provider */}
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, display: 'block' }}>مزود الذكاء الاصطناعي</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[
                { key: "anthropic", label: "Anthropic Claude", desc: "claude-sonnet-4", color: "#d97706" },
                { key: "openai", label: "OpenAI GPT", desc: "gpt-4o", color: "#22c55e" },
              ].map((p) => (
                <div key={p.key} onClick={() => setProvider(p.key)}
                  style={{
                    flex: 1, padding: '1rem', borderRadius: 12, cursor: 'pointer',
                    border: provider === p.key ? `2px solid ${p.color}` : '2px solid rgba(30,58,95,0.5)',
                    background: provider === p.key ? `${p.color}10` : 'rgba(30,58,95,0.2)',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: provider === p.key ? p.color : '#94a3b8' }}>{p.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>{p.desc}</div>
                </div>
              ))}
            </div>

            {/* Custom System Prompt */}
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, display: 'block' }}>System Prompt مخصص (اختياري)</label>
            <textarea
              value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4} dir="ltr"
              placeholder="Override the default crypto analyst system prompt..."
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical', marginBottom: 16 }}
            />

            {/* Info */}
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>📋 معلومات</h4>
              <ul style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 2, paddingRight: 16, margin: 0 }}>
                <li>يتم تحديد المزود تلقائياً من متغيرات البيئة (LLM_PROVIDER)</li>
                <li>تأكد من إضافة ANTHROPIC_API_KEY و/أو OPENAI_API_KEY في Vercel</li>
                <li>التبديل بين المزودين يتطلب تعديل متغير LLM_PROVIDER في Vercel</li>
                <li>System Prompt المخصص يُطبق على استوديو المحادثة فقط</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
