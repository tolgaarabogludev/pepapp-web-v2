import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function ArticleAppCta() {
  const locale = useLocale();
  const t = useTranslations("articleAppCta");

  return (
    <section className="px-5 max-w-2xl mx-auto py-16">
      <div className="rounded-[2rem] border border-border/60 bg-foreground px-7 py-8 md:px-9 md:py-10 text-background">
        <p className="text-xs font-semibold uppercase tracking-widest text-background/60 mb-3">
          Pepapp
        </p>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
          {t("title")}
        </h2>

        <p className="text-sm md:text-base text-background/70 leading-relaxed mb-7 max-w-xl">
          {t("description")}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}#download`}
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-background text-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {t("download")}
          </Link>

          <Link
            href={`/${locale}#peptalk`}
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-white/15 text-sm font-medium text-background hover:border-white/40 transition-colors"
          >
            {t("discover")}
          </Link>
        </div>
      </div>
    </section>
  );
}
