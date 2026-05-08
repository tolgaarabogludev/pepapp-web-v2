import fs from "node:fs/promises";
import path from "node:path";

const REPORT_FILE = path.join(process.cwd(), "migration-output", "publish-ready-report.json");
const API_BASE_URL = process.env.PAYLOAD_API_URL || "http://localhost:3000";
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;
const DEFAULT_LIMIT = Number(process.argv[2] || 3000);

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
  coverImage?: PayloadRelation;
};

type PublishReportItem = {
  slug: string;
  status: "published" | "skipped" | "failed";
  reason?: string;
};

function requireEnv() {
  if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
    throw new Error(
      "Missing PAYLOAD_EMAIL or PAYLOAD_PASSWORD. Run like: PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD='your-password' npx tsx scripts/migration/publish-ready-posts.ts 3000"
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

function relationHasValue(value: PayloadRelation | null | undefined) {
  if (!value) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value.id);
}

async function fetchPosts(token: string) {
  return apiFetch<PayloadListResponse<PayloadPost>>(
    `/api/posts?limit=${DEFAULT_LIMIT}&depth=1`,
    {
      headers: authHeaders(token),
    }
  );
}

function isReadyToPublish(post: PayloadPost) {
  return (
    post._status === "draft" &&
    !post.webEnabled &&
    Boolean(post.slug?.trim()) &&
    Boolean(post.title?.trim()) &&
    Boolean(post.excerpt?.trim()) &&
    Boolean(post.seoTitle?.trim()) &&
    Boolean(post.seoDescription?.trim()) &&
    Boolean(post.oldUrl?.trim()) &&
    hasLexicalBody(post.body) &&
    relationHasValue(post.category) &&
    relationHasValue(post.coverImage)
  );
}

async function publishPost(postId: string, token: string) {
  return apiFetch(`/api/posts/${postId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({
      _status: "published",
      webEnabled: true,
    }),
  });
}

async function main() {
  const token = await login();
  const result = await fetchPosts(token);
  const posts = result.docs || [];
  const report: PublishReportItem[] = [];

  for (const post of posts) {
    try {
      if (!isReadyToPublish(post)) {
        report.push({
          slug: post.slug || post.id,
          status: "skipped",
          reason: "Not ready to publish",
        });
        continue;
      }

      await publishPost(post.id, token);

      report.push({
        slug: post.slug || post.id,
        status: "published",
      });

      console.log(`Published: ${post.slug}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.push({
        slug: post.slug || post.id,
        status: "failed",
        reason: message,
      });
      console.error(`Failed ${post.slug}: ${message}`);
    }
  }

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");

  const publishedCount = report.filter((item) => item.status === "published").length;
  const skippedCount = report.filter((item) => item.status === "skipped").length;
  const failedCount = report.filter((item) => item.status === "failed").length;

  console.log(`Published: ${publishedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Report: ${REPORT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
