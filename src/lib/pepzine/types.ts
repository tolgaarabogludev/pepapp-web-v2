export type PepzineCategory =
  | "döngü"
  | "zihin"
  | "beslenme"
  | "hareket"
  | "uyku"
  | "ilişkiler";

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
  date: string;
  updatedDate?: string;
  category: PepzineCategory;
  tags: string[];
  author: string;
  coverImage?: string;
  featured?: boolean;
  readingTime?: number;
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
