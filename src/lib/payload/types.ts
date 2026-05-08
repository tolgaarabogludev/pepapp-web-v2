

export type PayloadLocale = "tr" | "en" | "es";

export type PayloadMedia = {
  id: string;
  url?: string | null;
  filename?: string | null;
  thumbnailURL?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

export type PayloadCategory = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
};

export type PayloadTag = {
  id: string;
  title: string;
  slug: string;
};

export type PayloadFaq = {
  id?: string | null;
  question: string;
  answer: string;
};

export type PayloadPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category?: PayloadCategory | null;
  tags?: PayloadTag[] | null;
  coverImage?: PayloadMedia | null;
  imageAlt?: string | null;
  publishedAt: string;
  originalPublishedAt?: string | null;
  updatedAt?: string | null;
  readingTime?: number | null;
};

export type PayloadPost = PayloadPostSummary & {
  body: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
  oldUrl?: string | null;
  faqs?: PayloadFaq[] | null;
  relatedPosts?: PayloadPostSummary[] | null;
};

export type PayloadPaginatedResult<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page?: number;
  pagingCounter?: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
};