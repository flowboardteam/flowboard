import { UseCaseTemplate } from "@/components/landing/UseCaseTemplate";

export default function PerformanceTracking() {
  return (
    <UseCaseTemplate 
      metaTitle="SOLUTIONS"
      heroTitle="Performance Tracking & Labeling"
      heroDescription="Rapidly improve performance and morale with real-time visibility into every KPI and deliverable."
      accordionItems={[
        { id: "track", title: "Velocity Analytics", desc: "Monitor sprint burndowns and identify operational bottlenecks instantly." },
        { id: "source", title: "Output Scoring", desc: "Automatically label high-yield tickets and cross-reference task complexity." },
        { id: "compliance", title: "Quality Auditing", desc: "Ensure engineering output matches stringent organizational guidelines without manual checks." }
      ]}
    />
  );
}
