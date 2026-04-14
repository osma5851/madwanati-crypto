export interface Article {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  excerpt: string;
  excerpt_en?: string;
  content: string;
  content_en?: string;
  category: string;
  tags: string[];
  author_id?: string;
  author_name: string;
  publishedAt: string;
  coverImage: string;
  featured: boolean;
  crypto_symbols?: string[];
}

export type ArticleInput = Omit<Article, "id" | "publishedAt"> & {
  id?: string;
  publishedAt?: string;
};

export interface Profile {
  id: string;
  display_name: string;
  role: "admin" | "reader";
  avatar_url?: string;
  locale: string;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  site_name_en: string;
  site_description: string;
  site_description_en: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export const CATEGORIES = [
  "بيتكوين",
  "إيثيريوم",
  "تمويل لامركزي",
  "NFT",
  "تداول",
  "تحليل فني",
  "أخبار السوق",
  "تعليم",
] as const;

export type Category = (typeof CATEGORIES)[number];
