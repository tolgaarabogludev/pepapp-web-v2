import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/pepzine/posts";
import type { PepzineCategory } from "@/lib/pepzine/types";
import { BlogHero } from "@/components/pepzine/BlogHero";
import { CategoryChips } from "@/components/pepzine/CategoryChips";
import { FeaturedPostCard } from "@/components/pepzine/FeaturedPostCard";
import { PostCard } from "@/components/pepzine/PostCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Pepzine",
  description:
    "Döngün, zihnin ve bedenin hakkında içtenlikle yazılmış yazılar. Pepapp'tan bilim destekli, duygusal zeka ile hazırlanmış içerikler.",
  openGraph: {
    title: "Pepzine | Pepapp",
    description:
      "Döngün, zihnin ve bedenin hakkında içtenlikle yazılmış yazılar.",
    type: "website",
  },
};

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kategori?: string }>;
}

export default async function PepzinePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { kategori } = await searchParams;

  const activeCategory = kategori as PepzineCategory | undefined;
  const posts = getAllPosts(activeCategory);
  const featuredPost = !activeCategory ? posts.find((p) => p.frontmatter.featured) : undefined;
  const remainingPosts = featuredPost
    ? posts.filter((p) => p.slug !== featuredPost.slug)
    : posts;

  return (
    <>
      <Header />
      <main>
        <BlogHero
          eyebrow="Pepzine"
          heading="Kendini anla."
          subheading="Döngün, zihnin ve bedenin için bilim destekli, içten yazılar."
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
              Bu kategoride henüz yazı yok.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
