import { useTranslations } from "next-intl";
import { PostCard } from "./PostCard";
import type { PepzinePostMeta } from "@/lib/pepzine/types";

interface RelatedPostsProps {
  posts: PepzinePostMeta[];
  locale?: string;
}

export function RelatedPosts({ posts, locale = "tr" }: RelatedPostsProps) {
  const t = useTranslations("relatedPosts");

  if (!posts || posts.length === 0) return null;

  return (
    <section className="border-t border-border/50 px-5 py-16 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          Pepzine
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
