import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPostBySlug,
  getAllSlugs,
  getRelatedPosts,
} from "@/lib/pepzine/posts";
import { parseHeadings } from "@/lib/pepzine/headings";
import { getAuthor } from "@/lib/pepzine/authors";
import { Breadcrumb } from "@/components/pepzine/Breadcrumb";
import { ArticleHeroImage } from "@/components/pepzine/ArticleHeroImage";
import { ArticleHeader } from "@/components/pepzine/ArticleHeader";
import { TableOfContents } from "@/components/pepzine/TableOfContents";
import { ArticleBody } from "@/components/pepzine/ArticleBody";
import { ArticleFaq } from "@/components/pepzine/ArticleFaq";
import { ArticleAppCta } from "@/components/pepzine/ArticleAppCta";
import { ArticleAuthor } from "@/components/pepzine/ArticleAuthor";
import { RelatedPosts } from "@/components/pepzine/RelatedPosts";
import { ReadingProgress } from "@/components/pepzine/ReadingProgress";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const SITE_URL = "https://pepapp.com";
const OG_DEFAULT = "/images/og/pepzine-default.jpg";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const locales = ["tr", "en"];
  return locales.flatMap((locale) =>
    getAllSlugs(locale).map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);
  if (!post) return {};

  const { frontmatter } = post;
  const ogImage = frontmatter.coverImage ?? OG_DEFAULT;
  const pageUrl = `${SITE_URL}/${locale}/pepzine/${slug}`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: "article",
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updatedDate ?? frontmatter.date,
      authors: [frontmatter.author],
      images: [{ url: ogImage, width: 1200, height: 630, alt: frontmatter.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      images: [ogImage],
    },
  };
}

export default async function PepzinePostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);
  if (!post) notFound();

  const { frontmatter, content } = post;
  const relatedPosts = getRelatedPosts(locale, slug, frontmatter.category);
  const headings = parseHeadings(content);
  const author = getAuthor(frontmatter.author);

  const pageUrl = `${SITE_URL}/${locale}/pepzine/${slug}`;

  // --- JSON-LD ---
  const orgSchema = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Pepapp",
    url: SITE_URL,
  };

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    dateModified: frontmatter.updatedDate ?? frontmatter.date,
    author: { "@type": "Organization", name: frontmatter.author },
    publisher: orgSchema,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    ...(frontmatter.coverImage && {
      image: `${SITE_URL}${frontmatter.coverImage}`,
    }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pepapp", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Pepzine", item: `${SITE_URL}/${locale}/pepzine` },
      {
        "@type": "ListItem",
        position: 3,
        name: frontmatter.category,
        item: `${SITE_URL}/${locale}/pepzine?kategori=${frontmatter.category}`,
      },
      { "@type": "ListItem", position: 4, name: frontmatter.title, item: pageUrl },
    ],
  };

  const faqSchema = frontmatter.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: frontmatter.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <ReadingProgress />
      <Header />

      <main>
        <Breadcrumb
          category={frontmatter.category}
          title={frontmatter.title}
          locale={locale}
        />
        <ArticleHeroImage frontmatter={frontmatter} />
        <ArticleHeader frontmatter={frontmatter} />
        <TableOfContents headings={headings} />
        <ArticleBody content={content} />
        <ArticleFaq faqs={frontmatter.faqs ?? []} />
        <ArticleAppCta />
        <ArticleAuthor author={author} />
        <RelatedPosts posts={relatedPosts} locale={locale} />
      </main>

      <Footer />
    </>
  );
}
