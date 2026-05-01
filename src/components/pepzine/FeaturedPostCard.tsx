import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PepzinePostMeta } from "@/lib/pepzine/types";

interface FeaturedPostCardProps {
  post: PepzinePostMeta;
  locale?: string;
}

function getCategoryGradient(category: string) {
  const gradients: Record<string, string> = {
    döngü: "from-rose-200/70 via-pink-100/60 to-orange-100/60 dark:from-rose-500/20 dark:via-pink-500/10 dark:to-orange-500/10",
    zihin: "from-violet-200/70 via-purple-100/60 to-sky-100/60 dark:from-violet-500/20 dark:via-purple-500/10 dark:to-sky-500/10",
    beslenme: "from-emerald-200/70 via-lime-100/60 to-yellow-100/60 dark:from-emerald-500/20 dark:via-lime-500/10 dark:to-yellow-500/10",
    hareket: "from-sky-200/70 via-cyan-100/60 to-teal-100/60 dark:from-sky-500/20 dark:via-cyan-500/10 dark:to-teal-500/10",
    uyku: "from-indigo-200/70 via-blue-100/60 to-slate-100/60 dark:from-indigo-500/20 dark:via-blue-500/10 dark:to-slate-500/10",
    ilişkiler: "from-fuchsia-200/70 via-pink-100/60 to-rose-100/60 dark:from-fuchsia-500/20 dark:via-pink-500/10 dark:to-rose-500/10",
  };

  return gradients[category] ?? "from-rose-200/70 via-pink-100/60 to-orange-100/60 dark:from-rose-500/20 dark:via-pink-500/10 dark:to-orange-500/10";
}

export function FeaturedPostCard({ post, locale = "tr" }: FeaturedPostCardProps) {
  const { slug, frontmatter } = post;
  const href = locale === "tr" ? `/tr/pepzine/${slug}` : `/en/pepzine/${slug}`;
  const categoryGradient = getCategoryGradient(frontmatter.category);
  const formattedDate = new Date(frontmatter.date).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const readLabel = locale === "tr" ? "Yazıyı oku" : "Read article";
  const readingTimeLabel = locale === "tr" ? "dk okuma" : "min read";
  const t = useTranslations("pepzinePage.categories");
  const categoryLabel = t(frontmatter.category);

  return (
    <Link href={href} className="group block">
      <article className="relative flex flex-col gap-4 p-8 rounded-3xl border border-border/60 bg-card overflow-hidden hover:border-border transition-colors duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
        <div
          className={`relative aspect-[16/7] overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${categoryGradient}`}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.55),transparent_32%),radial-gradient(circle_at_78%_35%,rgba(255,255,255,0.35),transparent_28%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_78%_35%,rgba(255,255,255,0.08),transparent_28%)]" />
          <div className="absolute bottom-5 left-5 rounded-full border border-white/50 bg-white/45 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-black/45 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-white/45">
            {categoryLabel}
          </div>
        </div>
        <div className="relative flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            {categoryLabel}
          </span>
          {frontmatter.readingTime && (
            <span className="text-xs text-muted-foreground">
              {frontmatter.readingTime} {readingTimeLabel}
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
            {formattedDate}
          </span>
          <span className="text-sm font-semibold text-accent group-hover:underline">
            {readLabel} →
          </span>
        </div>
      </article>
    </Link>
  );
}
