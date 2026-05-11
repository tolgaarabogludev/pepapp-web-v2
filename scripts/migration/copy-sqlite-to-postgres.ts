import sqlite3 from "sqlite3";
import { open } from "sqlite";
import pg from "pg";

const { Client } = pg;

const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || "payload.db";
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const CLEAR_TARGET = process.env.CLEAR_TARGET === "1" || process.env.CLEAR_TARGET === "true";
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || 500);

function quoteIdent(ident: string) {
  return `"${ident.replace(/"/g, '""')}"`;
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function listSqliteTables(sqlite: Awaited<ReturnType<typeof open>>) {
  const rows = await sqlite.all<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  return rows.map((r) => r.name);
}

type ForeignKeyEdge = { table: string; referencedTable: string };

async function getPostgresForeignKeys(postgres: pg.Client, tableNames: string[]): Promise<ForeignKeyEdge[]> {
  const set = new Set(tableNames);

  // Restrict to public schema tables for this project.
  const { rows } = await postgres.query<{
    table_name: string;
    referenced_table_name: string;
  }>(`
    SELECT
      tc.table_name as table_name,
      ccu.table_name as referenced_table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.constraint_schema = tc.constraint_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  `);

  return rows
    .filter((r) => set.has(r.table_name) && set.has(r.referenced_table_name))
    .map((r) => ({
      table: r.table_name,
      referencedTable: r.referenced_table_name,
    }));
}

function topoSortTables(tableNames: string[], edges: ForeignKeyEdge[]) {
  const deps = new Map<string, Set<string>>();
  const reverse = new Map<string, Set<string>>();

  for (const t of tableNames) {
    deps.set(t, new Set());
    reverse.set(t, new Set());
  }

  for (const e of edges) {
    // e.table depends on e.referencedTable
    if (e.table === e.referencedTable) continue;
    deps.get(e.table)?.add(e.referencedTable);
    reverse.get(e.referencedTable)?.add(e.table);
  }

  const ready: string[] = [];
  for (const [t, d] of deps) {
    if (d.size === 0) ready.push(t);
  }

  const result: string[] = [];
  while (ready.length) {
    const t = ready.shift()!;
    result.push(t);

    for (const child of reverse.get(t) || []) {
      const d = deps.get(child);
      if (!d) continue;
      d.delete(t);
      if (d.size === 0) ready.push(child);
    }
  }

  // If we couldn't resolve everything (cycle), fall back to original order for remaining tables.
  if (result.length !== tableNames.length) {
    const remaining = tableNames.filter((t) => !result.includes(t));
    return [...result, ...remaining];
  }

  return result;
}

async function main() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL (or POSTGRES_URL) is required.");
  }

  console.log("SQLite → Postgres copy starting…");
  console.log(`SQLite: ${SQLITE_DB_PATH}`);

  const sqlite = await open({ filename: SQLITE_DB_PATH, driver: sqlite3.Database });
  const postgres = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await postgres.connect();

    const sqliteTables = await listSqliteTables(sqlite);
    console.log(`Found ${sqliteTables.length} tables in SQLite.`);

    const fkEdges = await getPostgresForeignKeys(postgres, sqliteTables);
    const tables = topoSortTables(sqliteTables, fkEdges);
    console.log(`Insert order computed from ${fkEdges.length} foreign keys.`);

    if (CLEAR_TARGET) {
      console.log("CLEAR_TARGET enabled. Truncating target tables (CASCADE)...");
      // Order doesn't matter with CASCADE.
      const truncateSQL = `TRUNCATE ${tables.map(quoteIdent).join(", ")} CASCADE;`;
      await postgres.query(truncateSQL);
    }

    for (const table of tables) {
      const rows = await sqlite.all<Record<string, unknown>[]>(`SELECT * FROM ${quoteIdent(table)}`);

      if (rows.length === 0) {
        console.log(`- ${table}: 0 rows (skipped)`);
        continue;
      }

      const columns = Object.keys(rows[0] || {});
      if (columns.length === 0) {
        console.log(`- ${table}: 0 columns (skipped)`);
        continue;
      }

      const quotedCols = columns.map(quoteIdent);
      const quotedTable = quoteIdent(table);

      let inserted = 0;
      for (const group of chunk(rows, CHUNK_SIZE)) {
        const values: unknown[] = [];
        const valuePlaceholders: string[] = [];

        group.forEach((row, rowIdx) => {
          const placeholders = columns.map((_, colIdx) => {
            values.push((row as any)[columns[colIdx]]);
            return `$${rowIdx * columns.length + colIdx + 1}`;
          });
          valuePlaceholders.push(`(${placeholders.join(", ")})`);
        });

        const sql = `INSERT INTO ${quotedTable} (${quotedCols.join(", ")}) VALUES ${valuePlaceholders.join(
          ", "
        )};`;

        await postgres.query(sql, values);
        inserted += group.length;
      }

      console.log(`- ${table}: ${inserted} rows inserted`);

      // Best-effort: if there's an integer "id" column backed by a sequence, move sequence forward.
      if (columns.includes("id")) {
        try {
          await postgres.query(
            `SELECT setval(pg_get_serial_sequence($1, 'id'), COALESCE((SELECT MAX(id) FROM ${quotedTable}), 1));`,
            [table]
          );
        } catch {
          // ignore: table might not have serial id, or might use uuid/text ids.
        }
      }
    }

    console.log("SQLite → Postgres copy completed.");
  } finally {
    await sqlite.close().catch(() => {});
    await postgres.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

