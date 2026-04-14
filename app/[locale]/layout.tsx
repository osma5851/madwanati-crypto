import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/lib/theme-context";
import AiChat from "@/components/AiChat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مدونات الكريبتو - Crypto Blog",
  description: "منصة عربية متخصصة في عالم العملات الرقمية والتداول والتحليل الفني",
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} className="h-full" style={{ background: '#09090b' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full font-arabic antialiased"
        style={{
          background: '#09090b',
          color: '#fafafa',
          fontFamily: isRTL
            ? "'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif"
            : "'Inter', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif",
        }}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
            <AiChat />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
