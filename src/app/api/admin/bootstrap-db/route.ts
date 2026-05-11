

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export const dynamic = "force-dynamic";

const COLLECTIONS = ["users", "categories", "tags", "media", "posts", "redirects"] as const;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!process.env.BOOTSTRAP_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        error: "BOOTSTRAP_SECRET is not configured.",
      },
      { status: 500 }
    );
  }

  if (secret !== process.env.BOOTSTRAP_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized.",
      },
      { status: 401 }
    );
  }

  try {
    const payload = await getPayload({ config });

    const results = await Promise.all(
      COLLECTIONS.map(async (collection) => {
        const result = await payload.find({
          collection,
          limit: 1,
          depth: 0,
        });

        return {
          collection,
          totalDocs: result.totalDocs,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      message: "Payload database bootstrap completed.",
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}