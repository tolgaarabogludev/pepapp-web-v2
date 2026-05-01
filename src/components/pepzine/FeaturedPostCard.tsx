import Link from "next/link";
import type { PepzinePostMeta } from "@/lib/pepzine/types";

interface FeaturedPostCardProps {
  post: PepzinePostMeta;
  locale?: string;
}

export function FeaturedPostCard({ post, locale = "tr" }: FeaturedPostCardProps) {
  const { slug, frontmatter } = post;
  const href = locale === "tr" ? `/tr/pepzine/${slug}` : `/en/pepzine/${slug}`;

  return (
    <Link href={href} className="group block">
      <article className="relative flex flex-col gap-4 p-8 rounded-3xl border border-border/60 bg-card overflow-hidden hover:border-border transition-colors duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            {frontmatter.category}
          </span>
          {frontmatter.readingTime && (
            <span className="text-xs text-muted-foreground">
              {frontmatter.readingTime} dk okuma
            </span>
          )}
        </div>
        <h2 className="relative text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight group-hover:text-accent transition-colors">
          {frontmatter.title}
        </h2>
        <p className="relative text-base text-muted-foreground leading-relaxed max-w-2xl">
          {frontmatter.description}
        </p>
        <div className="relative flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {new Date(frontmatter.date).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="text-sm font-semibold text-accent group-hover:underline">
            Yazıyı oku →
          </span>
        </div>
      </article>
    </Link>
  );
}
