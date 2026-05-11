import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

type RedirectResponse = {
  docs?: Array<{
    source?: string;
    destination?: string;
    statusCode?: "301" | "302";
    enabled?: boolean;
  }>;
};

function normalizePath(value: string) {
  const path = value
    .replace(/[#?].*$/, "")
    .replace(/\/+/g, "/")
    .trim();

  if (path === "/") return "/";
  return path.replace(/\/$/, "");
}

function shouldCheckRedirect(pathname: string) {
  if (pathname === "/") return false;
  if (pathname.startsWith("/tr")) return false;
  if (pathname.startsWith("/en")) return false;
  if (pathname.startsWith("/es")) return false;
  if (pathname.startsWith("/admin")) return false;

  return true;
}

function shouldBypassIntl(pathname: string) {
  if (pathname.startsWith("/admin")) return true;

  return false;
}

async function findRedirect(pathname: string, origin: string) {
  const normalizedPath = normalizePath(pathname);
  const encodedPath = encodeURIComponent(normalizedPath);

  try {
    const response = await fetch(
      `${origin}/api/redirects?where[and][0][source][equals]=${encodedPath}&where[and][1][enabled][equals]=true&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as RedirectResponse;
    return data.docs?.[0] || null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = normalizePath(request.nextUrl.pathname);

  if (shouldBypassIntl(pathname)) {
    return NextResponse.next();
  }

  if (shouldCheckRedirect(pathname)) {
    const redirect = await findRedirect(pathname, request.nextUrl.origin);

    if (redirect?.destination) {
      const destinationUrl = new URL(redirect.destination, request.url);
      const status = redirect.statusCode === "302" ? 302 : 301;

      return NextResponse.redirect(destinationUrl, status);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)"],
};
