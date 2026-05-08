import type { MetadataRoute } from "next";

const SITE_URL = "https://letspepapp.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tr", "/en", "/es"],
        disallow: [
          "/admin",
          "/api",
          "/tr/pepzine/arama",
          "/en/pepzine/search",
          "/es/pepzine/buscar",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
