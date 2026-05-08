import fs from "node:fs/promises";
import path from "node:path";

const INPUT_FILE = path.join(process.cwd(), "migration-output", "payload-posts.json");
const DEFAULT_LIMIT = Number(process.argv[2] || 10);
const API_BASE_URL = process.env.PAYLOAD_API_URL || "http://localhost:3000";
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

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
  webEnabled: boolean;
  redirectEnabled: boolean;
};

type LexicalNode = Record<string, unknown>;

type LexicalDocument = {
  root: {
    type: "root";
    format: "";
    indent: 0;
    version: 1;
    children: LexicalNode[];
    direction: "ltr" | "rtl" | null;
  };
};

type PayloadListResponse<T> = {
  docs?: T[];
};

type PayloadDocument = {
  id: string;
  slug?: string;
};

type PayloadCreateResponse<T> = T | { doc: T };

function requireEnv() {
  if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
    throw new Error(
      "Missing PAYLOAD_EMAIL or PAYLOAD_PASSWORD. Run like: PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD='your-password' npx tsx scripts/migration/import-posts-to-payload.ts 5"
    );
  }
}

async function apiFetch<T>(pathName: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${pathName}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      `Payload API error ${response.status} ${response.statusText} for ${pathName}: ${text}`
    );
  }

  return data as T;
}

async function login() {
  requireEnv();

  const result = await apiFetch<{ token?: string }>("/api/users/login", {
    method: "POST",
    body: JSON.stringify({
      email: PAYLOAD_EMAIL,
      password: PAYLOAD_PASSWORD,
    }),
  });

  if (!result.token) {
    throw new Error("Payload login did not return a token.");
  }

  return result.token;
}

function authHeaders(token: string) {
  return {
    Authorization: `JWT ${token}`,
  };
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&hellip;/g, "…")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function htmlToPlainTextBlocks(html: string) {
  const normalizedHtml = html
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<figure[\s\S]*?<\/figure>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|h4|li|blockquote|div)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ");

  return decodeHtmlEntities(normalizedHtml)
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 500);
}

function createTextNode(text: string): LexicalNode {
  return {
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text,
    type: "text",
    version: 1,
  };
}

function createParagraphNode(text: string): LexicalNode {
  return {
    children: [createTextNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
  };
}

function htmlToLexicalDocument(html: string): LexicalDocument {
  const blocks = htmlToPlainTextBlocks(html);
  const children = blocks.length > 0 ? blocks.map(createParagraphNode) : [createParagraphNode("")];

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children,
    },
  };
}

function calculateReadingTime(text: string) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 220));
}

function createFallbackContent(post: PayloadImportPost) {
  const plainTextBlocks = htmlToPlainTextBlocks(post.contentHtml);
  const plainText = plainTextBlocks.join(" ").trim();
  const fallbackText =
    plainText ||
    post.excerpt?.trim() ||
    post.seoDescription?.trim() ||
    post.title?.trim() ||
    "Bu içerik WordPress arşivinden taşındı. Yayına alınmadan önce editoryal olarak kontrol edilmelidir.";

  const excerpt =
    post.excerpt?.trim() ||
    post.seoDescription?.trim() ||
    fallbackText.slice(0, 180).trim();

  const body = plainText
    ? htmlToLexicalDocument(post.contentHtml)
    : htmlToLexicalDocument(`<p>${fallbackText}</p>`);

  return {
    body,
    excerpt,
    plainText: fallbackText,
  };
}

async function findBySlug(collection: string, slug: string, token: string) {
  const encodedSlug = encodeURIComponent(slug);
  const result = await apiFetch<PayloadListResponse<PayloadDocument>>(
    `/api/${collection}?where[slug][equals]=${encodedSlug}&limit=1`,
    {
      headers: authHeaders(token),
    }
  );

  return result.docs?.[0] || null;
}

async function createDocument(collection: string, data: Record<string, unknown>, token: string) {
  const result = await apiFetch<PayloadCreateResponse<PayloadDocument>>(`/api/${collection}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  return "doc" in result ? result.doc : result;
}

async function findOrCreateCategory(title: string | null, token: string) {
  const categoryTitle = title?.trim() || "Genel";
  const categorySlug = slugify(categoryTitle) || "genel";
  const existing = await findBySlug("categories", categorySlug, token);

  if (existing) return existing.id;

  const created = await createDocument(
    "categories",
    {
      title: categoryTitle,
      slug: categorySlug,
    },
    token
  );

  return created.id;
}

async function findOrCreateTag(title: string, token: string) {
  const tagTitle = title.trim();
  const tagSlug = slugify(tagTitle);

  if (!tagTitle || !tagSlug) return null;

  const existing = await findBySlug("tags", tagSlug, token);
  if (existing) return existing.id;

  const created = await createDocument(
    "tags",
    {
      title: tagTitle,
      slug: tagSlug,
    },
    token
  );

  return created.id;
}

async function postExists(slug: string, token: string) {
  return Boolean(await findBySlug("posts", slug, token));
}

async function main() {
  const raw = await fs.readFile(INPUT_FILE, "utf8");
  const posts = JSON.parse(raw) as PayloadImportPost[];
  const postsToImport = posts.slice(0, DEFAULT_LIMIT);
  const token = await login();

  let importedCount = 0;
  let skippedCount = 0;

  for (const post of postsToImport) {
    if (await postExists(post.slug, token)) {
      skippedCount += 1;
      console.log(`Skipped existing post: ${post.slug}`);
      continue;
    }

    const categoryId = await findOrCreateCategory(post.category, token);
    const tagIds = (
      await Promise.all(post.tags.slice(0, 12).map((tag) => findOrCreateTag(tag, token)))
    ).filter(Boolean) as string[];

    const fallbackContent = createFallbackContent(post);

    const plainText = htmlToPlainTextBlocks(post.contentHtml).join(" ");

    await createDocument(
      "posts",
      {
        title: post.title,
        excerpt: fallbackContent.excerpt,
        body: fallbackContent.body,
        webEnabled: false,
        slug: post.slug,
        seoTitle: post.seoTitle || post.title,
        seoDescription: post.seoDescription || fallbackContent.excerpt,
        oldUrl: post.oldUrl,
        noIndex: false,
        category: categoryId,
        tags: tagIds,
        relatedPosts: [],
        faqs: [],
        publishedAt: post.originalPublishedAt || new Date().toISOString(),
        originalPublishedAt: post.originalPublishedAt,
        updatedAt: post.updatedAt || post.originalPublishedAt || new Date().toISOString(),
        readingTime: calculateReadingTime(fallbackContent.plainText),
        _status: "draft",
      },
      token
    );

    importedCount += 1;
    console.log(`Imported: ${post.slug}`);
  }

  console.log(`Done. Imported ${importedCount} posts, skipped ${skippedCount} existing posts.`);
  console.log("Imported posts are drafts and webEnabled=false by default.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});