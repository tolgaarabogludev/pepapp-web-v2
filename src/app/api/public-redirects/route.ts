

import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload/client";

function normalizePath(value?: string | null) {
  if (!value) return "";

  const cleanedPath = value
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/[#?].*$/, "")
    .replace(/\/+/g, "/");

  const withLeadingSlash = cleanedPath.startsWith("/") ? cleanedPath : `/${cleanedPath}`;
  return withLeadingSlash === "/" ? "/" : withLeadingSlash.replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const source = normalizePath(request.nextUrl.searchParams.get("source"));

  if (!source) {
    return NextResponse.json({ redirect: null }, { status: 400 });
  }

  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "redirects",
    depth: 0,
    limit: 1,
    where: {
      and: [
        {
          source: {
            equals: source,
          },
        },
        {
          enabled: {
            equals: true,
          },
        },
      ],
    },
  });

  const redirect = result.docs[0];

  if (!redirect) {
    return NextResponse.json({ redirect: null });
  }

  return NextResponse.json({
    redirect: {
      source: redirect.source,
      destination: redirect.destination,
      statusCode: redirect.statusCode,
      enabled: redirect.enabled,
    },
  });
}