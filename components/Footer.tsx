"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CATEGORIES } from "@/lib/types";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="footer-bg">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-gold">
                <span className="text-slate-900 font-black text-xl">₿</span>
              </div>
              <span className="text-lg font-black gold-text">{t("brand")}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">{t("description")}</p>
            <div className="mt-4 h-0.5 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #f59e0b, transparent)' }} />
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-amber-500">{t("categories")}</h3>
            <ul className="space-y-2.5 text-sm">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/?category=${cat}`}
                    className="flex items-center gap-2 text-slate-500 hover:text-amber-400 transition-colors duration-200 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-amber-400 transition-colors" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-amber-500">{t("quickLinks")}</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/", label: tNav("home") },
                { href: "/market", label: tNav("market") },
                { href: "/admin", label: tNav("admin") },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-slate-500 hover:text-amber-400 transition-colors duration-200 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-amber-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 text-center text-sm text-slate-600" style={{ borderTop: '1px solid rgba(30,58,95,0.5)' }}>
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
