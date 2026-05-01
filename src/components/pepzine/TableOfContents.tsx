import type { Heading } from "@/lib/pepzine/headings";
import { useTranslations } from "next-intl";

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length < 3) return null;

  const t = useTranslations("tableOfContents");

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="hidden md:block px-5 max-w-2xl mx-auto mb-8"
    >
      <div className="rounded-xl border border-border/50 bg-muted/30 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          {t("title")}
        </p>
        <ol className="flex flex-col gap-1.5">
          {headings.map((h) => (
            <li
              key={h.id}
              className={h.level === 3 ? "pl-4" : ""}
            >
              <a
                href={`#${h.id}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors leading-snug"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
