import { PreparedBackgroundGrid } from "@/components/landing/PreparedBackgroundGrid";
import { PreparedNavbar } from "@/components/landing/PreparedNavbar";
import { PreparedHero } from "@/components/landing/PreparedHero";
import { PreparedTrustedBy } from "@/components/landing/PreparedTrustedBy";
import { PreparedPlatform } from "@/components/landing/PreparedPlatform";

import { PreparedHub } from "@/components/landing/PreparedHub";
import { PreparedUseCases } from "@/components/landing/PreparedUseCases";

import { PlatformTimeline } from "@/components/landing/PlatformTimeline";
import { PlatformFeaturesGrid } from "@/components/landing/PlatformFeaturesGrid";
import { TalentProfilesCarousel } from "@/components/landing/TalentProfilesCarousel";
import { InsightsGrid } from "@/components/landing/InsightsGrid";
import { PreparedFooter } from "@/components/landing/PreparedFooter";

const Index = () => {
  return (
    <>
      <title>AI-powered solutions for emergency response | Prepared</title>
      <meta
        name="description"
        content="Supercharge your agency's operational efficiency with the transformative power of AI."
      />
      
      <div className="min-h-screen bg-prep-dark font-sans overflow-x-hidden w-full relative selection:bg-white/20 selection:text-white">
        
        {/* Dark Theme Background over the whole page */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#f4f2ee]"></div>
        
        <div className="relative z-10 w-full flex flex-col bg-[linear-gradient(180deg,_#A079FF_0%,_#8B6CE5_40%,_#5D489A_80%,_#3D2E68_100%)] has-noise overflow-hidden">
          {/* Structural Grid lines under content */}
          <PreparedBackgroundGrid />
          
          <PreparedNavbar />
          <PreparedHero />
        </div>

        <div className="relative z-10 w-full flex flex-col bg-[#f4f2ee] has-noise overflow-hidden pb-12">
          <PreparedBackgroundGrid />

          <PreparedTrustedBy />
          <PreparedPlatform />

          <PreparedHub />
          <PreparedUseCases />

          <PlatformFeaturesGrid />
          <TalentProfilesCarousel />
          <InsightsGrid />
        </div>

        <div className="relative z-20">
          <PreparedFooter />
        </div>

      </div>
    </>
  );
};

export default Index;
