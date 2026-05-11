export type PepzineCategory =
  | "döngü"
  | "zihin"
  | "beslenme"
  | "hareket"
  | "uyku"
  | "ilişkiler"
  | "iliskiler"
  | string;

export const CATEGORIES: PepzineCategory[] = [
  "döngü",
  "zihin",
  "beslenme",
  "hareket",
  "uyku",
  "ilişkiler",
];

export interface PepzineFaq {
  question: string;
  answer: string;
}

export interface PepzineFrontmatter {
  title: string;
  description: string;
  slug?: string;
  date: string;
  updatedAt?: string;
  category: PepzineCategory;
  categorySlug?: string;
  tags: string[];
  author: string;
  readingTime?: number;
  image?: string;
  imageAlt?: string;
  featured?: boolean;
  faqs?: PepzineFaq[];
}

export interface PepzinePost {
  slug: string;
  frontmatter: PepzineFrontmatter;
  content: string;
}

export interface PepzinePostMeta {
  slug: string;
  frontmatter: PepzineFrontmatter;
}
