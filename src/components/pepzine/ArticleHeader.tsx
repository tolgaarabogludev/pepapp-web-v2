import type { PepzineFrontmatter } from "@/lib/pepzine/types";
import { useLocale, useTranslations } from "next-intl";

interface ArticleHeaderProps {
  frontmatter: PepzineFrontmatter;
}

function formatArticleDate(date?: string, locale?: string) {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ArticleHeader({ frontmatter }: ArticleHeaderProps) {
  const locale = useLocale();
  const t = useTranslations("articleHeader");

  const categoryLabel = frontmatter.category || "Pepzine";
  const formattedDate = formatArticleDate(frontmatter.date, locale);
  const formattedUpdatedDate = formatArticleDate(frontmatter.updatedAt, locale);
  const readingTimeLabel = locale === "tr" ? "dk okuma" : "min read";
  const readingTime = frontmatter.readingTime;

  return (
    <header className="pt-8 pb-8 px-5 max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          {categoryLabel}
        </span>

        {readingTime ? (
          <span className="text-xs text-muted-foreground">
            {readingTime} {readingTimeLabel}
          </span>
        ) : null}
      </div>

      <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-5">
        {frontmatter.title}
      </h1>

      {frontmatter.description ? (
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-7">
          {frontmatter.description}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 border-t border-border/50">
        {frontmatter.author ? (
          <span className="text-sm text-muted-foreground">{frontmatter.author}</span>
        ) : null}

        {frontmatter.author && formattedDate ? (
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
        ) : null}

        {formattedDate ? (
          <time dateTime={frontmatter.date} className="text-sm text-muted-foreground">
            {formattedDate}
          </time>
        ) : null}

        {formattedUpdatedDate ? (
          <>
            <span className="text-muted-foreground/40" aria-hidden>
              ·
            </span>
            <span className="text-xs text-muted-foreground/70">
              {t("updated")}: <time dateTime={frontmatter.updatedAt}>{formattedUpdatedDate}</time>
            </span>
          </>
        ) : null}
      </div>
    </header>
  );
}
