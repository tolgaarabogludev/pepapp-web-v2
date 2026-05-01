"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const stats = [
  { key: "users" },
  { key: "years" },
  { key: "insights" },
] as const;

export function SocialProof() {
  const t = useTranslations("stats");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="stats" className="py-16 md:py-20 border-y border-border/50 bg-muted/20">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 md:divide-x divide-border/50"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              variants={fadeInUp}
              className="flex flex-col items-center text-center md:px-10 lg:px-16 first:pl-0 last:pr-0"
            >
              <span className="text-4xl md:text-5xl font-bold tracking-tightest text-foreground mb-2">
                {t(`${stat.key}.value`)}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {t(`${stat.key}.label`)}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
