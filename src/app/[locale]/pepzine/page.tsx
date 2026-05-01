import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllPosts } from "@/lib/pepzine/posts";
import type { PepzineCategory } from "@/lib/pepzine/types";
import { BlogHero } from "@/components/pepzine/BlogHero";
import { CategoryChips } from "@/components/pepzine/CategoryChips";
import { FeaturedPostCard } from "@/components/pepzine/FeaturedPostCard";
import { PostCard } from "@/components/pepzine/PostCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pepzinePage" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kategori?: string }>;
}

export default async function PepzinePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { kategori } = await searchParams;
  const t = await getTranslations({ locale, namespace: "pepzinePage" });

  const activeCategory = kategori as PepzineCategory | undefined;
  const posts = getAllPosts(locale, activeCategory);
  const featuredPost = !activeCategory ? posts.find((p) => p.frontmatter.featured) : undefined;
  const remainingPosts = featuredPost
    ? posts.filter((p) => p.slug !== featuredPost.slug)
    : posts;

  return (
    <>
      <Header />
      <main>
        <BlogHero
          eyebrow={t("hero.eyebrow")}
          heading={t("hero.title")}
          subheading={t("hero.description")}
        />

        <div className="pb-10">
          <Suspense>
            <CategoryChips active={activeCategory ?? null} />
          </Suspense>
        </div>

        <div className="max-w-5xl mx-auto px-5 md:px-8 pb-24">
          {featuredPost && (
            <div className="mb-8">
              <FeaturedPostCard post={featuredPost} locale={locale} />
            </div>
          )}

          {remainingPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {remainingPosts.map((post) => (
                <PostCard key={post.slug} post={post} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">
              {t("empty.title")}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
