import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPostBySlug,
  getAllSlugs,
  getRelatedPosts,
} from "@/lib/pepzine/posts";
import { ArticleHeader } from "@/components/pepzine/ArticleHeader";
import { ArticleBody } from "@/components/pepzine/ArticleBody";
import { RelatedPosts } from "@/components/pepzine/RelatedPosts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  const locales = ["tr", "en"];
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const { frontmatter } = post;
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: "article",
      publishedTime: frontmatter.date,
      authors: [frontmatter.author],
      ...(frontmatter.coverImage && { images: [frontmatter.coverImage] }),
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
    },
  };
}

export default async function PepzinePostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const { frontmatter, content } = post;
  const relatedPosts = getRelatedPosts(slug, frontmatter.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    author: {
      "@type": "Organization",
      name: frontmatter.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Pepapp",
      url: "https://pepapp.com",
    },
    ...(frontmatter.coverImage && { image: frontmatter.coverImage }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <ArticleHeader frontmatter={frontmatter} locale={locale} />
        <ArticleBody content={content} />
        <RelatedPosts posts={relatedPosts} locale={locale} />
      </main>
      <Footer />
    </>
  );
}
