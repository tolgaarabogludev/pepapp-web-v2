

import fs from "node:fs/promises";
import path from "node:path";

const REPORT_FILE = path.join(process.cwd(), "migration-output", "import-audit-report.json");
const API_BASE_URL = process.env.PAYLOAD_API_URL || "http://localhost:3000";
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;
const DEFAULT_LIMIT = Number(process.argv[2] || 100);

type PayloadListResponse<T> = {
  docs?: T[];
  totalDocs?: number;
};

type PayloadRelation = string | { id?: string; title?: string; slug?: string } | null;

type PayloadPost = {
  id: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  body?: unknown;
  webEnabled?: boolean | null;
  _status?: "draft" | "published" | null;
  oldUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  category?: PayloadRelation;
  tags?: PayloadRelation[] | null;
  coverImage?: PayloadRelation;
  publishedAt?: string | null;
  originalPublishedAt?: string | null;
  updatedAt?: string | null;
  readingTime?: number | null;
};

type AuditIssue = {
  slug: string;
  title?: string | null;
  severity: "error" | "warning";
  field: string;
  message: string;
};

type AuditReport = {
  checkedAt: string;
  totalDocs: number;
  checkedDocs: number;
  summary: {
    errors: number;
    warnings: number;
    missingExcerpt: number;
    missingBody: number;
    missingCategory: number;
    missingOldUrl: number;
    missingSeo: number;
    missingCoverImage: number;
    publishedOrWebEnabled: number;
  };
  issues: AuditIssue[];
};

function requireEnv() {
  if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
    throw new Error(
      "Missing PAYLOAD_EMAIL or PAYLOAD_PASSWORD. Run like: PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD='your-password' npx tsx scripts/migration/audit-imported-posts.ts 100"
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

function hasLexicalBody(body: unknown) {
  if (!body || typeof body !== "object") return false;

  const root = (body as { root?: { children?: unknown[] } }).root;
  return Array.isArray(root?.children) && root.children.length > 0;
}

function relationHasValue(value: PayloadRelation | PayloadRelation[] | null | undefined) {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value.id);
}

function addIssue(
  issues: AuditIssue[],
  post: PayloadPost,
  severity: AuditIssue["severity"],
  field: string,
  message: string
) {
  issues.push({
    slug: post.slug || post.id,
    title: post.title,
    severity,
    field,
    message,
  });
}

async function fetchPosts(token: string) {
  return apiFetch<PayloadListResponse<PayloadPost>>(
    `/api/posts?limit=${DEFAULT_LIMIT}&depth=1&sort=-createdAt`,
    {
      headers: authHeaders(token),
    }
  );
}

function auditPost(post: PayloadPost, issues: AuditIssue[]) {
  if (!post.slug) {
    addIssue(issues, post, "error", "slug", "Slug is missing.");
  }

  if (!post.title?.trim()) {
    addIssue(issues, post, "error", "title", "Title is missing.");
  }

  if (!post.excerpt?.trim()) {
    addIssue(issues, post, "error", "excerpt", "Excerpt is missing.");
  }

  if (!hasLexicalBody(post.body)) {
    addIssue(issues, post, "error", "body", "Body is missing or empty.");
  }

  if (!relationHasValue(post.category)) {
    addIssue(issues, post, "error", "category", "Category relation is missing.");
  }

  if (!post.oldUrl?.trim()) {
    addIssue(issues, post, "warning", "oldUrl", "Old WordPress URL is missing.");
  }

  if (!post.seoTitle?.trim() || !post.seoDescription?.trim()) {
    addIssue(issues, post, "warning", "seo", "SEO title or SEO description is missing.");
  }

  if (!relationHasValue(post.coverImage)) {
    addIssue(issues, post, "warning", "coverImage", "Cover image is missing.");
  }

  if (post.webEnabled || post._status === "published") {
    addIssue(
      issues,
      post,
      "warning",
      "publishing",
      "Imported post is published or webEnabled. Migration imports should stay draft and webEnabled=false until QA."
    );
  }

  if (!post.originalPublishedAt) {
    addIssue(issues, post, "warning", "originalPublishedAt", "Original publish date is missing.");
  }

  if (!post.readingTime || post.readingTime < 1) {
    addIssue(issues, post, "warning", "readingTime", "Reading time is missing or invalid.");
  }
}

function createSummary(issues: AuditIssue[]) {
  return {
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
    missingExcerpt: issues.filter((issue) => issue.field === "excerpt").length,
    missingBody: issues.filter((issue) => issue.field === "body").length,
    missingCategory: issues.filter((issue) => issue.field === "category").length,
    missingOldUrl: issues.filter((issue) => issue.field === "oldUrl").length,
    missingSeo: issues.filter((issue) => issue.field === "seo").length,
    missingCoverImage: issues.filter((issue) => issue.field === "coverImage").length,
    publishedOrWebEnabled: issues.filter((issue) => issue.field === "publishing").length,
  };
}

async function main() {
  const token = await login();
  const result = await fetchPosts(token);
  const posts = result.docs || [];
  const issues: AuditIssue[] = [];

  posts.forEach((post) => auditPost(post, issues));

  const report: AuditReport = {
    checkedAt: new Date().toISOString(),
    totalDocs: result.totalDocs || posts.length,
    checkedDocs: posts.length,
    summary: createSummary(issues),
    issues,
  };

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");

  console.log(`Audited ${report.checkedDocs} posts out of ${report.totalDocs} total docs.`);
  console.log(`Errors: ${report.summary.errors}`);
  console.log(`Warnings: ${report.summary.warnings}`);
  console.log(`Missing cover images: ${report.summary.missingCoverImage}`);
  console.log(`Report: ${REPORT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});