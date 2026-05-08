

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { searchPublishedPayloadPosts } from "@/lib/payload/queries";
import { payloadPostToPepzineMeta } from "@/lib/payload/adapters";
import type { PayloadLocale } from "@/lib/payload/types";
import { BlogHero } from "@/components/pepzine/BlogHero";
import { PostCard } from "@/components/pepzine/PostCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const SITE_URL = "https://letspepapp.com";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

function toPayloadLocale(locale: string): PayloadLocale {
  if (locale === "en" || locale === "es") return locale;
  return "tr";
}

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const pageUrl = `${SITE_URL}/${locale}/pepzine/arama`;

  return {
    title: "Pepzine Arama | Pepapp",
    description: "Pepzine yazıları içinde arama yapın.",
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function PepzineSearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = await getTranslations({ locale, namespace: "pepzinePage" });
  const payloadLocale = toPayloadLocale(locale);
  const query = q?.trim() ?? "";
  const result = query
    ? await searchPublishedPayloadPosts(query, payloadLocale, 24)
    : null;
  const posts = result?.docs.map((post) => payloadPostToPepzineMeta(post)) ?? [];

  return (
    <>
      <Header />
      <main>
        <BlogHero
          eyebrow={t("hero.eyebrow")}
          heading="Pepzine’da ara"
          subheading="Beden, döngü, zihin, ilişkiler ve iyi hissetme üzerine yazıları keşfet."
        />

        <section className="max-w-2xl mx-auto px-5 md:px-8 pb-10">
          <form action={`/${locale}/pepzine/arama`} className="flex gap-3">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Aramak istediğin konuyu yaz"
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none transition focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Ara
            </button>
          </form>
        </section>

        <section className="max-w-5xl mx-auto px-5 md:px-8 pb-24">
          {query ? (
            <div className="mb-8">
              <p className="text-sm text-muted-foreground">
                “{query}” için {posts.length} sonuç bulundu.
              </p>
            </div>
          ) : null}

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} locale={locale} />
              ))}
            </div>
          ) : query ? (
            <div className="rounded-3xl border border-border/60 bg-muted/30 px-6 py-12 text-center">
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                Sonuç bulunamadı
              </h2>
              <p className="text-sm text-muted-foreground">
                Farklı bir kelime deneyebilir veya Pepzine kategorilerini keşfedebilirsin.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/60 bg-muted/30 px-6 py-12 text-center">
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                Ne aramak istersin?
              </h2>
              <p className="text-sm text-muted-foreground">
                Örneğin “regl”, “ilişki”, “kedi” veya “beslenme” yazabilirsin.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}