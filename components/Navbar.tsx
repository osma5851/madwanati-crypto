"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("nav");

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/market", label: t("market") },
    { href: "/?category=تداول", label: t("trading") },
    { href: "/?category=تحليل فني", label: t("analysis") },
  ];

  return (
    <nav className="nav-bar" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 900, color: '#fff',
            }}>₿</div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fafafa' }}>مدونات الكريبتو</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hidden-mobile">
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                style={{
                  padding: '0.4rem 0.75rem', color: '#71717a', textDecoration: 'none',
                  fontSize: '0.85rem', fontWeight: 500, borderRadius: 6,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fafafa'; e.currentTarget.style.background = '#18181b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.background = 'transparent'; }}
              >
                {item.label}
              </Link>
            ))}
            <div style={{ width: 1, height: 20, background: '#27272a', margin: '0 8px' }} />
            <ThemeToggle />
            <LanguageToggle />
            <Link href="/admin" className="btn-primary" style={{ marginRight: 4, textDecoration: 'none', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
              {t("admin")}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="show-mobile"
            style={{ padding: 8, background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
          >
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ paddingBottom: 16, borderTop: '1px solid #27272a', marginTop: 4, paddingTop: 12 }}>
            {navItems.map((item) => (
              <Link key={item.href + item.label} href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '0.6rem 0.75rem', color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', borderRadius: 6 }}>
                {item.label}
              </Link>
            ))}
            <div style={{ display: 'flex', gap: 8, padding: '0.5rem 0.75rem' }}>
              <ThemeToggle /><LanguageToggle />
            </div>
            <Link href="/admin" onClick={() => setMobileOpen(false)}
              style={{ display: 'block', margin: '0.5rem 0.75rem 0', padding: '0.5rem', textAlign: 'center', textDecoration: 'none' }}
              className="btn-primary">
              {t("admin")}
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: block !important; } }
      `}</style>
    </nav>
  );
}
