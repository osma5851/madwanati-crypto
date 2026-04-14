"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CATEGORIES } from "@/lib/types";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="footer-bg">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#fff' }}>₿</div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fafafa' }}>{t("brand")}</span>
            </div>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: '#52525b' }}>{t("description")}</p>
          </div>

          {/* Categories */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.8rem', color: '#71717a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t("categories")}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat} style={{ marginBottom: 6 }}>
                  <Link href={`/?category=${cat}`} style={{ fontSize: '0.8rem', color: '#3f3f46', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#a855f7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#3f3f46'; }}>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.8rem', color: '#71717a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t("quickLinks")}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: "/", label: tNav("home") },
                { href: "/market", label: tNav("market") },
                { href: "/admin", label: tNav("admin") },
              ].map((item) => (
                <li key={item.href} style={{ marginBottom: 6 }}>
                  <Link href={item.href} style={{ fontSize: '0.8rem', color: '#3f3f46', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#a855f7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#3f3f46'; }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ paddingTop: 20, borderTop: '1px solid #1a1a1e', textAlign: 'center', fontSize: '0.75rem', color: '#27272a' }}>
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
