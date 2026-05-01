import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PepzinePost, PepzinePostMeta, PepzineCategory } from "./types";
export type { PepzineCategory } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "src/content/pepzine");
const SUPPORTED_LOCALES = ["tr", "en"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

function getLocaleContentDir(locale: string): string {
  const safeLocale = isSupportedLocale(locale) ? locale : "tr";
  return path.join(CONTENT_DIR, safeLocale);
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}

function getPostFiles(locale: string): string[] {
  const localeDir = getLocaleContentDir(locale);
  if (!fs.existsSync(localeDir)) return [];
  return fs.readdirSync(localeDir).filter((f) => f.endsWith(".mdx"));
}

export function getAllPosts(
  locale: string,
  category?: PepzineCategory
): PepzinePostMeta[] {
  const localeDir = getLocaleContentDir(locale);
  const files = getPostFiles(locale);

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(localeDir, file), "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = {
      ...(data as Omit<PepzinePostMeta["frontmatter"], "readingTime">),
      readingTime: estimateReadingTime(content),
    };
    return { slug, frontmatter } satisfies PepzinePostMeta;
  });

  const filtered = category
    ? posts.filter((p) => p.frontmatter.category === category)
    : posts;

  return filtered.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );
}

export function getPostBySlug(locale: string, slug: string): PepzinePost | null {
  const localeDir = getLocaleContentDir(locale);
  const filePath = path.join(localeDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = {
    ...(data as Omit<PepzinePost["frontmatter"], "readingTime">),
    readingTime: estimateReadingTime(content),
  };
  return { slug, frontmatter, content };
}

export function getRelatedPosts(
  locale: string,
  currentSlug: string,
  category: PepzineCategory,
  limit = 3
): PepzinePostMeta[] {
  return getAllPosts(locale, category)
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit);
}

export function getAllSlugs(locale: string): string[] {
  return getPostFiles(locale).map((f) => f.replace(/\.mdx$/, ""));
}
