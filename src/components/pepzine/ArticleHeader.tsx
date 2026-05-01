import type { PepzineFrontmatter } from "@/lib/pepzine/types";

interface ArticleHeaderProps {
  frontmatter: PepzineFrontmatter;
}

export function ArticleHeader({ frontmatter }: ArticleHeaderProps) {
  return (
    <header className="pt-6 pb-8 px-5 max-w-2xl mx-auto">
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

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 border-t border-border/50">
        <span className="text-sm text-muted-foreground">{frontmatter.author}</span>
        <span className="text-muted-foreground/40" aria-hidden>·</span>
        <time dateTime={frontmatter.date} className="text-sm text-muted-foreground">
          {new Date(frontmatter.date).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        {frontmatter.updatedDate && (
          <>
            <span className="text-muted-foreground/40" aria-hidden>·</span>
            <span className="text-xs text-muted-foreground/70">
              Güncellendi:{" "}
              <time dateTime={frontmatter.updatedDate}>
                {new Date(frontmatter.updatedDate).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
          </>
        )}
      </div>
    </header>
  );
}
