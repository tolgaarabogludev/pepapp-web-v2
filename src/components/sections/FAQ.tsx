"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const faqKeys = [
  "what",
  "ai",
  "privacy",
  "free",
  "platforms",
  "irregular",
] as const;

export function FAQ() {
  const t = useTranslations("faq");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" className="section-padding bg-muted/20 border-y border-border/40">
      <div className="max-w-3xl mx-auto px-5 md:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-12 md:mb-16"
        >
          <motion.p
            variants={fadeInUp}
            className="text-xs font-semibold uppercase tracking-widest text-accent mb-4"
          >
            {t("eyebrow")}
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold tracking-tightest text-foreground"
          >
            {t("heading")}
          </motion.h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqKeys.map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-base font-medium">
                  {t(`items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent>
                  {t(`items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
