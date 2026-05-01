"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const MeetPepFlow = dynamic(
  () =>
    import("@/components/meet-pep/MeetPepFlow").then((m) => ({
      default: m.MeetPepFlow,
    })),
  { ssr: false }
);

function PepVisual() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="absolute w-72 h-72 rounded-full bg-accent/18 blur-3xl animate-glow-pulse" />
      <div className="absolute w-96 h-96 rounded-full bg-accent/10 blur-[100px]" style={{ animationDelay: "1.5s" }} />
      <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] xl:w-[620px] xl:h-[620px]">
        <Image
          src="/images/pep-hero.png"
          alt="Pep"
          fill
          priority
          className="object-contain drop-shadow-[0_24px_64px_hsl(var(--foreground)/0.18)]"
        />
      </div>
    </div>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const [meetPepOpen, setMeetPepOpen] = useState(false);

  return (
    <>
      <MeetPepFlow isOpen={meetPepOpen} onClose={() => setMeetPepOpen(false)} />
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-background" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/6 blur-[120px] translate-x-1/3 -translate-y-1/4" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative flex-1 flex flex-col max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12">
          <div className="flex-1 flex flex-col lg:flex-row items-center pt-28 pb-12 gap-12 lg:gap-8 xl:gap-16">
            {/* Text column */}
            <div className="flex-1 flex flex-col items-start lg:items-start animate-fade-up">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/70 bg-card/60 text-xs font-medium text-muted-foreground tracking-wide mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
                {t("eyebrow")}
              </span>

              <h1 className="text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[1.04] tracking-tightest text-foreground text-balance mb-7">
                {t("headline")
                  .split("\n")
                  .map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-[460px] text-pretty mb-10">
                {t("subheading")}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-12">
                <Button
                  size="xl"
                  variant="default"
                  className="group gap-2.5"
                  onClick={() => setMeetPepOpen(true)}
                >
                  Biraz Konuşalım
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
                <Button size="xl" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  {t("secondaryCta")}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "hsl(16,60%,65%)",
                    "hsl(210,50%,65%)",
                    "hsl(145,40%,60%)",
                    "hsl(280,40%,65%)",
                  ].map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background ring-1 ring-border/30"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">700K+</span>{" "}
                  {t("socialProof", { count: "" }).replace("{count}+", "").trim()}
                </div>
              </div>
            </div>

            {/* Visual column */}
            <div className="relative w-full lg:w-auto flex-shrink-0 flex items-center justify-center h-[520px] lg:h-auto lg:flex-1 lg:max-w-[420px] animate-fade-in">
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
        </div>
      </section>
    </>
  );
}
