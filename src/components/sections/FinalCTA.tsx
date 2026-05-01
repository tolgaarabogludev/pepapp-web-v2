"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";

function AppStoreBadge({ store }: { store: "apple" | "google" }) {
  return (
    <Button
      size="xl"
      variant={store === "apple" ? "default" : "outline"}
      className="gap-3 min-w-[180px]"
    >
      {store === "apple" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M3.18 23.76a2 2 0 0 1-.96-1.76V2a2 2 0 0 1 .96-1.76l.1-.05 11.56 11.56v.27L3.28 23.81zM15.53 16.26l-3.85-3.85 3.85-3.85 4.33 2.48c1.24.71 1.24 1.86 0 2.57l-4.33 2.65zM3.28.19l11.56 11.56-3.85 3.85L.96.72A2 2 0 0 1 3.28.19zm12.25 16.07l-11.56 11.56a2 2 0 0 1-2.32.47L12.97 16.7l2.56 1.56z" />
        </svg>
      )}
      <span className="text-sm font-medium leading-tight text-left">
        {store === "apple" ? (
          <span>
            <span className="text-xs opacity-70 block">Download on the</span>
            App Store
          </span>
        ) : (
          <span>
            <span className="text-xs opacity-70 block">Get it on</span>
            Google Play
          </span>
        )}
      </span>
    </Button>
  );
}

export function FinalCTA() {
  const t = useTranslations("finalCta");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-12 text-center">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-3xl mx-auto"
        >
          <motion.p
            variants={fadeInUp}
            className="text-xs font-semibold uppercase tracking-widest text-accent mb-6"
          >
            {t("eyebrow")}
          </motion.p>

          <motion.h2
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tightest text-foreground mb-6 text-balance"
          >
            {t("heading")}
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg text-muted-foreground leading-relaxed mb-12 max-w-xl mx-auto"
          >
            {t("subheading")}
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <AppStoreBadge store="apple" />
            <AppStoreBadge store="google" />
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="text-xs text-muted-foreground/60"
          >
            {t("disclaimer")}
          </motion.p>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-accent/8 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="absolute -right-20 top-1/3 w-48 h-48 bg-accent/6 rounded-full blur-3xl pointer-events-none"
        />
      </div>
    </section>
  );
}
