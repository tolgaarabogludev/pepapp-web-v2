import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { SocialProof } from "@/components/sections/SocialProof";
import { Features } from "@/components/sections/Features";
import { PepTalk } from "@/components/sections/PepTalk";
import { Screenshots } from "@/components/sections/Screenshots";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function HomePage() {
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
