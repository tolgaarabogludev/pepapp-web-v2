import { PostCard } from "./PostCard";
import type { PepzinePostMeta } from "@/lib/pepzine/types";

interface RelatedPostsProps {
  posts: PepzinePostMeta[];
  locale?: string;
}

export function RelatedPosts({ posts, locale = "tr" }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border/50 px-5 py-16 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-foreground mb-8">İlgili Yazılar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
