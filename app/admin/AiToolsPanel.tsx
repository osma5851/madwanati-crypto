"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onCreateArticle: (data: { title: string; content: string; category: string; tags: string[] }) => void;
  onPublishArticle: (data: { title: string; content: string; category: string; tags: string[]; featured: boolean; author_name: string }) => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

interface ChatMessage { role: "user" | "assistant"; content: string; }
interface AIModel { id: string; name: string; provider: string; }

type Tab = "writer" | "analysis" | "studio" | "config";

const CATEGORIES = ["بيتكوين", "إيثيريوم", "تمويل لامركزي", "NFT", "تداول", "تحليل فني", "أخبار السوق", "تعليم"];
const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOGE", "AVAX", "DOT", "MATIC", "LINK", "UNI"];

export default function AiToolsPanel({ onCreateArticle, onPublishArticle, onToast }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("writer");
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelsLoading, setModelsLoading] = useState(true);

  // Writer
  const [topic, setTopic] = useState("");
  const [writerCategory, setWriterCategory] = useState("تعليم");
  const [writerLang, setWriterLang] = useState<"ar" | "en">("ar");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [autoPublish, setAutoPublish] = useState(false);

  // Analysis
  const [analysisSymbol, setAnalysisSymbol] = useState("BTC");
  const [analysisType, setAnalysisType] = useState<"technical" | "fundamental" | "sentiment">("technical");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisContent, setAnalysisContent] = useState("");

  // Studio
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("You are an expert crypto analyst. Respond in Arabic unless asked otherwise.");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Config
  const [customPrompt, setCustomPrompt] = useState("");

  // Fetch available models on mount
  useEffect(() => {
    fetch("/api/ai/models")
      .then((r) => r.json())
      .then((d) => {
        if (d.models?.length) {
          setModels(d.models);
          setSelectedModel(d.models[0].id);
        }
        setModelsLoading(false);
      })
      .catch(() => setModelsLoading(false));
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // Stream helpers
  const streamFromApi = async (body: object, onChunk: (text: string) => void): Promise<string> => {
    const res = await fetch("/api/ai/analyze", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model: selectedModel }),
    });
    if (!res.ok) throw new Error("API error");
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");
    const decoder = new TextDecoder();
    let full = ""; let done = false;
    while (!done) { const { value, done: d } = await reader.read(); done = d; if (value) { const t = decoder.decode(value, { stream: true }); full += t; onChunk(full); } }
    return full;
  };

  const streamChatApi = async (messages: ChatMessage[], onChunk: (text: string) => void): Promise<string> => {
    const res = await fetch("/api/ai/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model: selectedModel }),
    });
    if (!res.ok) throw new Error("API error");
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");
    const decoder = new TextDecoder();
    let full = ""; let done = false;
    while (!done) { const { value, done: d } = await reader.read(); done = d; if (value) { const t = decoder.decode(value, { stream: true }); full += t; onChunk(full); } }
    return full;
  };

  // Model Selector component
  const ModelSelector = () => (
    <div>
      <label style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 4, display: 'block' }}>النموذج</label>
      {modelsLoading ? (
        <div style={{ ...inputStyle, padding: '0.5rem 0.75rem', color: '#52525b', width: 'auto', minWidth: 180 }}>جاري التحميل...</div>
      ) : models.length === 0 ? (
        <div style={{ ...inputStyle, padding: '0.5rem 0.75rem', color: '#ef4444', width: 'auto', minWidth: 180, fontSize: '0.75rem' }}>لا توجد نماذج — أضف API keys</div>
      ) : (
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{ ...inputStyle, width: 'auto', minWidth: 200, cursor: 'pointer', padding: '0.5rem 0.75rem' }}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id} style={{ background: '#18181b' }}>
              {m.name} ({m.provider})
            </option>
          ))}
        </select>
      )}
    </div>
  );

  // === WRITER ===
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true); setGeneratedContent("");
    const lang = writerLang === "ar" ? "Arabic" : "English";
    try {
      const full = await streamFromApi({
        prompt: `Write a comprehensive ${lang} cryptocurrency blog article about: "${topic}".\nCategory: ${writerCategory}\n\nFormat in Markdown:\n# [Compelling title]\n\n[Introduction paragraph]\n\n## [Section 1]\n[Content...]\n\n## [Section 2]\n[Content...]\n\n## [Section 3]\n[Content...]\n\n## الخلاصة / Conclusion\n[Key takeaways]\n\nRequirements:\n- Write entirely in ${lang}\n- Be informative, educational, and engaging\n- Include relevant crypto data and terminology\n- 800-1200 words\n- Professional tone`,
      }, (text) => setGeneratedContent(text));
      if (autoPublish && full) {
        const title = full.split("\n")[0]?.replace(/^#\s*/, "").trim() || topic;
        onPublishArticle({ title, content: full, category: writerCategory, tags: [topic.trim()], featured: false, author_name: "AI Writer" });
        onToast("تم إنشاء ونشر المقالة تلقائياً", "success");
      }
    } catch { onToast("فشل إنشاء المقالة - تأكد من إعدادات API", "error"); }
    finally { setGenerating(false); }
  };

  // === ANALYSIS ===
  const analysisPrompts: Record<string, string> = {
    technical: `Provide a detailed TECHNICAL ANALYSIS for ${analysisSymbol}:\n- Price action and trend analysis\n- Key support and resistance levels\n- Moving averages (MA50, MA200)\n- RSI, MACD, Bollinger Bands\n- Volume analysis\n- Chart patterns\n- Entry/exit suggestions (with disclaimer)\nWrite in Arabic.`,
    fundamental: `Provide FUNDAMENTAL ANALYSIS for ${analysisSymbol}:\n- Project overview and technology\n- Team and development activity\n- Tokenomics\n- Adoption metrics and partnerships\n- Competitive advantages\n- Risks and concerns\n- Long-term value proposition\nWrite in Arabic.`,
    sentiment: `Provide SENTIMENT ANALYSIS for ${analysisSymbol}:\n- Current market sentiment (Fear & Greed)\n- Social media trends\n- Whale activity and on-chain metrics\n- News impact analysis\n- Institutional interest\n- Overall outlook\nWrite in Arabic.`,
  };

  const handleAnalyze = async () => {
    setAnalyzing(true); setAnalysisContent("");
    try { await streamFromApi({ prompt: analysisPrompts[analysisType] }, (text) => setAnalysisContent(text)); }
    catch { onToast("فشل التحليل", "error"); }
    finally { setAnalyzing(false); }
  };

  // === STUDIO ===
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages); setChatInput(""); setChatLoading(true);
    try {
      setChatMessages([...newMessages, { role: "assistant", content: "" }]);
      const full = await streamChatApi(newMessages, (text) => setChatMessages([...newMessages, { role: "assistant", content: text }]));
      setChatMessages([...newMessages, { role: "assistant", content: full }]);
    } catch { setChatMessages([...newMessages, { role: "assistant", content: "عذراً، حدث خطأ. تأكد من إعدادات API." }]); }
    finally { setChatLoading(false); }
  };

  // Styles
  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: activeTab === t ? 'rgba(168,85,247,0.15)' : 'transparent',
    color: activeTab === t ? '#c084fc' : '#52525b',
    fontWeight: activeTab === t ? 700 : 500, fontSize: '0.85rem',
  });
  const cardStyle: React.CSSProperties = { background: '#111113', border: '1px solid #27272a', borderRadius: 12, padding: '1.5rem', marginBottom: 20 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.85rem', background: '#18181b', border: '1px solid #27272a', color: '#fafafa', borderRadius: 8, fontSize: '0.85rem', outline: 'none' };
  const outputStyle: React.CSSProperties = { background: '#09090b', border: '1px solid #1a1a1e', borderRadius: 8, padding: '1rem', marginTop: 12, maxHeight: 450, overflowY: 'auto', fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.8, whiteSpace: 'pre-wrap', direction: 'rtl' };
  const btn = (color: string, disabled: boolean): React.CSSProperties => ({ background: color, color: color === '#f59e0b' ? '#09090b' : '#fff', fontWeight: 700, fontSize: '0.8rem', padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap' });

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fafafa', marginBottom: 4 }}>🧪 LLM Studio</h1>
      <p style={{ color: '#52525b', fontSize: '0.9rem', marginBottom: 24 }}>إنشاء محتوى، تحليل السوق، والتفاعل مع الذكاء الاصطناعي</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab("writer")} style={tabStyle("writer")}>✍️ كاتب المقالات</button>
        <button onClick={() => setActiveTab("analysis")} style={tabStyle("analysis")}>📊 تحليل السوق</button>
        <button onClick={() => setActiveTab("studio")} style={tabStyle("studio")}>💬 المحادثة</button>
        <button onClick={() => setActiveTab("config")} style={tabStyle("config")}>⚙️ الإعدادات</button>
      </div>

      {/* ===== WRITER ===== */}
      {activeTab === "writer" && (
        <div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginBottom: 16 }}>✍️ كاتب المقالات</h2>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#71717a', marginBottom: 6, display: 'block' }}>الموضوع</label>
            <input style={{ ...inputStyle, marginBottom: 12 }} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثال: مستقبل التمويل اللامركزي DeFi في 2025" dir="rtl" onKeyDown={(e) => e.key === "Enter" && handleGenerate()} />

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'flex-end' }}>
              <ModelSelector />
              <div>
                <label style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 4, display: 'block' }}>التصنيف</label>
                <select value={writerCategory} onChange={(e) => setWriterCategory(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 120, cursor: 'pointer', padding: '0.5rem 0.75rem' }}>
                  {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: '#18181b' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 4, display: 'block' }}>اللغة</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(["ar", "en"] as const).map((l) => (
                    <button key={l} onClick={() => setWriterLang(l)} style={{ padding: '0.45rem 0.75rem', borderRadius: 6, border: '1px solid', cursor: 'pointer', borderColor: writerLang === l ? '#a855f7' : '#27272a', background: writerLang === l ? 'rgba(168,85,247,0.1)' : '#18181b', color: writerLang === l ? '#c084fc' : '#52525b', fontSize: '0.8rem', fontWeight: 600 }}>{l === "ar" ? "عربي" : "EN"}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 4, display: 'block' }}>نشر تلقائي</label>
                <div onClick={() => setAutoPublish(!autoPublish)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', background: autoPublish ? '#22c55e' : '#27272a', transition: 'background 0.2s' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 7, background: '#fff', position: 'absolute', top: 3, transition: 'left 0.2s', left: autoPublish ? 19 : 3 }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: autoPublish ? '#22c55e' : '#52525b' }}>{autoPublish ? "مفعل" : "معطل"}</span>
                </div>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating || !topic.trim() || models.length === 0} style={btn('#f59e0b', generating || !topic.trim() || models.length === 0)}>
              {generating ? "⏳ جاري الإنشاء..." : "🚀 إنشاء المقالة"}
            </button>
          </div>
          {generatedContent && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fafafa' }}>📝 المقالة المُنشأة</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { const title = generatedContent.split("\n")[0]?.replace(/^#\s*/, "").trim() || topic; onCreateArticle({ title, content: generatedContent, category: writerCategory, tags: [topic.trim()] }); }} style={btn('#3b82f6', false)}>تعديل →</button>
                  <button onClick={() => { const title = generatedContent.split("\n")[0]?.replace(/^#\s*/, "").trim() || topic; onPublishArticle({ title, content: generatedContent, category: writerCategory, tags: [topic.trim()], featured: false, author_name: "AI Writer" }); onToast("تم نشر المقالة", "success"); }} style={btn('#22c55e', false)}>نشر ✓</button>
                </div>
              </div>
              <div style={outputStyle}>{generatedContent}</div>
            </div>
          )}
        </div>
      )}

      {/* ===== ANALYSIS ===== */}
      {activeTab === "analysis" && (
        <div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6', marginBottom: 16 }}>📊 تحليل السوق</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'flex-end' }}>
              <ModelSelector />
              <div>
                <label style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 4, display: 'block' }}>العملة</label>
                <select value={analysisSymbol} onChange={(e) => setAnalysisSymbol(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 100, cursor: 'pointer', padding: '0.5rem 0.75rem' }}>
                  {SYMBOLS.map((s) => <option key={s} value={s} style={{ background: '#18181b' }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 4, display: 'block' }}>نوع التحليل</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {([{ key: "technical", label: "فني", icon: "📈" }, { key: "fundamental", label: "أساسي", icon: "🔬" }, { key: "sentiment", label: "معنويات", icon: "🧠" }] as const).map((t) => (
                    <button key={t.key} onClick={() => setAnalysisType(t.key)} style={{ padding: '0.45rem 0.75rem', borderRadius: 6, border: '1px solid', cursor: 'pointer', borderColor: analysisType === t.key ? '#3b82f6' : '#27272a', background: analysisType === t.key ? 'rgba(59,130,246,0.1)' : '#18181b', color: analysisType === t.key ? '#93c5fd' : '#52525b', fontSize: '0.8rem', fontWeight: 600 }}>{t.icon} {t.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={handleAnalyze} disabled={analyzing || models.length === 0} style={btn('#3b82f6', analyzing || models.length === 0)}>
              {analyzing ? "⏳ جاري التحليل..." : `🔍 تحليل ${analysisSymbol}`}
            </button>
          </div>
          {analysisContent && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fafafa' }}>📊 تحليل {analysisSymbol}</h3>
                <button onClick={() => { const title = `تحليل ${analysisType === "technical" ? "فني" : analysisType === "fundamental" ? "أساسي" : "المعنويات"} - ${analysisSymbol}`; onPublishArticle({ title, content: analysisContent, category: "تحليل فني", tags: [analysisSymbol], featured: false, author_name: "AI Analyst" }); onToast("تم نشر التحليل", "success"); }} style={btn('#22c55e', false)}>نشر كمقالة ✓</button>
              </div>
              <div style={outputStyle}>{analysisContent}</div>
            </div>
          )}
        </div>
      )}

      {/* ===== STUDIO ===== */}
      {activeTab === "studio" && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a855f7', marginBottom: 8 }}>💬 استوديو المحادثة</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12, alignItems: 'flex-end' }}>
            <ModelSelector />
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 4, display: 'block' }}>System Prompt</label>
              <input value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} dir="ltr" style={{ ...inputStyle, fontSize: '0.75rem', fontFamily: 'monospace' }} />
            </div>
          </div>

          <div style={{ background: '#09090b', border: '1px solid #1a1a1e', borderRadius: 10, height: 360, overflowY: 'auto', padding: '1rem', marginBottom: 12 }}>
            {chatMessages.length === 0 && <div style={{ textAlign: 'center', color: '#3f3f46', paddingTop: 100 }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>🤖</div><p style={{ fontSize: '0.85rem' }}>ابدأ المحادثة — اسأل عن أي شيء!</p></div>}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === "user" ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                <div style={{ maxWidth: '80%', padding: '0.6rem 0.85rem', borderRadius: 10, fontSize: '0.85rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: msg.role === "user" ? '#a855f7' : '#18181b', color: msg.role === "user" ? '#fff' : '#a1a1aa' }}>
                  {msg.content || <span style={{ opacity: 0.5 }}>...</span>}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleChatSend()} placeholder="اكتب رسالتك..." dir="auto" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()} style={btn('#a855f7', chatLoading || !chatInput.trim())}>إرسال</button>
            {chatMessages.length > 0 && <button onClick={() => setChatMessages([])} style={{ ...btn('#27272a', false), color: '#52525b' }}>مسح</button>}
          </div>
        </div>
      )}

      {/* ===== CONFIG ===== */}
      {activeTab === "config" && (
        <div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginBottom: 16 }}>⚙️ إعدادات LLM</h2>

            {/* Available Models */}
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#71717a', marginBottom: 8, display: 'block' }}>النماذج المتاحة</label>
            {modelsLoading ? (
              <div style={{ color: '#52525b', fontSize: '0.85rem', marginBottom: 16 }}>جاري التحميل...</div>
            ) : models.length === 0 ? (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '1rem', marginBottom: 16, color: '#fca5a5', fontSize: '0.85rem' }}>
                ❌ لا توجد نماذج متاحة — أضف API keys في Vercel Environment Variables
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, marginBottom: 20 }}>
                {models.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    style={{
                      padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                      border: selectedModel === m.id ? '2px solid #a855f7' : '1px solid #27272a',
                      background: selectedModel === m.id ? 'rgba(168,85,247,0.08)' : '#18181b',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedModel === m.id ? '#c084fc' : '#a1a1aa' }}>{m.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#3f3f46', marginTop: 2, fontFamily: 'monospace' }}>{m.provider} · {m.id}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Custom System Prompt */}
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#71717a', marginBottom: 8, display: 'block' }}>System Prompt مخصص</label>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} rows={4} dir="ltr" placeholder="Override the default crypto analyst system prompt..." style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical', marginBottom: 16 }} />

            {/* Setup Info */}
            <div style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 10, padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', marginBottom: 8 }}>📋 كيفية الإعداد</h4>
              <ul style={{ fontSize: '0.8rem', color: '#52525b', lineHeight: 2.2, paddingRight: 16, margin: 0 }}>
                <li><strong style={{ color: '#a1a1aa' }}>Custom endpoint:</strong> أضف CUSTOM_LLM_URL + CUSTOM_LLM_API_KEY + CUSTOM_LLM_MODEL</li>
                <li><strong style={{ color: '#a1a1aa' }}>نماذج إضافية:</strong> أضف CUSTOM_LLM_MODELS (مفصولة بفاصلة)</li>
                <li><strong style={{ color: '#a1a1aa' }}>Anthropic:</strong> أضف ANTHROPIC_API_KEY</li>
                <li><strong style={{ color: '#a1a1aa' }}>OpenAI:</strong> أضف OPENAI_API_KEY</li>
                <li><strong style={{ color: '#a1a1aa' }}>تحديد المزود:</strong> LLM_PROVIDER = custom | anthropic | openai</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
