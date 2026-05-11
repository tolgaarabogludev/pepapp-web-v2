/**
 * Migrates all local media files from public/payload/media/ to Vercel Blob.
 *
 * The vercelBlobStorage plugin uses filename as the Blob key (no collection prefix,
 * no composite prefixes). URLs are generated dynamically by the plugin from the
 * filename — no DB updates required.
 *
 * Usage:
 *   npx tsx scripts/migration/migrate-media-to-blob.ts
 *   npx tsx scripts/migration/migrate-media-to-blob.ts --dry-run
 *   npx tsx scripts/migration/migrate-media-to-blob.ts --concurrency=20
 *
 * Resumable: completed filenames are tracked in .migration-blob-progress.json.
 * Re-running skips already-uploaded files.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

// ── Config ────────────────────────────────────────────────────────────────────

const MEDIA_DIR = path.join(process.cwd(), "public", "payload", "media");
const PROGRESS_FILE = path.join(process.cwd(), ".migration-blob-progress.json");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const CONCURRENCY = Number(
  args.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? 10
);

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// ── Helpers ───────────────────────────────────────────────────────────────────

function mimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
  };
  return map[ext] ?? "application/octet-stream";
}

async function loadProgress(): Promise<Set<string>> {
  try {
    const raw = await fs.readFile(PROGRESS_FILE, "utf-8");
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

async function saveProgress(done: Set<string>): Promise<void> {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify([...done]), "utf-8");
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function putWithRetry(
  filename: string,
  buffer: Buffer,
  token: string,
  maxRetries = 6
): Promise<{ url: string }> {
  let attempt = 0;
  while (true) {
    try {
      return await put(filename, buffer, {
        access: "public",
        token,
        addRandomSuffix: false,
        contentType: mimeType(filename),
      });
    } catch (err) {
      const message = (err as Error).message ?? "";
      const isRateLimit =
        message.includes("Too many requests") || message.includes("429");

      if (isRateLimit && attempt < maxRetries) {
        // Parse wait time from message, default 60s, double each retry
        const waitMs = Math.min(65_000 * 2 ** attempt, 300_000);
        console.log(
          `[rate-limit] ${filename} — waiting ${(waitMs / 1000).toFixed(0)}s (attempt ${attempt + 1}/${maxRetries})`
        );
        await sleep(waitMs);
        attempt++;
      } else {
        throw err;
      }
    }
  }
}

async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number
): Promise<void> {
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const item = items[index++];
      await fn(item);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!TOKEN && !DRY_RUN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Run: source .env.local first, or use --dry-run."
    );
  }

  const entries = await fs.readdir(MEDIA_DIR);
  const files = entries.filter((e) => !e.startsWith("."));

  console.log(`\nFound ${files.length} files in ${MEDIA_DIR}`);
  console.log(`Concurrency: ${CONCURRENCY} | Dry run: ${DRY_RUN}\n`);

  const done = await loadProgress();
  const pending = files.filter((f) => !done.has(f));

  console.log(`Already uploaded: ${done.size} | Remaining: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log("Nothing to do. All files already uploaded.");
    return;
  }

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const failures: string[] = [];

  const startTime = Date.now();

  await runWithConcurrency(pending, async (filename) => {
    const filePath = path.join(MEDIA_DIR, filename);

    try {
      if (DRY_RUN) {
        console.log(`[dry-run] ${filename}`);
        skipped++;
        return;
      }

      const buffer = await fs.readFile(filePath);
      const result = await putWithRetry(filename, buffer, TOKEN!);

      done.add(filename);
      uploaded++;

      const total = uploaded + failed;
      if (total % 100 === 0) {
        await saveProgress(done);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const rate = (total / ((Date.now() - startTime) / 1000)).toFixed(1);
        console.log(
          `[${total}/${pending.length}] ${elapsed}s elapsed — ${rate} files/s — ${result.url}`
        );
      } else if (uploaded <= 5) {
        console.log(`✓ ${filename} → ${result.url}`);
      }
    } catch (err) {
      failed++;
      failures.push(filename);
      console.error(`✗ ${filename}: ${(err as Error).message}`);
    }
  }, CONCURRENCY);

  if (!DRY_RUN) {
    await saveProgress(done);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`
─────────────────────────────────────
Migration complete in ${elapsed}s
  Uploaded : ${uploaded}
  Skipped  : ${skipped} (dry-run)
  Failed   : ${failed}
  Total    : ${files.length}
─────────────────────────────────────`);

  if (failures.length > 0) {
    console.log("\nFailed files:");
    failures.forEach((f) => console.log(`  - ${f}`));
    console.log("\nRe-run the script to retry failed files.");
    process.exit(1);
  }

  if (done.size === files.length && !DRY_RUN) {
    await fs.unlink(PROGRESS_FILE).catch(() => {});
    console.log("\nProgress file cleaned up. Migration fully complete.");
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
