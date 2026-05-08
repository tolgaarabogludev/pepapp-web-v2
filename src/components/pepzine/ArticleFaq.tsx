import type { PepzineFaq } from "@/lib/pepzine/types";
import { useTranslations } from "next-intl";

interface ArticleFaqProps {
  faqs: PepzineFaq[];
}

export function ArticleFaq({ faqs }: ArticleFaqProps) {
  const t = useTranslations("articleFaq");

  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      aria-labelledby="faq-heading"
      className="px-5 max-w-2xl mx-auto py-14"
    >
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          FAQ
        </p>
        <h2
          id="faq-heading"
          className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"
        >
          {t("title")}
        </h2>
      </div>

      <dl className="space-y-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-muted/30 px-5 py-5"
          >
            <dt className="text-base font-semibold tracking-tight text-foreground mb-2">
              {faq.question}
            </dt>
            <dd className="text-sm md:text-base text-muted-foreground leading-7">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
