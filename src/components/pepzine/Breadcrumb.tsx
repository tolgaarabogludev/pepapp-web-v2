import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  category?: string;
  categorySlug?: string;
  title: string;
  locale?: string;
}

export function Breadcrumb({
  category,
  categorySlug,
  title,
  locale = "tr",
}: BreadcrumbProps) {
  const base = locale === "tr" ? "/tr" : "/en";

  const items: BreadcrumbItem[] = [
    { label: "Pepapp", href: base },
    { label: "Pepzine", href: `${base}/pepzine` },
    ...(category
      ? [
          {
            label: category,
            href: categorySlug ? `${base}/pepzine/${categorySlug}` : undefined,
          },
        ]
      : []),
    { label: title },
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="px-5 md:px-8 max-w-2xl mx-auto pt-24 pb-0"
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <span className="text-muted-foreground/40 text-xs" aria-hidden>
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="text-xs text-foreground/70 truncate max-w-[180px]"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
