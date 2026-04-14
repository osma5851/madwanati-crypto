"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CATEGORIES } from "@/lib/types";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer style={{ background: '#0d1a2d', borderTop: '1px solid rgba(30,58,95,0.6)' }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 15px rgba(245,158,11,0.25)' }}
              >
                <span className="text-slate-900 font-black text-xl">₿</span>
              </div>
              <div>
                <span
                  className="text-lg font-black"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {t("brand")}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
              {t("description")}
            </p>
            <div className="mt-4 h-0.5 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #f59e0b, transparent)' }} />
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: '#f59e0b' }}>{t("categories")}</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/?category=${cat}`}
                    className="flex items-center gap-2 transition-colors duration-200 hover:translate-x-1 group"
                    style={{ color: '#64748b' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200 group-hover:bg-amber-400" style={{ background: '#1e3a5f' }} />
                    <span className="group-hover:text-amber-400 transition-colors duration-200">{cat}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: '#f59e0b' }}>{t("quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: tNav("home") },
                { href: "/admin", label: tNav("admin") },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 transition-colors duration-200 group"
                    style={{ color: '#64748b' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200 group-hover:bg-amber-400" style={{ background: '#1e3a5f' }} />
                    <span className="group-hover:text-amber-400 transition-colors duration-200">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 text-center text-sm"
          style={{ borderTop: '1px solid rgba(30,58,95,0.5)', color: '#334155' }}
        >
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
