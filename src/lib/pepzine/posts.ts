import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PepzinePost, PepzinePostMeta, PepzineCategory } from "./types";
export type { PepzineCategory } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "src/content/pepzine");

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}

function getPostFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
}

export function getAllPosts(category?: PepzineCategory): PepzinePostMeta[] {
  const files = getPostFiles();

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
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

export function getPostBySlug(slug: string): PepzinePost | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
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
  currentSlug: string,
  category: PepzineCategory,
  limit = 3
): PepzinePostMeta[] {
  return getAllPosts(category)
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit);
}

export function getAllSlugs(): string[] {
  return getPostFiles().map((f) => f.replace(/\.mdx$/, ""));
}

