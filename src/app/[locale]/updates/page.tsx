

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/primitives/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "updates" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const updates = [
  {
    version: "2.0.0",
    dateKey: "v200.date",
    items: ["v200.items.0", "v200.items.1", "v200.items.2", "v200.items.3"],
  },
  {
    version: "1.9.0",
    dateKey: "v190.date",
    items: ["v190.items.0", "v190.items.1", "v190.items.2"],
  },
  {
    version: "1.8.0",
    dateKey: "v180.date",
    items: ["v180.items.0", "v180.items.1", "v180.items.2"],
  },
];

export default async function UpdatesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "updates" });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <Container className="max-w-3xl">
        <div className="mb-14 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {t("description")}
          </p>
        </div>

        <div className="space-y-5">
          {updates.map((update) => (
            <article
              key={update.version}
              className="rounded-[2rem] border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:p-8"
            >
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("version")}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    v{update.version}
                  </h2>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t(update.dateKey)}
                </p>
              </div>

              <ul className="space-y-3">
                {update.items.map((itemKey) => (
                  <li key={itemKey} className="flex gap-3 text-sm leading-6 text-muted-foreground sm:text-base">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                    <span>{t(itemKey)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}