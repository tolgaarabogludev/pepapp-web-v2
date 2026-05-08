import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  getPayloadCategories,
  getPublishedPayloadPostsByCategory,
  getPublishedPayloadPostsPage,
} from "@/lib/payload/queries";
import { payloadPostToCardMeta } from "@/lib/payload/adapters";
import type { PayloadLocale } from "@/lib/payload/types";
import { CategoryChips } from "@/components/pepzine/CategoryChips";
import { PostCard } from "@/components/pepzine/PostCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const SITE_URL = "https://letspepapp.com";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kategori?: string; page?: string }>;
}

function toPayloadLocale(locale: string): PayloadLocale {
  if (locale === "en" || locale === "es") return locale;
  return "tr";
}

function getSafePage(page?: string) {
  const parsedPage = Number(page || 1);
  return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pepzinePage" });
  const pageUrl = `${SITE_URL}/${locale}/pepzine`;

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
      url: pageUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
    },
  };
}

export default async function PepzinePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { kategori, page } = await searchParams;
  const payloadLocale = toPayloadLocale(locale);
  const currentPage = getSafePage(page);
  const activeCategory = kategori;
  const payloadPostsPromise = activeCategory
    ? getPublishedPayloadPostsByCategory(activeCategory, payloadLocale, currentPage)
    : getPublishedPayloadPostsPage(payloadLocale, currentPage);

  const [t, categories, payloadPosts] = await Promise.all([
    getTranslations({ locale, namespace: "pepzinePage" }),
    getPayloadCategories(payloadLocale),
    payloadPostsPromise,
  ]);

  const posts = payloadPosts.docs.map((post) => payloadPostToCardMeta(post));
  const visiblePosts = posts;

  const hasNextPage = Boolean(payloadPosts.hasNextPage);
  const nextPageHref = activeCategory
    ? `/${locale}/pepzine?kategori=${activeCategory}&page=${currentPage + 1}`
    : `/${locale}/pepzine?page=${currentPage + 1}`;

  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-[112rem] px-5 md:px-8 2xl:px-12 pt-28 md:pt-32 pb-24">
          <div className="mb-8">
            <Suspense>
              <CategoryChips active={activeCategory ?? null} categories={categories} />
            </Suspense>
          </div>

          {visiblePosts.length > 0 ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
              {visiblePosts.map((post, index) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  locale={locale}
                  priority={index < 6 && currentPage === 1}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">
              {t("empty.title")}
            </p>
          )}
          {hasNextPage ? (
            <div className="mt-10 flex justify-center">
              <a
                href={nextPageHref}
                className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-foreground"
              >
                Daha fazla yazı göster
              </a>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
