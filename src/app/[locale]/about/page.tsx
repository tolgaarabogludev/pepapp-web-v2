import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { useLocale, useTranslations } from 'next-intl'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'aboutPage' })

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

const beliefKeys = ['body', 'cycle', 'understanding', 'wellbeing'] as const
const teamPillarKeys = ['small', 'care', 'product'] as const

export default function AboutPage() {
  const t = useTranslations('aboutPage')
  const locale = useLocale()

  return (
    <>
      <Header />
      <main className="bg-white text-black dark:bg-[#0b0b0d] dark:text-white">
        <section className="mx-auto max-w-4xl px-6 pb-20 pt-24 sm:px-8 sm:pt-32">
          <div className="max-w-3xl">
            <p className="text-sm font-medium tracking-[-0.01em] text-black/50 dark:text-white/50">
              {t('hero.eyebrow')}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-black dark:text-white sm:text-6xl sm:leading-[1.05]">
              {t('hero.title')}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-black/65 dark:text-white/65 sm:text-lg sm:leading-8">
              {t('hero.description')}
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-10 px-6 py-20 sm:px-8 md:grid-cols-[180px_1fr]">
          <p className="text-sm font-medium tracking-[-0.01em] text-black/45 dark:text-white/45">
            {t('why.eyebrow')}
          </p>
          <div className="max-w-3xl space-y-6 text-lg leading-8 tracking-[-0.02em] text-black/80 dark:text-white/80 sm:text-xl sm:leading-9">
            <p>{t('why.line1')}</p>
            <p>{t('why.line2')}</p>
            <p>{t('why.line3')}</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-[-0.01em] text-black/45 dark:text-white/45">
              {t('beliefs.eyebrow')}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-black dark:text-white sm:text-4xl">
              {t('beliefs.title')}
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {beliefKeys.map((key) => (
              <div
                key={key}
                className="rounded-3xl border border-black/8 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.04] sm:p-8"
              >
                <h3 className="text-xl font-medium tracking-[-0.02em] text-black dark:text-white">
                  {t(`beliefs.items.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-7 text-black/60 dark:text-white/60 sm:text-base">
                  {t(`beliefs.items.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 sm:px-8">
          <div className="rounded-3xl bg-[#faf7fb] px-8 py-12 dark:bg-white/[0.04] sm:px-12 sm:py-16">
            <p className="text-sm font-medium tracking-[-0.01em] text-black/45 dark:text-white/45">
              {t('feel.eyebrow')}
            </p>
            <div className="mt-6 max-w-3xl space-y-4 text-2xl font-medium tracking-[-0.03em] text-black dark:text-white sm:text-4xl sm:leading-tight">
              <p>{t('feel.line1')}</p>
              <p>{t('feel.line2')}</p>
              <p>{t('feel.line3')}</p>
              <p>{t('feel.line4')}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-start">
            <div>
              <p className="text-sm font-medium tracking-[-0.01em] text-black/45 dark:text-white/45">
                {t('behind.eyebrow')}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-black dark:text-white sm:text-4xl">
                {t('behind.title')}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 dark:text-white/65 sm:text-lg">
                {t('behind.description')}
              </p>
            </div>

            <div className="grid gap-3">
              {teamPillarKeys.map((key) => (
                <div
                  key={key}
                  className="rounded-2xl border border-black/8 px-5 py-4 text-sm text-black/70 dark:border-white/10 dark:text-white/70"
                >
                  {t(`behind.pillars.${key}`)}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 sm:px-8">
          <p className="text-sm font-medium tracking-[-0.01em] text-black/45 dark:text-white/45">
            {t('future.eyebrow')}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-black dark:text-white sm:text-4xl">
            {t('future.title')}
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-black/65 dark:text-white/65 sm:text-lg">
            {t('future.description')}
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-28 pt-10 sm:px-8">
          <div className="rounded-3xl border border-black/8 bg-black/[0.02] px-8 py-10 dark:border-white/10 dark:bg-white/[0.04] sm:px-10 sm:py-12">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black dark:text-white sm:text-3xl">
              {t('finalCta.title')}
            </h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}#download`}
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                {t('finalCta.primaryCta')}
              </Link>
              <Link
                href={`/${locale}/pepzine`}
                className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-black transition hover:bg-black/[0.03] dark:border-white/15 dark:text-white dark:hover:bg-white/[0.06]"
              >
                {t('finalCta.secondaryCta')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}