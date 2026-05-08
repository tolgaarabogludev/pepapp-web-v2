import { unstable_cache } from "next/cache";
import type { Where } from "payload";
import { getPayloadClient } from "./client";
import type {
  PayloadCategory,
  PayloadLocale,
  PayloadPaginatedResult,
  PayloadPost,
  PayloadPostSummary,
} from "./types";

const DEFAULT_LIMIT = 24;

const POST_CARD_SELECT = {
  title: true,
  slug: true,
  excerpt: true,
  category: true,
  tags: true,
  coverImage: true,
  imageAlt: true,
  publishedAt: true,
  originalPublishedAt: true,
  updatedAt: true,
  readingTime: true,
} as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRelatedPosts(value: unknown): PayloadPostSummary[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isObject) as PayloadPostSummary[];
}

function normalizePost<T extends PayloadPostSummary | PayloadPost>(post: unknown): T {
  const normalizedPost = post as T;

  if ("relatedPosts" in normalizedPost) {
    return {
      ...normalizedPost,
      relatedPosts: normalizeRelatedPosts(normalizedPost.relatedPosts),
    } as T;
  }

  return normalizedPost;
}

function getPublishedPostsConditions(): Where[] {
  return [
    {
      webEnabled: {
        equals: true,
      },
    },
    {
      _status: {
        equals: "published",
      },
    },
  ];
}

function getPublishedPostsWhere(): Where {
  return {
    and: getPublishedPostsConditions(),
  };
}

function normalizePaginatedPosts(result: unknown) {
  const paginatedResult = result as PayloadPaginatedResult<PayloadPostSummary>;

  return {
    ...paginatedResult,
    docs: paginatedResult.docs.map((post) => normalizePost<PayloadPostSummary>(post)),
  } as PayloadPaginatedResult<PayloadPostSummary>;
}

export const getPublishedPayloadPosts = unstable_cache(
  async (locale: PayloadLocale = "tr", limit = DEFAULT_LIMIT) => {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: "posts",
      locale,
      fallbackLocale: "tr",
      depth: 1,
      limit,
      sort: "-publishedAt",
      where: getPublishedPostsWhere(),
      select: POST_CARD_SELECT,
    });

    return normalizePaginatedPosts(result);
  },
  ["payload-posts"],
  {
    tags: ["payload-posts"],
    revalidate: 300,
  }
);

export const getPublishedPayloadPostsPage = unstable_cache(
  async (locale: PayloadLocale = "tr", page = 1, limit = DEFAULT_LIMIT) => {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: "posts",
      locale,
      fallbackLocale: "tr",
      depth: 1,
      limit,
      page,
      sort: "-publishedAt",
      where: getPublishedPostsWhere(),
      select: POST_CARD_SELECT,
    });

    return normalizePaginatedPosts(result);
  },
  ["payload-posts-page"],
  {
    tags: ["payload-posts"],
    revalidate: 300,
  }
);

export async function getPublishedPayloadPostBySlug(
  slug: string,
  locale: PayloadLocale = "tr"
) {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "posts",
    locale,
    fallbackLocale: "tr",
    depth: 3,
    limit: 1,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...getPublishedPostsConditions(),
      ],
    },
  });

  const post = result.docs[0];

  if (!post) return null;

  return normalizePost<PayloadPost>(post);
}

export const getPublishedPayloadPostsByCategory = unstable_cache(
  async (
    categorySlug: string,
    locale: PayloadLocale = "tr",
    page = 1,
    limit = DEFAULT_LIMIT
  ) => {
    const payload = await getPayloadClient();

    const categoryResult = await payload.find({
      collection: "categories",
      locale,
      fallbackLocale: "tr",
      depth: 0,
      limit: 1,
      where: {
        slug: {
          equals: categorySlug,
        },
      },
    });

    const category = categoryResult.docs[0];

    if (!category) {
      return {
        docs: [],
        totalDocs: 0,
        limit,
        totalPages: 0,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      } as PayloadPaginatedResult<PayloadPostSummary>;
    }

    const result = await payload.find({
      collection: "posts",
      locale,
      fallbackLocale: "tr",
      depth: 1,
      limit,
      page,
      sort: "-publishedAt",
      where: {
        and: [
          {
            category: {
              equals: category.id,
            },
          },
          ...getPublishedPostsConditions(),
        ],
      },
      select: POST_CARD_SELECT,
    });

    return normalizePaginatedPosts(result);
  },
  ["payload-posts-category"],
  {
    tags: ["payload-posts", "payload-categories"],
    revalidate: 300,
  }
);

export async function getPayloadPostStaticParams(locale: PayloadLocale = "tr") {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "posts",
    locale,
    fallbackLocale: "tr",
    depth: 0,
    limit: 3000,
    where: getPublishedPostsWhere(),
  });

  return result.docs.map((post) => ({
    slug: post.slug,
  }));
}

export const getPayloadCategories = unstable_cache(
  async (locale: PayloadLocale = "tr") => {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: "categories",
      locale,
      fallbackLocale: "tr",
      depth: 0,
      limit: 100,
      sort: "title",
    });

    return result.docs as PayloadCategory[];
  },
  ["payload-categories"],
  {
    tags: ["payload-categories"],
    revalidate: 300,
  }
);

export async function searchPublishedPayloadPosts(
  query: string,
  locale: PayloadLocale = "tr",
  limit = 24
) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      docs: [],
      totalDocs: 0,
      limit,
      totalPages: 0,
      page: 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
    } as PayloadPaginatedResult<PayloadPostSummary>;
  }

  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "posts",
    locale,
    fallbackLocale: "tr",
    depth: 1,
    limit,
    sort: "-publishedAt",
    where: {
      and: [
        ...getPublishedPostsConditions(),
        {
          or: [
            {
              title: {
                like: trimmedQuery,
              },
            },
            {
              excerpt: {
                like: trimmedQuery,
              },
            },
            {
              seoTitle: {
                like: trimmedQuery,
              },
            },
            {
              seoDescription: {
                like: trimmedQuery,
              },
            },
          ],
        },
      ],
    },
    select: POST_CARD_SELECT,
  });

  return normalizePaginatedPosts(result);
}