import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPayloadPostStaticParams,
  getPublishedPayloadPostBySlug,
} from "@/lib/payload/queries";
import {
  getPayloadPostSeo,
  payloadPostToFrontmatter,
  payloadRelatedPostsToPepzineMeta,
} from "@/lib/payload/adapters";
import type { PayloadLocale } from "@/lib/payload/types";
import type { Heading } from "@/lib/pepzine/headings";
import { getAuthor } from "@/lib/pepzine/authors";
import { Breadcrumb } from "@/components/pepzine/Breadcrumb";
import { ArticleHeroImage } from "@/components/pepzine/ArticleHeroImage";
import { ArticleHeader } from "@/components/pepzine/ArticleHeader";
import { TableOfContents } from "@/components/pepzine/TableOfContents";
import { PayloadArticleBody } from "@/components/pepzine/PayloadArticleBody";
import { ArticleFaq } from "@/components/pepzine/ArticleFaq";
import { ArticleAppCta } from "@/components/pepzine/ArticleAppCta";
import { ArticleAuthor } from "@/components/pepzine/ArticleAuthor";
import { RelatedPosts } from "@/components/pepzine/RelatedPosts";
import { ReadingProgress } from "@/components/pepzine/ReadingProgress";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const SITE_URL = "https://letspepapp.com";
const OG_DEFAULT = "/images/og/pepzine-default.jpg";
export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function toPayloadLocale(locale: string): PayloadLocale {
  if (locale === "en" || locale === "es") return locale;
  return "tr";
}

function getAbsoluteImageUrl(image?: string) {
  if (!image) return `${SITE_URL}${OG_DEFAULT}`;
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image}`;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const payloadLocale = toPayloadLocale(locale);
  const post = await getPublishedPayloadPostBySlug(slug, payloadLocale);

  if (!post) return {};

  const frontmatter = payloadPostToFrontmatter(post);
  const seo = getPayloadPostSeo(post);
  const pageUrl = seo.canonicalUrl || `${SITE_URL}/${locale}/pepzine/${slug}`;
  const ogImage = getAbsoluteImageUrl(frontmatter.image);

  return {
    title: seo.title,
    description: seo.description,
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "article",
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updatedAt ?? frontmatter.date,
      authors: [frontmatter.author],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: frontmatter.imageAlt || frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
  };
}

export default async function PepzinePostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const payloadLocale = toPayloadLocale(locale);
  const post = await getPublishedPayloadPostBySlug(slug, payloadLocale);

  if (!post) notFound();

  const frontmatter = payloadPostToFrontmatter(post);
  const relatedPosts = payloadRelatedPostsToPepzineMeta(post);
  const headings: Heading[] = [];
  const author = getAuthor(frontmatter.author);
  const pageUrl = `${SITE_URL}/${locale}/pepzine/${slug}`;
  const imageUrl = getAbsoluteImageUrl(frontmatter.image);

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
    dateModified: frontmatter.updatedAt ?? frontmatter.date,
    author: { "@type": "Organization", name: frontmatter.author },
    publisher: orgSchema,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    image: imageUrl,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pepapp", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pepzine",
        item: `${SITE_URL}/${locale}/pepzine`,
      },
      ...(frontmatter.categorySlug
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: frontmatter.category,
              item: `${SITE_URL}/${locale}/pepzine/${frontmatter.categorySlug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: frontmatter.categorySlug ? 4 : 3,
        name: frontmatter.title,
        item: pageUrl,
      },
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
          categorySlug={frontmatter.categorySlug}
          title={frontmatter.title}
          locale={locale}
        />
        <ArticleHeroImage frontmatter={frontmatter} />
        <ArticleHeader frontmatter={frontmatter} />
        <TableOfContents headings={headings} />
        <PayloadArticleBody content={post.body} />
        <ArticleFaq faqs={frontmatter.faqs ?? []} />
        <ArticleAppCta />
        <ArticleAuthor author={author} />
        <RelatedPosts posts={relatedPosts} locale={locale} />
      </main>

      <Footer />
    </>
  );
}
