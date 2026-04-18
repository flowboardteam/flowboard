import { UseCaseTemplate } from "@/components/landing/UseCaseTemplate";

export default function IntelligentSourcing() {
  return (
    <UseCaseTemplate 
      metaTitle="SOLUTIONS"
      heroTitle="Intelligent Sourcing"
      heroDescription="Eliminate geographical barriers to get every hiring manager the talent they need, faster than ever before."
      accordionItems={[
        { id: "source", title: "Global Talent Polling", desc: "Instantly aggregate data across dozens of international job platforms into a unified system." },
        { id: "track", title: "AI Vetting", desc: "Automate manual screening and extract signals instantly from dense candidate portfolios." },
        { id: "compliance", title: "Compliance Pass", desc: "Ensure candidates natively meet all localized credentialing requirements before the interview." }
      ]}
    />
  );
}
