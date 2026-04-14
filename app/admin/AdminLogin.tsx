"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error || "فشل تسجيل الدخول");
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 2.5rem 0.75rem 1rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 12,
    fontSize: '0.9rem',
    outline: 'none',
    direction: 'rtl' as const,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            background: '#14b8a6',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(20,184,166,0.3)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 28 }}>₿</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>مدونات الكريبتو</h1>
          <p style={{ color: '#5eead4', fontSize: '0.875rem', marginTop: 4 }}>لوحة التحكم</p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20,
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 24, textAlign: 'center' }}>
            تسجيل الدخول
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#99f6e4', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل البريد الإلكتروني"
                style={inputStyle}
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#99f6e4', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                style={inputStyle}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12,
                padding: '0.75rem 1rem',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: 20,
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#14b8a6',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 12,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 16px rgba(20,184,166,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? "جاري التحقق..." : "دخول"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <a href="/" style={{ color: '#5eead4', fontSize: '0.85rem', textDecoration: 'none' }}>
              العودة إلى المدونة
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
