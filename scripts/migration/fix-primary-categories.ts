

import fs from "node:fs/promises";
import path from "node:path";

const INPUT_FILE = path.join(process.cwd(), "migration-output", "posts.json");
const REPORT_FILE = path.join(process.cwd(), "migration-output", "fix-primary-categories-report.json");
const API_BASE_URL = process.env.PAYLOAD_API_URL || "http://localhost:3000";
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;
const DEFAULT_LIMIT = Number(process.argv[2] || 3000);

const IGNORED_CATEGORY_SLUGS = new Set([
  "bunlar-taze",
  "bunlar-tazeee",
  "taze",
  "yeniler",
  "yeni",
  "one-cikanlar",
  "featured",
  "uncategorized",
]);

type ParsedPost = {
  id: string;
  title: string;
  slug: string;
  oldUrl: string;
  categories: string[];
};

type PayloadListResponse<T> = {
  docs?: T[];
  totalDocs?: number;
};

type PayloadRelation = string | { id?: string; title?: string; slug?: string } | null;

type PayloadDocument = {
  id: string;
  title?: string;
  slug?: string;
  category?: PayloadRelation;
};

type PayloadCreateResponse<T> = T | { doc: T };

type FixReportItem = {
  slug: string;
  title: string;
  originalCategories: string[];
  chosenCategory?: string | null;
  chosenCategorySlug?: string | null;
  status: "updated" | "skipped" | "failed";
  reason?: string;
};

function requireEnv() {
  if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
    throw new Error(
      "Missing PAYLOAD_EMAIL or PAYLOAD_PASSWORD. Run like: PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD='your-password' npx tsx scripts/migration/fix-primary-categories.ts 3000"
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

function getRelationId(relation?: PayloadRelation) {
  if (!relation) return null;
  if (typeof relation === "string") return relation;
  return relation.id || null;
}

function getRealPrimaryCategory(categories: string[]) {
  const cleanedCategories = categories
    .map((category) => category.trim())
    .filter(Boolean);

  const realCategories = cleanedCategories.filter((category) => {
    const categorySlug = slugify(category);
    return !IGNORED_CATEGORY_SLUGS.has(categorySlug);
  });

  return realCategories[0] || null;
}

async function findBySlug(collection: string, slug: string, token: string) {
  const encodedSlug = encodeURIComponent(slug);
  const result = await apiFetch<PayloadListResponse<PayloadDocument>>(
    `/api/${collection}?where[slug][equals]=${encodedSlug}&limit=1&depth=1`,
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

async function findOrCreateCategory(title: string, token: string) {
  const categorySlug = slugify(title);
  const existing = await findBySlug("categories", categorySlug, token);

  if (existing) return existing;

  return createDocument(
    "categories",
    {
      title,
      slug: categorySlug,
    },
    token
  );
}

async function findPostBySlug(slug: string, token: string) {
  return findBySlug("posts", slug, token);
}

async function updatePostCategory(postId: string, categoryId: string, token: string) {
  return apiFetch(`/api/posts/${postId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({
      category: categoryId,
    }),
  });
}

async function main() {
  const raw = await fs.readFile(INPUT_FILE, "utf8");
  const sourcePosts = (JSON.parse(raw) as ParsedPost[]).slice(0, DEFAULT_LIMIT);
  const token = await login();
  const report: FixReportItem[] = [];

  for (const sourcePost of sourcePosts) {
    try {
      const chosenCategory = getRealPrimaryCategory(sourcePost.categories);
      const chosenCategorySlug = chosenCategory ? slugify(chosenCategory) : null;

      if (!chosenCategory || !chosenCategorySlug) {
        report.push({
          slug: sourcePost.slug,
          title: sourcePost.title,
          originalCategories: sourcePost.categories,
          chosenCategory,
          chosenCategorySlug,
          status: "skipped",
          reason: "No real category found after ignoring feed/editorial categories",
        });
        continue;
      }

      const payloadPost = await findPostBySlug(sourcePost.slug, token);

      if (!payloadPost) {
        report.push({
          slug: sourcePost.slug,
          title: sourcePost.title,
          originalCategories: sourcePost.categories,
          chosenCategory,
          chosenCategorySlug,
          status: "skipped",
          reason: "Post not found in Payload",
        });
        continue;
      }

      const targetCategory = await findOrCreateCategory(chosenCategory, token);
      const currentCategoryId = getRelationId(payloadPost.category);

      if (currentCategoryId === targetCategory.id) {
        report.push({
          slug: sourcePost.slug,
          title: sourcePost.title,
          originalCategories: sourcePost.categories,
          chosenCategory,
          chosenCategorySlug,
          status: "skipped",
          reason: "Already assigned to target category",
        });
        continue;
      }

      await updatePostCategory(payloadPost.id, targetCategory.id, token);

      report.push({
        slug: sourcePost.slug,
        title: sourcePost.title,
        originalCategories: sourcePost.categories,
        chosenCategory,
        chosenCategorySlug,
        status: "updated",
      });

      console.log(`Updated ${sourcePost.slug}: ${chosenCategory}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.push({
        slug: sourcePost.slug,
        title: sourcePost.title,
        originalCategories: sourcePost.categories,
        status: "failed",
        reason: message,
      });
      console.error(`Failed ${sourcePost.slug}: ${message}`);
    }
  }

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");

  console.log(`Updated: ${report.filter((item) => item.status === "updated").length}`);
  console.log(`Skipped: ${report.filter((item) => item.status === "skipped").length}`);
  console.log(`Failed: ${report.filter((item) => item.status === "failed").length}`);
  console.log(`Report: ${REPORT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});