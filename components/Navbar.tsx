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
    { href: "/?category=أخبار السوق", label: t("news") },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/60 backdrop-blur-md" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
              <span className="text-slate-900 font-black text-xl">₿</span>
            </div>
            <div>
              <span className="text-xl font-black" style={{ background: 'linear-gradient(135deg, #f59e0b, #fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>مدونات الكريبتو</span>
              <div className="text-xs text-slate-500 leading-none -mt-0.5">Crypto Blog</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="px-4 py-2 text-slate-400 hover:text-amber-400 rounded-lg transition-all duration-200 font-medium text-sm hover:bg-slate-800/60"
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
            <LanguageToggle />
            <Link
              href="/admin"
              className="mr-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a', boxShadow: '0 2px 10px rgba(245,158,11,0.25)' }}
            >
              {t("admin")}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700/60 mt-1 pt-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="block px-4 py-2.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 py-2 flex gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            <Link
              href="/admin"
              className="block px-4 py-2.5 rounded-lg font-medium text-center mt-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a' }}
            >
              {t("admin")}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
