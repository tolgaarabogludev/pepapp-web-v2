import fs from "node:fs/promises";
import path from "node:path";

const INPUT_FILE = path.join(process.cwd(), "migration-output", "posts.json");
const OUTPUT_FILE = path.join(process.cwd(), "migration-output", "payload-posts.json");

type ParsedPost = {
  id: string;
  title: string;
  slug: string;
  oldUrl: string;
  publishedAt: string | null;
  modifiedAt: string | null;
  excerpt: string;
  contentHtml: string;
  categories: string[];
  tags: string[];
  featuredImageId?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
};

type PayloadImportPost = {
  title: string;
  slug: string;
  oldUrl: string;
  originalPublishedAt: string | null;
  updatedAt: string | null;
  excerpt: string;
  contentHtml: string;
  category: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  featuredImageId?: string;
  featuredImageUrl?: string;
  webEnabled: boolean;
  redirectEnabled: boolean;
};

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function createExcerpt(post: ParsedPost) {
  if (post.excerpt?.trim()) return post.excerpt.trim();

  const plainText = stripHtml(post.contentHtml);
  return plainText.slice(0, 180).trim();
}

function normalizeOldUrl(url: string) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.replace(/\/$/, "") || "/";
  } catch {
    return url.replace(/^https?:\/\/[^/]+/i, "").replace(/\/$/, "") || "/";
  }
}

function cleanHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\sdata-[^=]+="[^"]*"/gi, "")
    .replace(/\sclass="[^"]*"/gi, "")
    .replace(/\sid="[^"]*"/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .trim();
}

function extractFirstImageUrl(html: string) {
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (!imgMatch?.[1]) return undefined;

  return imgMatch[1]
    .replace(/^http:\/\//i, "https://")
    .trim();
}

function transformPost(post: ParsedPost): PayloadImportPost {
  return {
    title: post.title,
    slug: post.slug,
    oldUrl: normalizeOldUrl(post.oldUrl),
    originalPublishedAt: post.publishedAt,
    updatedAt: post.modifiedAt || post.publishedAt,
    excerpt: createExcerpt(post),
    contentHtml: cleanHtml(post.contentHtml),
    category: post.categories[0] || null,
    tags: post.tags,
    seoTitle: post.seoTitle || post.title,
    seoDescription: post.seoDescription || createExcerpt(post),
    focusKeyword: post.focusKeyword || null,
    featuredImageId: post.featuredImageId,
    featuredImageUrl: extractFirstImageUrl(post.contentHtml),
    webEnabled: false,
    redirectEnabled: true,
  };
}

async function main() {
  const raw = await fs.readFile(INPUT_FILE, "utf8");
  const posts = JSON.parse(raw) as ParsedPost[];

  const transformedPosts = posts.map(transformPost);

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(transformedPosts, null, 2), "utf8");

  console.log(`Transformed ${transformedPosts.length} posts for Payload import`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});