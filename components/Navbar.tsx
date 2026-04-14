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
    <nav className="nav-bar sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 btn-gold">
              <span className="text-slate-900 font-black text-xl">₿</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black gold-text">مدونات الكريبتو</span>
              <div className="text-[10px] text-slate-500 leading-none -mt-0.5">Crypto Blog</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="px-3 py-2 text-slate-400 hover:text-amber-400 rounded-lg transition-all duration-200 font-medium text-sm hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-1 mx-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            <Link href="/admin" className="btn-gold text-xs px-3 py-2 rounded-lg">
              {t("admin")}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
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
          <div className="lg:hidden pb-4 border-t border-slate-700/40 mt-1 pt-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="block px-4 py-2.5 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-lg font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
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
              className="block mx-4 py-2.5 btn-gold rounded-lg font-medium text-center mt-2"
              onClick={() => setMobileOpen(false)}
            >
              {t("admin")}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
