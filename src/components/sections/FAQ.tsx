"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  return (
    <section id="faq" className="section-padding bg-muted/20 border-y border-border/40">
      <div className="max-w-3xl mx-auto px-5 md:px-8 lg:px-12">
        <div className="mb-12 md:mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tightest text-foreground">
            {t("heading")}
          </h2>
        </div>

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
      </div>
    </section>
  );
}
