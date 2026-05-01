import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function ArticleAppCta() {
  const locale = useLocale();
  const t = useTranslations("articleAppCta");

  return (
    <div className="px-5 max-w-2xl mx-auto py-6">
      <div className="rounded-2xl bg-gradient-to-br from-accent/10 via-muted/30 to-muted/50 border border-border/40 px-7 py-8">
        <p className="text-base font-semibold text-foreground mb-2">
          {t("title")}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {t("description")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}#download`}
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity"
          >
            {t("download")}
          </Link>
          <Link
            href={`/${locale}#peptalk`}
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-foreground transition-colors"
          >
            {t("discover")}
          </Link>
        </div>
      </div>
    </div>
  );
}
