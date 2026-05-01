"use client";

import { useTranslations } from "next-intl";
import {
  Sparkles,
  MessageCircle,
  Activity,
  Target,
  Zap,
  Shield,
} from "lucide-react";

const featureIcons = [Sparkles, MessageCircle, Activity, Target, Zap, Shield];
const featureKeys = [
  "cycle",
  "pepTalk",
  "symptoms",
  "insights",
  "wellness",
  "privacy",
] as const;

export function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" className="section-padding">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <div className="mb-16 md:mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tightest text-foreground text-balance max-w-xl mb-5">
            {t("heading")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
            {t("subheading")}
          </p>
        </div>

        <FeatureGrid />
      </div>
    </section>
  );
}

function FeatureGrid() {
  const t = useTranslations("features.items");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40">
      {featureKeys.map((key, i) => {
        const Icon = featureIcons[i];
        return (
          <div
            key={key}
            className="group relative bg-background hover:bg-muted/30 transition-colors duration-300 p-8 lg:p-10 flex flex-col gap-5"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-br-full blur-2xl" />
            </div>
            <div className="w-11 h-11 rounded-2xl bg-muted border border-border/60 flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/8 transition-all duration-300">
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
            </div>
            <div className="space-y-2.5">
              <h3 className="text-base font-semibold text-foreground leading-snug">
                {t(`${key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`${key}.description`)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
