import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مدونات الكريبتو - Crypto Blog",
  description: "منصة عربية متخصصة في عالم العملات الرقمية والتداول والتحليل الفني",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
