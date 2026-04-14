"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  articleContent: string;
  cryptoSymbols?: string[];
}

export default function AiAnalysis({ articleContent, cryptoSymbols }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useTranslations();

  const handleAnalyze = async () => {
    if (loading) return;
    setLoading(true);
    setAnalysis("");
    setIsOpen(true);

    try {
      const prompt = cryptoSymbols?.length
        ? `Analyze this crypto article focusing on ${cryptoSymbols.join(", ")}. Provide market insights and key takeaways.`
        : "Analyze this crypto article. Provide market insights and key takeaways.";

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: articleContent.substring(0, 3000),
        }),
      });

      if (!res.ok) {
        setAnalysis("عذراً، لم نتمكن من إجراء التحليل. تأكد من تسجيل الدخول.");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const text = decoder.decode(value, { stream: true });
          setAnalysis((prev) => prev + text);
        }
      }
    } catch {
      setAnalysis("حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Analyze Button */}
      {!isOpen && (
        <button
          onClick={handleAnalyze}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, var(--accent-blue), #6366f1)',
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          تحليل بالذكاء الاصطناعي
        </button>
      )}

      {/* Analysis Panel */}
      {isOpen && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                تحليل الذكاء الاصطناعي
              </span>
              {loading && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {analysis ? (
              <div className="prose-arabic text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {analysis}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t("common.loading")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
