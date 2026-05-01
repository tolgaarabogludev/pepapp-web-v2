"use client";

import { useTranslations } from "next-intl";

const stats = [
  { key: "users" },
  { key: "years" },
  { key: "insights" },
] as const;

export function SocialProof() {
  const t = useTranslations("stats");

  return (
    <section id="stats" className="py-16 md:py-20 border-y border-border/50 bg-muted/20">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 md:divide-x divide-border/50">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="flex flex-col items-center text-center md:px-10 lg:px-16 first:pl-0 last:pr-0"
            >
              <span className="text-4xl md:text-5xl font-bold tracking-tightest text-foreground mb-2">
                {t(`${stat.key}.value`)}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {t(`${stat.key}.label`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
