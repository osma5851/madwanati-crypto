import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
      <div className="text-center">
        <h1 className="text-8xl font-black mb-4" style={{ color: '#f59e0b' }}>404</h1>
        <p className="text-xl mb-8" style={{ color: '#94a3b8' }}>الصفحة غير موجودة</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a' }}
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
