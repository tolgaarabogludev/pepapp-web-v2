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

export interface PepzineFrontmatter {
  title: string;
  description: string;
  date: string;
  category: PepzineCategory;
  tags: string[];
  author: string;
  coverImage?: string;
  featured?: boolean;
  readingTime?: number;
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
