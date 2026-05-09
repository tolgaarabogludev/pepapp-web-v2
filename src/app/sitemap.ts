import type { MetadataRoute } from "next";
import {
  getPayloadCategories,
  getPayloadPostStaticParams,
  getPublishedPayloadPostBySlug,
} from "@/lib/payload/queries";
import type { PayloadLocale } from "@/lib/payload/types";

const SITE_URL = "https://letspepapp.com";
const LOCALES: PayloadLocale[] = ["tr", "en", "es"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const localeRoutes = LOCALES.flatMap((locale) => [
    {
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/${locale}/pepzine`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ]);

  try {
    const categoryRoutes = (
      await Promise.all(
        LOCALES.map(async (locale) => {
          const categories = await getPayloadCategories(locale);

          return categories.map((category) => ({
            url: `${SITE_URL}/${locale}/pepzine/kategori/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }));
        })
      )
    ).flat();

    const postRoutes = (
      await Promise.all(
        LOCALES.map(async (locale) => {
          const slugs = await getPayloadPostStaticParams(locale);

          return Promise.all(
            slugs.map(async ({ slug }) => {
              const post = await getPublishedPayloadPostBySlug(slug, locale);

              return {
                url: `${SITE_URL}/${locale}/pepzine/${slug}`,
                lastModified: new Date(post?.updatedAt || post?.publishedAt || Date.now()),
                changeFrequency: "monthly" as const,
                priority: 0.8,
              };
            })
          );
        })
      )
    ).flat();

    return [...staticRoutes, ...localeRoutes, ...categoryRoutes, ...postRoutes];
  } catch (error) {
    console.warn("Sitemap generation skipped:", error);

    return [...staticRoutes, ...localeRoutes];
  }
}
