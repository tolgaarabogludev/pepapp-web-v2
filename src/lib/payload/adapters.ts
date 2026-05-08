import type {
  PayloadCategory,
  PayloadFaq,
  PayloadMedia,
  PayloadPost,
  PayloadPostSummary,
  PayloadTag,
} from "./types";
import type {
  PepzineFrontmatter,
  PepzinePostMeta,
} from "@/lib/pepzine/types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPayloadMedia(value: unknown): value is PayloadMedia {
  return isObject(value) && typeof value.id === "string";
}

function isPayloadCategory(value: unknown): value is PayloadCategory {
  return isObject(value) && typeof value.title === "string" && typeof value.slug === "string";
}

function isPayloadTag(value: unknown): value is PayloadTag {
  return isObject(value) && typeof value.title === "string" && typeof value.slug === "string";
}

function isPayloadFaq(value: unknown): value is PayloadFaq {
  return isObject(value) && typeof value.question === "string" && typeof value.answer === "string";
}

function normalizeDate(date?: string | null) {
  return date || new Date().toISOString();
}

function normalizeMediaUrl(url?: string | null) {
  if (!url) return undefined;

  if (url.startsWith("/api/media/file/")) {
    return url.replace("/api/media/file/", "/payload/media/");
  }

  return url;
}

function getImageUrl(
  media?: PayloadMedia | string | null,
  size: "thumb" | "card" | "hero" | "original" = "original"
) {
  if (!media) return undefined;
  if (typeof media === "string") return undefined;

  const sizes = (media as PayloadMedia & {
    sizes?: Record<string, { url?: string | null } | undefined>;
  }).sizes;

  if (size !== "original" && sizes?.[size]?.url) {
    return normalizeMediaUrl(sizes[size]?.url);
  }

  if (media.url) return normalizeMediaUrl(media.url);
  if (media.thumbnailURL) return normalizeMediaUrl(media.thumbnailURL);
  if (media.filename) return `/payload/media/${media.filename}`;

  return undefined;
}

function getImageAlt(post: PayloadPostSummary) {
  if (post.imageAlt) return post.imageAlt;
  if (isPayloadMedia(post.coverImage) && post.coverImage.alt) return post.coverImage.alt;
  return post.title;
}

function getCategoryTitle(category?: PayloadPostSummary["category"]) {
  if (isPayloadCategory(category)) return category.title;
  return "Pepzine";
}

function getCategorySlug(category?: PayloadPostSummary["category"]) {
  if (isPayloadCategory(category)) return category.slug;
  return undefined;
}

function getTags(tags?: PayloadPostSummary["tags"]) {
  if (!Array.isArray(tags)) return [];
  return tags.filter(isPayloadTag).map((tag) => tag.title);
}

function getFaqs(post: PayloadPostSummary) {
  if (!("faqs" in post) || !Array.isArray(post.faqs)) return undefined;

  const faqs = post.faqs.filter(isPayloadFaq).map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  return faqs.length > 0 ? faqs : undefined;
}

export function payloadPostToFrontmatter(post: PayloadPostSummary): PepzineFrontmatter {
  return {
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    date: normalizeDate(post.originalPublishedAt || post.publishedAt),
    updatedAt: post.updatedAt || post.publishedAt,
    category: getCategoryTitle(post.category),
    categorySlug: getCategorySlug(post.category),
    tags: getTags(post.tags),
    author: "Pepapp Editorial",
    readingTime: post.readingTime || undefined,
    image: getImageUrl(post.coverImage, "hero"),
    imageAlt: getImageAlt(post),
    faqs: getFaqs(post),
  };
}

export function payloadPostToCardMeta(post: PayloadPostSummary): PepzinePostMeta {
  return {
    slug: post.slug,
    frontmatter: {
      title: post.title,
      description: post.excerpt,
      slug: post.slug,
      date: normalizeDate(post.originalPublishedAt || post.publishedAt),
      updatedAt: post.updatedAt || post.publishedAt,
      category: getCategoryTitle(post.category),
      categorySlug: getCategorySlug(post.category),
      tags: [],
      author: "Pepapp Editorial",
      readingTime: post.readingTime || undefined,
      image: getImageUrl(post.coverImage, "card"),
      imageAlt: getImageAlt(post),
    },
  };
}

export function payloadPostToPepzineMeta(post: PayloadPostSummary): PepzinePostMeta {
  return {
    slug: post.slug,
    frontmatter: payloadPostToFrontmatter(post),
  };
}

export function payloadRelatedPostsToPepzineMeta(post: PayloadPost) {
  if (!Array.isArray(post.relatedPosts)) return [];

  return post.relatedPosts.map((relatedPost) => payloadPostToPepzineMeta(relatedPost));
}

export function getPayloadPostSeo(post: PayloadPost) {
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    canonicalUrl: post.canonicalUrl || undefined,
    noIndex: Boolean(post.noIndex),
  };
}