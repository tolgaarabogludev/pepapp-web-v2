import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { SocialProof } from "@/components/sections/SocialProof";
import { Features } from "@/components/sections/Features";
import { PepTalk } from "@/components/sections/PepTalk";
import { Screenshots } from "@/components/sections/Screenshots";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <PepTalk />
        <Screenshots />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
