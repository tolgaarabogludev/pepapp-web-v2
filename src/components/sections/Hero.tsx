"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Container } from "@/components/layout/primitives/Container";

const MeetPepRuntime = dynamic(
  () =>
    import("@/features/meet-pep/runtime/MeetPepRuntime").then((m) => ({
      default: m.MeetPepRuntime,
    })),
  { ssr: false }
);

function PepVisual() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full bg-accent/18 blur-3xl animate-glow-pulse" />
      <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-accent/10 blur-[72px] md:blur-[100px]" style={{ animationDelay: "1.5s" }} />
      <div className="relative aspect-square w-[min(72vw,260px)] md:w-[420px] xl:w-[560px]">
        <Image
          src="/images/pep-hero.png"
          alt="Pep"
          fill
          priority
          sizes="(max-width: 768px) 260px, (max-width: 1280px) 420px, 620px"
          className="object-contain drop-shadow-[0_24px_64px_hsl(var(--foreground)/0.18)]"
        />
      </div>
    </div>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale() as "tr" | "en";
  const [meetPepOpen, setMeetPepOpen] = useState(false);
  useEffect(() => {
    const handleOpenMeetPep = () => setMeetPepOpen(true);

    window.addEventListener("open-meet-pep", handleOpenMeetPep);
    return () => window.removeEventListener("open-meet-pep", handleOpenMeetPep);
  }, []);

  return (
    <>
      {meetPepOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl">
          <div className="relative w-full max-w-xl">
            <button
              type="button"
              onClick={() => setMeetPepOpen(false)}
              className="absolute -top-12 right-0 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
            >
              Kapat
            </button>
            <MeetPepRuntime locale={locale} />
          </div>
        </div>
      )}
      <section className="relative min-h-[100svh] md:min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 w-full max-w-[100vw] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-background" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-accent/6 blur-[72px] translate-x-1/4 -translate-y-1/4 md:w-[600px] md:h-[600px] md:blur-[120px] md:translate-x-1/3" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <Container className="relative flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row items-center pt-24 sm:pt-28 pb-10 sm:pb-12 gap-10 lg:gap-8 xl:gap-16 min-w-0">
            {/* Text column */}
            <div className="flex-1 min-w-0 flex flex-col items-center text-center lg:items-start lg:text-left animate-fade-up">
              <div className="inline-flex items-center justify-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border/70 bg-card/70 text-xs font-medium text-muted-foreground tracking-wide mb-8 shadow-sm backdrop-blur-sm">
                <span className="flex items-center gap-0.5 text-accent" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </span>
                <span>
                  <span className="font-semibold text-foreground">{t("ratingCount")}</span> {t("ratingLabel")}
                </span>
              </div>

              <h1 className="text-[clamp(2.5rem,11vw,5.5rem)] lg:text-[clamp(3.75rem,6vw,5.5rem)] font-bold leading-[1.04] tracking-tightest text-foreground text-balance mb-7 text-center lg:text-left">
                {t("headline")
                  .split("\n")
                  .map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-[460px] text-pretty mb-10 text-center lg:text-left">
                {t("subheading")}
              </p>

              <div className="flex w-full flex-col sm:w-auto sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 mb-12">
                <Button
                  asChild
                  size="xl"
                  variant="default"
                  className="group gap-2.5 w-full sm:w-auto"
                >
                  <a href="#final-cta">
                    {t("primaryCta")}
                  </a>
                </Button>
              </div>

              <div className="flex flex-col items-center lg:items-start gap-1.5 text-center lg:text-left mb-2">
                <p className="text-sm md:text-base font-semibold text-foreground">
                  {t("happyWomen")}
                </p>
                <a
                  href="https://ghpnews.digital/winners/pepapp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center lg:justify-start gap-1.5 text-xs md:text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {t("awardText")}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Visual column */}
            <div className="relative w-full max-w-full lg:w-auto flex-shrink-0 flex items-center justify-center h-[320px] sm:h-[360px] md:h-[520px] lg:h-auto lg:flex-1 lg:max-w-[460px] xl:max-w-[560px] animate-fade-in">
              <PepVisual />
            </div>
          </div>

          {/* Scroll hint */}
          <div className="flex justify-center pb-8">
            <a
              href="#stats"
              className="flex flex-col items-center gap-2 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
