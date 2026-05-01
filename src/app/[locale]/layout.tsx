import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Pepapp — Döngünü Anla",
    template: "%s | Pepapp",
  },
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
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Pepapp",
    title: "Pepapp — Döngünü Anla",
    description:
      "Döngünü yalnızca takip etme. Onu anla. 700K+ kullanıcının güvendiği premium sağlık uygulaması.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pepapp — Döngünü Anla",
    description:
      "Döngünü yalnızca takip etme. Onu anla. 700K+ kullanıcının güvendiği premium sağlık uygulaması.",
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "tr" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
