import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBySection } from "@/components/landing/TrustedBySection";
import { WhyFlowboardSection } from "@/components/landing/WhyFlowboardSection";
import { TalentCategoriesSection } from "@/components/landing/TalentCategoriesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <>
      <title>Flowboard Team - Hire Pre-Vetted Talent From Emerging Markets</title>
      <meta
        name="description"
        content="Scale your engineering and business teams globally with FlowBoard. Access pre-vetted talent from 50+ countries. Faster hiring, smarter matching, better results."
      />
      
      <div className="min-h-screen">
        <Navbar />
        <main>
          <HeroSection />
          <TrustedBySection />
          <WhyFlowboardSection />
          <TalentCategoriesSection />
          <HowItWorksSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
