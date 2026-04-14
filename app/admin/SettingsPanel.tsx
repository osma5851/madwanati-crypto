"use client";

import { useState, useEffect } from "react";
import { SiteSettings } from "@/lib/types";

interface Props {
  onToast: (msg: string, type: "success" | "error") => void;
}

export default function SettingsPanel({ onToast }: Props) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { setSettings(d.settings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) onToast("تم حفظ الإعدادات بنجاح", "success");
      else onToast("فشل حفظ الإعدادات", "error");
    } catch { onToast("خطأ في الاتصال", "error"); }
    finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.85rem',
    background: '#0f172a', border: '1px solid rgba(30,58,95,0.8)',
    color: '#e2e8f0', borderRadius: 10, fontSize: '0.875rem', outline: 'none',
    direction: 'auto' as unknown as undefined,
  } as React.CSSProperties;

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600,
    color: '#94a3b8', marginBottom: 6,
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>جاري التحميل...</div>;
  if (!settings) return <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>تعذر تحميل الإعدادات</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>إعدادات الموقع</h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 32 }}>تخصيص اسم الموقع والوصف والألوان</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800 }}>
        {/* Site Name AR */}
        <div>
          <label style={labelStyle}>اسم الموقع (عربي)</label>
          <input style={inputStyle} value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} dir="rtl" />
        </div>
        {/* Site Name EN */}
        <div>
          <label style={labelStyle}>Site Name (English)</label>
          <input style={inputStyle} value={settings.site_name_en} onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })} dir="ltr" />
        </div>
        {/* Description AR */}
        <div>
          <label style={labelStyle}>وصف الموقع (عربي)</label>
          <input style={inputStyle} value={settings.site_description} onChange={(e) => setSettings({ ...settings, site_description: e.target.value })} dir="rtl" />
        </div>
        {/* Description EN */}
        <div>
          <label style={labelStyle}>Site Description (English)</label>
          <input style={inputStyle} value={settings.site_description_en} onChange={(e) => setSettings({ ...settings, site_description_en: e.target.value })} dir="ltr" />
        </div>
        {/* Logo URL */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>رابط الشعار (Logo URL)</label>
          <input style={inputStyle} value={settings.logo_url} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} dir="ltr" placeholder="https://..." />
          {settings.logo_url && (
            <div style={{ marginTop: 8, padding: 12, background: '#0f172a', borderRadius: 8, display: 'inline-block' }}>
              <img src={settings.logo_url} alt="logo" style={{ maxHeight: 48 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
        </div>
        {/* Primary Color */}
        <div>
          <label style={labelStyle}>اللون الأساسي</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} style={{ width: 40, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
            <input style={{ ...inputStyle, flex: 1 }} value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} dir="ltr" />
          </div>
        </div>
        {/* Secondary Color */}
        <div>
          <label style={labelStyle}>اللون الثانوي</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} style={{ width: 40, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
            <input style={{ ...inputStyle, flex: 1 }} value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} dir="ltr" />
          </div>
        </div>
      </div>

      {/* Save */}
      <div style={{ marginTop: 32 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#0f172a', fontWeight: 700, fontSize: '0.9rem',
            padding: '0.7rem 2rem', borderRadius: 10, border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}
