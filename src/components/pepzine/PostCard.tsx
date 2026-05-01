import Link from "next/link";
import type { PepzinePostMeta } from "@/lib/pepzine/types";

interface PostCardProps {
  post: PepzinePostMeta;
  locale?: string;
}

export function PostCard({ post, locale = "tr" }: PostCardProps) {
  const { slug, frontmatter } = post;
  const href = locale === "tr" ? `/tr/pepzine/${slug}` : `/en/pepzine/${slug}`;

  return (
    <Link href={href} className="group block">
      <article className="h-full flex flex-col gap-3 p-6 rounded-2xl border border-border/60 bg-card hover:border-border transition-colors duration-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            {frontmatter.category}
          </span>
          {frontmatter.readingTime && (
            <span className="text-xs text-muted-foreground">
              · {frontmatter.readingTime} dk okuma
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
          {frontmatter.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {frontmatter.description}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {new Date(frontmatter.date).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="text-xs font-medium text-accent group-hover:underline">
            Oku →
          </span>
        </div>
      </article>
    </Link>
  );
}
