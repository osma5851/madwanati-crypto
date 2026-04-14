import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-teal-200 mb-4">٤٠٤</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">الصفحة غير موجودة</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
