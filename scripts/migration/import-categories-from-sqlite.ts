

import sqlite3 from "sqlite3";
import { open } from "sqlite";

const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || "payload.db";
const API_BASE_URL = process.env.PAYLOAD_API_URL || "http://localhost:3000";
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

type SqliteCategoryRow = {
  id: number | string;
  slug: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  title?: string | null;
};

type PayloadListResponse<T> = {
  docs?: T[];
};

type PayloadDocument = {
  id: string;
  title?: string;
  slug?: string;
};

type PayloadCreateResponse<T> = T | { doc: T };

function requireEnv() {
  if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
    throw new Error(
      "Missing PAYLOAD_EMAIL or PAYLOAD_PASSWORD. Run like: PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD='your-password' npx tsx scripts/migration/import-categories-from-sqlite.ts"
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

async function createCategory(row: SqliteCategoryRow, token: string) {
  const result = await apiFetch<PayloadCreateResponse<PayloadDocument>>("/api/categories", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      title: row.title || row.slug,
      slug: row.slug,
    }),
  });

  return "doc" in result ? result.doc : result;
}

async function readCategoriesFromSqlite() {
  const db = await open({
    filename: SQLITE_DB_PATH,
    driver: sqlite3.Database,
  });

  try {
    const rows = await db.all<SqliteCategoryRow[]>(`
      SELECT
        categories.id,
        categories.slug,
        categories.created_at,
        categories.updated_at,
        categories_locales.title
      FROM categories
      LEFT JOIN categories_locales
        ON categories.id = categories_locales._parent_id
        AND categories_locales._locale = 'tr'
      ORDER BY categories.created_at ASC
    `);

    return rows.filter((row) => Boolean(row.slug));
  } finally {
    await db.close();
  }
}

async function main() {
  const token = await login();
  const categories = await readCategoriesFromSqlite();

  let created = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Found ${categories.length} categories in SQLite.`);

  for (const category of categories) {
    try {
      if (!category.slug) {
        skipped += 1;
        continue;
      }

      const existing = await findCategoryBySlug(category.slug, token);

      if (existing) {
        skipped += 1;
        console.log(`Skipped existing category: ${category.slug}`);
        continue;
      }

      await createCategory(category, token);
      created += 1;
      console.log(`Created category: ${category.slug}`);
    } catch (error) {
      failed += 1;
      console.error(
        `Failed category ${category.slug}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  console.log(`Done. Created ${created}, skipped ${skipped}, failed ${failed}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});