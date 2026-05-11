import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getPayloadCategories,
  getPublishedPayloadPostsByCategory,
} from "@/lib/payload/queries";
import { payloadPostToCardMeta } from "@/lib/payload/adapters";
import type { PayloadLocale } from "@/lib/payload/types";
import { CategoryChips } from "@/components/pepzine/CategoryChips";
import { PostCard } from "@/components/pepzine/PostCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const SITE_URL = "https://letspepapp.com";

interface PageProps {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}

function toPayloadLocale(locale: string): PayloadLocale {
  if (locale === "en" || locale === "es") return locale;
  return "tr";
}

function getSafePage(page?: string) {
  const parsedPage = Number(page || 1);
  return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function prettifyCategory(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  const locales: PayloadLocale[] = ["tr", "en"];
  const results: { locale: string; category: string }[] = [];

  for (const locale of locales) {
    const categories = await getPayloadCategories(locale);
    for (const cat of categories) {
      if (cat.slug) results.push({ locale, category: cat.slug });
    }
  }

  return results;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const pageUrl = `${SITE_URL}/${locale}/pepzine/kategori/${category}`;
  const title = `${prettifyCategory(category)} | Pepzine`;

  return {
    title,
    description: `${prettifyCategory(category)} kategorisindeki Pepzine yazıları.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description: `${prettifyCategory(category)} kategorisindeki Pepzine yazıları.`,
      type: "website",
      url: pageUrl,
    },
  };
}

export default async function PepzineCategoryPage({ params, searchParams }: PageProps) {
  const { locale, category } = await params;
  const { page } = await searchParams;
  const t = await getTranslations({ locale, namespace: "pepzinePage" });
  const payloadLocale = toPayloadLocale(locale);

  const categories = await getPayloadCategories(payloadLocale);

  const currentPage = getSafePage(page);
  const payloadPosts = await getPublishedPayloadPostsByCategory(category, payloadLocale, currentPage);

  if (!payloadPosts.docs.length) {
    notFound();
  }

  const posts = payloadPosts.docs.map((post) => payloadPostToCardMeta(post));
  const hasNextPage = Boolean(payloadPosts.hasNextPage);
  const nextPageHref = `/${locale}/pepzine/kategori/${category}?page=${currentPage + 1}`;

  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-[112rem] px-5 md:px-8 2xl:px-12 pt-28 md:pt-32 pb-24">
          <div className="mb-8">
            <CategoryChips active={category} categories={categories} />
          </div>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
            {posts.map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                locale={locale}
                priority={index < 6 && currentPage === 1}
              />
            ))}
          </div>
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
