

import fs from "node:fs/promises";
import path from "node:path";

const REPORT_FILE = path.join(process.cwd(), "migration-output", "reassign-category-report.json");
const API_BASE_URL = process.env.PAYLOAD_API_URL || "http://localhost:3000";
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

const FROM_CATEGORY_SLUG = process.env.FROM_CATEGORY_SLUG || "doktorderki";
const TO_CATEGORY_TITLE = process.env.TO_CATEGORY_TITLE || "Sağlık";
const TO_CATEGORY_SLUG = process.env.TO_CATEGORY_SLUG || "saglik";
const DEFAULT_LIMIT = Number(process.argv[2] || 3000);

type PayloadListResponse<T> = {
  docs?: T[];
  totalDocs?: number;
};

type PayloadRelation = string | { id?: string; title?: string; slug?: string } | null;

type PayloadDocument = {
  id: string;
  title?: string;
  slug?: string;
};

type PayloadPost = {
  id: string;
  title?: string | null;
  slug?: string | null;
  category?: PayloadRelation;
};

type ReassignReportItem = {
  slug: string;
  title?: string | null;
  status: "updated" | "skipped" | "failed";
  reason?: string;
};

function requireEnv() {
  if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
    throw new Error(
      "Missing PAYLOAD_EMAIL or PAYLOAD_PASSWORD. Run like: PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD='your-password' npx tsx scripts/migration/reassign-category.ts 3000"
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

async function findCategoryBySlug(slug: string, token: string) {
  const encodedSlug = encodeURIComponent(slug);
  const result = await apiFetch<PayloadListResponse<PayloadDocument>>(
    `/api/categories?where[slug][equals]=${encodedSlug}&limit=1`,
    {
      headers: authHeaders(token),
    }
  );

  return result.docs?.[0] || null;
}

async function findOrCreateTargetCategory(token: string) {
  const existing = await findCategoryBySlug(TO_CATEGORY_SLUG, token);

  if (existing) return existing;

  return apiFetch<PayloadDocument>("/api/categories", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      title: TO_CATEGORY_TITLE,
      slug: TO_CATEGORY_SLUG,
    }),
  });
}

function getCategoryId(category?: PayloadRelation) {
  if (!category) return null;
  if (typeof category === "string") return category;
  return category.id || null;
}

async function fetchPostsByCategory(categoryId: string, token: string) {
  const result = await apiFetch<PayloadListResponse<PayloadPost>>(
    `/api/posts?where[category][equals]=${categoryId}&limit=${DEFAULT_LIMIT}&depth=1`,
    {
      headers: authHeaders(token),
    }
  );

  return result.docs || [];
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
  const token = await login();
  const sourceCategory = await findCategoryBySlug(FROM_CATEGORY_SLUG, token);

  if (!sourceCategory) {
    throw new Error(`Source category not found: ${FROM_CATEGORY_SLUG}`);
  }

  const targetCategory = await findOrCreateTargetCategory(token);
  const posts = await fetchPostsByCategory(sourceCategory.id, token);
  const report: ReassignReportItem[] = [];

  console.log(`Source category: ${sourceCategory.title || FROM_CATEGORY_SLUG} (${sourceCategory.id})`);
  console.log(`Target category: ${targetCategory.title || TO_CATEGORY_TITLE} (${targetCategory.id})`);
  console.log(`Found ${posts.length} posts to update.`);

  for (const post of posts) {
    try {
      if (getCategoryId(post.category) === targetCategory.id) {
        report.push({
          slug: post.slug || post.id,
          title: post.title,
          status: "skipped",
          reason: "Already assigned to target category",
        });
        continue;
      }

      await updatePostCategory(post.id, targetCategory.id, token);

      report.push({
        slug: post.slug || post.id,
        title: post.title,
        status: "updated",
      });

      console.log(`Updated: ${post.slug}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.push({
        slug: post.slug || post.id,
        title: post.title,
        status: "failed",
        reason: message,
      });
      console.error(`Failed ${post.slug}: ${message}`);
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