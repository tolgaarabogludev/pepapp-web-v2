

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MEDIA_DIR = path.join(process.cwd(), "public", "payload", "media");
const API_BASE_URL = process.env.PAYLOAD_API_URL || "http://localhost:3000";
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;
const DEFAULT_LIMIT = Number(process.argv[2] || 2500);

type PayloadListResponse<T> = {
  docs?: T[];
};

type PayloadMediaDoc = {
  id: string;
  filename?: string | null;
  mimeType?: string | null;
  sizes?: Record<string, unknown> | null;
};

function requireEnv() {
  if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
    throw new Error(
      "Missing PAYLOAD_EMAIL or PAYLOAD_PASSWORD. Run like: PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD='your-password' npx tsx scripts/migration/backfill-media-variants.ts 2500"
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
    throw new Error(`Payload API error ${response.status} ${response.statusText} for ${pathName}: ${text}`);
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

  if (!result.token) throw new Error("Payload login did not return a token.");
  return result.token;
}

function authHeaders(token: string) {
  return {
    Authorization: `JWT ${token}`,
  };
}

async function fetchMedia(token: string) {
  const result = await apiFetch<PayloadListResponse<PayloadMediaDoc>>(
    `/api/media?limit=${DEFAULT_LIMIT}&depth=0`,
    {
      headers: authHeaders(token),
    }
  );

  return result.docs || [];
}

function variantName(filename: string, suffix: string) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  return `${base}-${suffix}.webp`;
}

async function ensureVariant(
  sourcePath: string,
  targetPath: string,
  transform: (image: sharp.Sharp) => sharp.Sharp
) {
  try {
    await fs.access(targetPath);
    return;
  } catch {
    // continue
  }

  const image = sharp(sourcePath, { failOn: "none" }).rotate();
  await transform(image).webp({ quality: 80, effort: 6 }).toFile(targetPath);
}

async function patchMediaSizes(id: string, sizes: Record<string, unknown>, token: string) {
  await apiFetch(`/api/media/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ sizes }),
  });
}

async function main() {
  const token = await login();
  const mediaDocs = await fetchMedia(token);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const media of mediaDocs) {
    try {
      if (!media.filename) {
        skipped += 1;
        continue;
      }

      const sourcePath = path.join(MEDIA_DIR, media.filename);

      try {
        await fs.access(sourcePath);
      } catch {
        skipped += 1;
        continue;
      }

      const cardFile = variantName(media.filename, "card");
      const thumbFile = variantName(media.filename, "thumb");
      const heroFile = variantName(media.filename, "hero");

      const cardPath = path.join(MEDIA_DIR, cardFile);
      const thumbPath = path.join(MEDIA_DIR, thumbFile);
      const heroPath = path.join(MEDIA_DIR, heroFile);

      await ensureVariant(sourcePath, cardPath, (image) =>
        image.resize({ width: 800, height: 600, fit: "cover", withoutEnlargement: true })
      );

      await ensureVariant(sourcePath, thumbPath, (image) =>
        image.resize({ width: 400, height: 300, fit: "cover", withoutEnlargement: true })
      );

      await ensureVariant(sourcePath, heroPath, (image) =>
        image.resize({ width: 1600, height: 900, fit: "inside", withoutEnlargement: true })
      );

      await patchMediaSizes(
        media.id,
        {
          ...(media.sizes || {}),
          card: {
            filename: cardFile,
            mimeType: "image/webp",
            url: `/payload/media/${cardFile}`,
          },
          thumb: {
            filename: thumbFile,
            mimeType: "image/webp",
            url: `/payload/media/${thumbFile}`,
          },
          hero: {
            filename: heroFile,
            mimeType: "image/webp",
            url: `/payload/media/${heroFile}`,
          },
        },
        token
      );

      updated += 1;
      console.log(`Backfilled variants: ${media.filename}`);
    } catch (error) {
      failed += 1;
      console.error(`Failed: ${media.filename} → ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});