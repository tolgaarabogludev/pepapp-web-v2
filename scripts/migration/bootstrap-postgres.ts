async function loadPayloadRuntime() {
  const payloadModule = await import("payload");
  const getPayload = (payloadModule as unknown as { getPayload?: unknown }).getPayload;

  if (typeof getPayload !== "function") {
    throw new Error("Could not load getPayload from payload runtime.");
  }

  return getPayload as (args: { config: unknown }) => Promise<{
    find: (args: { collection: string; limit: number; depth: number }) => Promise<{ totalDocs?: number }>;
  }>;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Run with DATABASE_URL='postgresql://...' npx tsx scripts/migration/bootstrap-postgres.ts");
  }

  console.log("Bootstrapping Payload with Postgres...");
  const [{ default: config }, getPayload] = await Promise.all([
    import("../../payload.config"),
    loadPayloadRuntime(),
  ]);

  const payload = await getPayload({ config });

  const collections = ["users", "categories", "tags", "media", "posts", "redirects"] as const;

  for (const collection of collections) {
    const result = await payload.find({
      collection,
      limit: 1,
      depth: 0,
    });

    console.log(`${collection}: ${result.totalDocs ?? 0} docs`);
  }

  console.log("Payload Postgres bootstrap completed.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});