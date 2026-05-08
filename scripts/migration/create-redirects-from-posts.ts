

import fs from "node:fs/promises";
import path from "node:path";

const REPORT_FILE = path.join(process.cwd(), "migration-output", "create-redirects-report.json");
const API_BASE_URL = process.env.PAYLOAD_API_URL || "http://localhost:3000";
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;
const DEFAULT_LIMIT = Number(process.argv[2] || 3000);
const LOCALE = process.env.REDIRECT_LOCALE || "tr";

type PayloadListResponse<T> = {
  docs?: T[];
  totalDocs?: number;
  hasNextPage?: boolean;
  nextPage?: number | null;
};

type PayloadDocument = {
  id: string;
  source?: string;
};

type PayloadCreateResponse<T> = T | { doc: T };

type PayloadPost = {
  id: string;
  title?: string | null;
  slug?: string | null;
  oldUrl?: string | null;
  webEnabled?: boolean | null;
  _status?: "draft" | "published" | null;
};

type RedirectReportItem = {
  slug: string;
  source?: string | null;
  destination?: string | null;
  enabled?: boolean;
  status: "created" | "skipped" | "failed";
  reason?: string;
};

function requireEnv() {
  if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
    throw new Error(
      "Missing PAYLOAD_EMAIL or PAYLOAD_PASSWORD. Run like: PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD='your-password' npx tsx scripts/migration/create-redirects-from-posts.ts 3000"
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

function normalizePath(value?: string | null) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return normalizePath(url.pathname);
  } catch {
    const cleanedPath = value
      .trim()
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/[#?].*$/, "")
      .replace(/\/+/g, "/");

    const withLeadingSlash = cleanedPath.startsWith("/") ? cleanedPath : `/${cleanedPath}`;
    return withLeadingSlash === "/" ? "/" : withLeadingSlash.replace(/\/$/, "");
  }
}

function getDestination(slug: string) {
  return `/${LOCALE}/pepzine/${slug}`;
}

function isRedirectEnabled(post: PayloadPost) {
  return post._status === "published" && post.webEnabled === true;
}

async function findRedirectBySource(source: string, token: string) {
  const encodedSource = encodeURIComponent(source);
  const result = await apiFetch<PayloadListResponse<PayloadDocument>>(
    `/api/redirects?where[source][equals]=${encodedSource}&limit=1`,
    {
      headers: authHeaders(token),
    }
  );

  return result.docs?.[0] || null;
}

async function createRedirect(
  data: {
    source: string;
    destination: string;
    statusCode: "301" | "302";
    enabled: boolean;
  },
  token: string
) {
  const result = await apiFetch<PayloadCreateResponse<PayloadDocument>>("/api/redirects", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  return "doc" in result ? result.doc : result;
}

async function fetchPosts(token: string) {
  const result = await apiFetch<PayloadListResponse<PayloadPost>>(
    `/api/posts?limit=${DEFAULT_LIMIT}&depth=0&sort=-createdAt`,
    {
      headers: authHeaders(token),
    }
  );

  return result.docs || [];
}

async function main() {
  const token = await login();
  const posts = await fetchPosts(token);
  const report: RedirectReportItem[] = [];

  for (const post of posts) {
    try {
      const source = normalizePath(post.oldUrl);
      const slug = post.slug?.trim();

      if (!source || !slug) {
        report.push({
          slug: slug || post.id,
          source,
          status: "skipped",
          reason: "Missing oldUrl or slug",
        });
        continue;
      }

      const destination = getDestination(slug);

      if (source === destination) {
        report.push({
          slug,
          source,
          destination,
          status: "skipped",
          reason: "Source and destination are the same",
        });
        continue;
      }

      const existing = await findRedirectBySource(source, token);

      if (existing) {
        report.push({
          slug,
          source,
          destination,
          enabled: isRedirectEnabled(post),
          status: "skipped",
          reason: "Redirect already exists",
        });
        continue;
      }

      const enabled = isRedirectEnabled(post);

      await createRedirect(
        {
          source,
          destination,
          statusCode: "301",
          enabled,
        },
        token
      );

      report.push({
        slug,
        source,
        destination,
        enabled,
        status: "created",
      });

      console.log(`Created redirect: ${source} → ${destination} (${enabled ? "enabled" : "disabled"})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.push({
        slug: post.slug || post.id,
        source: post.oldUrl,
        status: "failed",
        reason: message,
      });
      console.error(`Failed ${post.slug}: ${message}`);
    }
  }

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");

  console.log(`Created: ${report.filter((item) => item.status === "created").length}`);
  console.log(`Skipped: ${report.filter((item) => item.status === "skipped").length}`);
  console.log(`Failed: ${report.filter((item) => item.status === "failed").length}`);
  console.log(`Report: ${REPORT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});