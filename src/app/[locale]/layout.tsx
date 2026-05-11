import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Providers } from "../providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600"],
});

type Locale = "tr" | "en";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const seo = {
  tr: {
    title: "Pepapp — Döngünü Anla",
    description:
      "Pepapp, döngünü yalnızca takip etmez. Seni zamanla tanır, değişimlerini hisseder ve ihtiyacın olanı tam zamanında sunar.",
    keywords: [
      "döngü takibi",
      "kadın sağlığı",
      "adet takibi",
      "pepapp",
      "AI sağlık yardımcısı",
      "femtech",
    ],
    ogLocale: "tr_TR",
  },
  en: {
    title: "Pepapp — Understand Your Cycle",
    description:
      "Pepapp goes beyond cycle tracking. It learns your rhythm, adapts to your needs, and supports you with timely, thoughtful insights.",
    keywords: [
      "cycle tracking",
      "period tracker",
      "women's health",
      "pepapp",
      "AI health assistant",
      "femtech",
    ],
    ogLocale: "en_US",
  },
} as const;


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const current = seo[locale as Locale] ?? seo.tr;

  return {
    metadataBase: new URL("https://www.letspepapp.com"),
    title: {
      default: current.title,
      template: "%s | Pepapp",
    },
    description: current.description,
    keywords: [...current.keywords],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        tr: "/tr",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: current.ogLocale,
      siteName: "Pepapp",
      title: current.title,
      description: current.description,
      url: `/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={inter.variable}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Providers>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </Providers>
        </ThemeProvider>
        {process.env.VERCEL === "1" && <SpeedInsights />}
      </body>
    </html>
  );
}
