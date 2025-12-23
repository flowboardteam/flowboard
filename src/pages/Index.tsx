import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { TrustedBySection } from "@/components/TrustedBySection";
import { WhyFlowboardSection } from "@/components/WhyFlowboardSection";
import { TalentCategoriesSection } from "@/components/TalentCategoriesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

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
