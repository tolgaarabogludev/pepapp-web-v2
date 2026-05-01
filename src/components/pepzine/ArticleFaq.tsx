import type { PepzineFaq } from "@/lib/pepzine/types";
import { useTranslations } from "next-intl";

interface ArticleFaqProps {
  faqs: PepzineFaq[];
}

export function ArticleFaq({ faqs }: ArticleFaqProps) {
  if (!faqs || faqs.length === 0) return null;
  const t = useTranslations("articleFaq");

  return (
    <section
      aria-labelledby="faq-heading"
      className="px-5 max-w-2xl mx-auto pb-10 pt-6"
    >
      <h2
        id="faq-heading"
        className="text-base font-semibold text-foreground mb-6"
      >
        {t("title")}
      </h2>
      <dl className="flex flex-col gap-6">
        {faqs.map((faq, i) => (
          <div key={i} className="border-t border-border/40 pt-5">
            <dt className="text-sm font-semibold text-foreground mb-2">
              {faq.question}
            </dt>
            <dd className="text-sm text-muted-foreground leading-relaxed">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
