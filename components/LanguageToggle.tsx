"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <button onClick={switchLocale} className="btn-outline"
      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
      title={locale === "ar" ? "English" : "عربي"}>
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
