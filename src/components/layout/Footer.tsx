import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("product.title"),
      links: [
        { label: t("product.features"), href: "#features" },
        { label: t("product.pepTalk"), href: "#peptalk" },
        { label: t("product.pricing"), href: `/${locale}/premium` },
        { label: t("product.changelog"), href: `/${locale}/updates` },
      ],
    },
    {
      title: t("company.title"),
      links: [
        { label: t("company.about"), href: `/${locale}/about` },
        { label: t("company.blog"), href: `/${locale}/pepzine` },
        { label: t("company.careers"), href: "#" },
        { label: t("company.press"), href: "#" },
      ],
    },
    {
      title: t("legal.title"),
      links: [
        { label: t("legal.privacy"), href: "#" },
        { label: t("legal.terms"), href: "#" },
        { label: t("legal.cookies"), href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-1 group mb-4">
              <Image
                src="/images/Pepapp-Logo.png"
                alt="Pepapp"
                width={88}
                height={24}
                priority
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              {t("tagline")}
            </p>
          </div>

          {/* Links */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {t("copyright", { year })}
          </p>
          <div className="flex items-center gap-3">
            <details className="relative group">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                {locale === "tr" ? "Türkçe" : "English"}
                <span className="text-[10px] text-muted-foreground transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="absolute bottom-full right-0 mb-2 min-w-36 overflow-hidden rounded-2xl border border-border/70 bg-background p-1 shadow-lg">
                <Link
                  href="/tr"
                  className="block rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Türkçe
                </Link>
                <Link
                  href="/en"
                  className="block rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  English
                </Link>
              </div>
            </details>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
