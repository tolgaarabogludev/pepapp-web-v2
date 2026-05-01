import Link from "next/link";
import type { PepzineFrontmatter } from "@/lib/pepzine/types";

interface ArticleHeaderProps {
  frontmatter: PepzineFrontmatter;
  locale?: string;
}

export function ArticleHeader({ frontmatter, locale = "tr" }: ArticleHeaderProps) {
  const backHref = locale === "tr" ? "/tr/pepzine" : "/en/pepzine";

  return (
    <header className="pt-28 pb-10 px-5 max-w-2xl mx-auto">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        ← Pepzine
      </Link>

      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          {frontmatter.category}
        </span>
        {frontmatter.readingTime && (
          <span className="text-xs text-muted-foreground">
            · {frontmatter.readingTime} dk okuma
          </span>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight mb-4">
        {frontmatter.title}
      </h1>

      <p className="text-lg text-muted-foreground leading-relaxed mb-6">
        {frontmatter.description}
      </p>

      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
        <span className="text-sm text-muted-foreground">
          {frontmatter.author}
        </span>
        <span className="text-muted-foreground/40">·</span>
        <time
          dateTime={frontmatter.date}
          className="text-sm text-muted-foreground"
        >
          {new Date(frontmatter.date).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
    </header>
  );
}
