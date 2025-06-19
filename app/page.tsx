import Pricing from "@/components/pricing";

//
import { HeroSection } from "@/components/lp-sections/hero-section";
import { KeyBenefitsSection } from "@/components/lp-sections/key-benefits-section";
import { Header } from "@/components/lp-sections/header";
import FooterSection from "@/components/lp-sections/footer";
//

export default async function Home() {
  // return
  return (
    <>
      <main className="container mx-auto max-w-5xl px-4 py-8 text-center">
        <Header />
        <HeroSection />
        <KeyBenefitsSection />
        <Pricing />
        <FooterSection />
      </main>
    </>
  );
}
