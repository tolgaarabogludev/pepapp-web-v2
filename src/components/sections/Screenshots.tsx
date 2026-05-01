"use client";

import { useTranslations } from "next-intl";

const screens = [
  {
    key: "dashboard",
    gradient: "from-amber-100/80 via-orange-50/60 to-rose-100/40",
    darkGradient: "dark:from-amber-950/40 dark:via-rose-950/30 dark:to-zinc-900/20",
    accentColor: "hsl(35, 80%, 65%)",
    items: [
      { type: "heading", width: "60%" },
      { type: "ring" },
      { type: "chips" },
      { type: "bars" },
    ],
  },
  {
    key: "cycle",
    gradient: "from-rose-100/70 via-pink-50/50 to-fuchsia-50/30",
    darkGradient: "dark:from-rose-950/50 dark:via-pink-950/30 dark:to-zinc-900/20",
    accentColor: "hsl(342, 60%, 65%)",
    items: [
      { type: "heading", width: "55%" },
      { type: "calendar" },
      { type: "stats" },
    ],
  },
  {
    key: "chat",
    gradient: "from-violet-100/60 via-purple-50/40 to-blue-50/30",
    darkGradient: "dark:from-violet-950/40 dark:via-purple-950/25 dark:to-zinc-900/20",
    accentColor: "hsl(280, 50%, 65%)",
    items: [
      { type: "heading", width: "45%" },
      { type: "chat" },
    ],
  },
  {
    key: "insights",
    gradient: "from-teal-100/60 via-emerald-50/40 to-cyan-50/30",
    darkGradient: "dark:from-teal-950/40 dark:via-emerald-950/25 dark:to-zinc-900/20",
    accentColor: "hsl(160, 50%, 55%)",
    items: [
      { type: "heading", width: "65%" },
      { type: "graph" },
      { type: "list" },
    ],
  },
];

function ScreenContent({
  items,
  accentColor,
}: {
  items: (typeof screens)[0]["items"];
  accentColor: string;
}) {
  return (
    <div className="absolute inset-0 pt-14 px-4 pb-4 flex flex-col gap-2.5">
      {items.map((item, i) => {
        if (item.type === "heading") {
          return (
            <div key={i} className="space-y-1.5 mb-1">
              <div className="h-2 bg-foreground/10 rounded-full" style={{ width: "40%" }} />
              <div className="h-5 bg-foreground/15 rounded-lg" style={{ width: item.width || "60%" }} />
            </div>
          );
        }
        if (item.type === "ring") {
          return (
            <div key={i} className="flex items-center gap-4 bg-background/40 rounded-2xl p-3 border border-white/20 dark:border-white/5">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 48 48" className="-rotate-90 w-full h-full">
                  <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                  <circle cx="24" cy="24" r="18" fill="none" stroke={accentColor} strokeWidth="4"
                    strokeDasharray="113" strokeDashoffset="40" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">14</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="h-2 bg-foreground/20 rounded-full w-3/4" />
                <div className="h-1.5 bg-foreground/10 rounded-full w-1/2" />
              </div>
            </div>
          );
        }
        if (item.type === "chips") {
          return (
            <div key={i} className="flex gap-1.5 flex-wrap">
              {[64, 80, 48].map((w, j) => (
                <div key={j} className="h-6 rounded-full bg-background/50 border border-white/20 dark:border-white/5 px-2.5 flex items-center">
                  <div className="h-1.5 rounded-full bg-foreground/20" style={{ width: w }} />
                </div>
              ))}
            </div>
          );
        }
        if (item.type === "bars") {
          return (
            <div key={i} className="bg-background/40 rounded-2xl p-3 border border-white/20 dark:border-white/5">
              <div className="h-1.5 bg-foreground/15 rounded-full w-16 mb-3" />
              <div className="flex items-end gap-1 h-10">
                {[35, 55, 40, 70, 50, 85, 65].map((h, j) => (
                  <div key={j} className="flex-1 rounded-full"
                    style={{ height: `${h}%`, backgroundColor: j === 5 ? accentColor : "hsl(var(--muted-foreground)/0.2)" }}
                  />
                ))}
              </div>
            </div>
          );
        }
        if (item.type === "calendar") {
          return (
            <div key={i} className="bg-background/40 rounded-2xl p-3 border border-white/20 dark:border-white/5">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, j) => (
                  <div key={j} className="aspect-square rounded-full flex items-center justify-center">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          j >= 10 && j <= 14 ? `${accentColor}60` :
                          j >= 24 && j <= 27 ? `${accentColor}30` :
                          j === 17 ? accentColor :
                          "hsl(var(--muted-foreground)/0.12)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (item.type === "chat") {
          return (
            <div key={i} className="flex-1 space-y-2">
              {[
                { user: true, width: "75%" },
                { user: false, width: "88%" },
                { user: false, width: "70%" },
                { user: true, width: "55%" },
              ].map((bubble, j) => (
                <div key={j} className={`flex ${bubble.user ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`h-7 rounded-2xl ${bubble.user ? "bg-foreground/20" : "bg-background/50 border border-white/20 dark:border-white/5"}`}
                    style={{ width: bubble.width }}
                  />
                </div>
              ))}
            </div>
          );
        }
        if (item.type === "stats") {
          return (
            <div key={i} className="grid grid-cols-2 gap-2">
              {[accentColor, "hsl(var(--muted-foreground)/0.3)"].map((color, j) => (
                <div key={j} className="bg-background/40 rounded-xl p-3 border border-white/20 dark:border-white/5">
                  <div className="h-5 w-8 rounded mb-1" style={{ backgroundColor: color }} />
                  <div className="h-1.5 bg-foreground/15 rounded-full w-14" />
                </div>
              ))}
            </div>
          );
        }
        if (item.type === "graph") {
          return (
            <div key={i} className="bg-background/40 rounded-2xl p-3 border border-white/20 dark:border-white/5">
              <div className="h-1.5 bg-foreground/15 rounded-full w-20 mb-2" />
              <svg viewBox="0 0 160 50" className="w-full">
                <path
                  d="M0,40 C20,35 30,15 50,18 C70,21 80,35 100,25 C120,15 140,8 160,12"
                  fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round"
                />
                <path
                  d="M0,40 C20,35 30,15 50,18 C70,21 80,35 100,25 C120,15 140,8 160,12 L160,50 L0,50 Z"
                  fill={accentColor} opacity="0.08"
                />
              </svg>
            </div>
          );
        }
        if (item.type === "list") {
          return (
            <div key={i} className="space-y-1.5">
              {[100, 85, 70].map((w, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor, opacity: 1 - j * 0.2 }} />
                  <div className="h-2 bg-foreground/15 rounded-full" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function ScreenMockup({ screen, index }: { screen: (typeof screens)[0]; index: number }) {
  const t = useTranslations("screenshots.screens");

  return (
    <div
      className="flex flex-col items-center gap-4 flex-shrink-0 w-[220px] md:w-[240px]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative w-full aspect-[9/18]">
        <div className="absolute inset-0 rounded-[36px] border border-border/60 bg-gradient-to-br from-muted to-card shadow-lg" />
        <div className={`absolute inset-[2px] rounded-[35px] overflow-hidden bg-gradient-to-br ${screen.gradient} ${screen.darkGradient}`}>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-foreground/80 rounded-full z-10" />
          <ScreenContent items={screen.items} accentColor={screen.accentColor} />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        {t(screen.key as "dashboard" | "cycle" | "chat" | "insights")}
      </p>
    </div>
  );
}

export function Screenshots() {
  const t = useTranslations("screenshots");

  return (
    <section className="section-padding overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <div className="mb-16 md:mb-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tightest text-foreground mb-5">
            {t("heading")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {t("subheading")}
          </p>
        </div>

        <div className="-mx-5 md:-mx-8 lg:mx-0">
          <div className="flex gap-5 md:gap-6 px-5 md:px-8 lg:px-0 overflow-x-auto lg:overflow-visible lg:justify-center pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-none">
            {screens.map((screen, i) => (
              <div key={screen.key} className="snap-center">
                <ScreenMockup screen={screen} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
