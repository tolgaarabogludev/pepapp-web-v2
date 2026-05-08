import fs from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";

const INPUT_FILE = path.join(process.cwd(), "migration-output", "payload-posts.json");
const REPORT_FILE = path.join(process.cwd(), "migration-output", "image-migration-report.json");
const DEFAULT_LIMIT = Number(process.argv[2] || 10);
const API_BASE_URL = process.env.PAYLOAD_API_URL || "http://localhost:3000";
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

type PayloadImportPost = {
  title: string;
  slug: string;
  oldUrl: string;
  featuredImageUrl?: string;
};

type PayloadListResponse<T> = {
  docs?: T[];
};

type PayloadDocument = {
  id: string;
  slug?: string;
  coverImage?: string | { id?: string } | null;
};

type PayloadCreateResponse<T> = T | { doc: T };

type ImageMigrationReportItem = {
  slug: string;
  imageUrl?: string;
  status: "uploaded" | "skipped" | "failed";
  reason?: string;
  mediaId?: string;
};

function requireEnv() {
  if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
    throw new Error(
      "Missing PAYLOAD_EMAIL or PAYLOAD_PASSWORD. Run like: PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD='your-password' npx tsx scripts/migration/import-featured-images.ts 10"
    );
  }
}

async function apiFetch<T>(pathName: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${pathName}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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

async function findPostBySlug(slug: string, token: string) {
  const encodedSlug = encodeURIComponent(slug);
  const result = await apiFetch<PayloadListResponse<PayloadDocument>>(
    `/api/posts?where[slug][equals]=${encodedSlug}&limit=1&depth=1`,
    {
      headers: authHeaders(token),
    }
  );

  return result.docs?.[0] || null;
}

async function uploadMediaFromUrl(post: PayloadImportPost, token: string) {
  if (!post.featuredImageUrl) {
    throw new Error("Missing featuredImageUrl");
  }

  const response = await fetch(post.featuredImageUrl);

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const detectedType = await fileTypeFromBuffer(buffer);
  const contentType = detectedType?.mime || response.headers.get("content-type") || "image/jpeg";
  const extension = detectedType?.ext || contentType.split("/")[1] || "jpg";
  const safeSlug = post.slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const filename = `${safeSlug}.${extension}`;

  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: contentType }), filename);
  formData.append(
    "_payload",
    JSON.stringify({
      alt: post.title,
    })
  );

  const result = await apiFetch<PayloadCreateResponse<PayloadDocument>>("/api/media", {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });

  return "doc" in result ? result.doc : result;
}

async function updatePostCoverImage(postId: string, mediaId: string, token: string) {
  return apiFetch<PayloadDocument>(`/api/posts/${postId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({
      coverImage: mediaId,
    }),
  });
}

async function main() {
  const raw = await fs.readFile(INPUT_FILE, "utf8");
  const posts = (JSON.parse(raw) as PayloadImportPost[])
    .filter((post) => Boolean(post.featuredImageUrl))
    .slice(0, DEFAULT_LIMIT);
  const token = await login();
  const report: ImageMigrationReportItem[] = [];

  for (const post of posts) {
    try {
      const existingPost = await findPostBySlug(post.slug, token);

      if (!existingPost) {
        report.push({
          slug: post.slug,
          imageUrl: post.featuredImageUrl,
          status: "skipped",
          reason: "Post not found in Payload",
        });
        console.log(`Skipped ${post.slug}: post not found`);
        continue;
      }

      const existingCoverImageId =
        typeof existingPost.coverImage === "object" ? existingPost.coverImage?.id : existingPost.coverImage;

      if (existingCoverImageId) {
        report.push({
          slug: post.slug,
          imageUrl: post.featuredImageUrl,
          status: "skipped",
          reason: "Post already has coverImage",
          mediaId: existingCoverImageId,
        });
        console.log(`Skipped ${post.slug}: already has cover image`);
        continue;
      }

      const media = await uploadMediaFromUrl(post, token);
      await updatePostCoverImage(existingPost.id, media.id, token);

      report.push({
        slug: post.slug,
        imageUrl: post.featuredImageUrl,
        status: "uploaded",
        mediaId: media.id,
      });
      console.log(`Uploaded image for ${post.slug}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.push({
        slug: post.slug,
        imageUrl: post.featuredImageUrl,
        status: "failed",
        reason: message,
      });
      console.error(`Failed ${post.slug}: ${message}`);
    }
  }

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");
  console.log(`Done. Report: ${REPORT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
