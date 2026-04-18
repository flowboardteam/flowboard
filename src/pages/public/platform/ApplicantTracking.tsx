import { PlatformPageTemplate } from "@/components/landing/PlatformPageTemplate";

export default function ApplicantTracking() {
  return (
    <PlatformPageTemplate 
      metaTitle="END-TO-END"
      heroTitle="Applicant Tracking"
      heroDescription="Reduce the burden of application volume, flow streamline parsing pipelines, and eliminate data backlogs."
      heroImage="/payroll.jpg"
      
      features={[
        { num: "01", title: "AI Recruiting", desc: "Automate manual screening and let our intelligent engine surface the strongest candidates instantly based on skill profiles." },
        { num: "02", title: "Talent Sourcing", desc: "Access global candidate pools seamlessly, pulling profiles effortlessly across localized job boards into one unified system." },
        { num: "03", title: "Candidate Experience", desc: "Ensure a seamless, transparent journey from initial application to final offer with personalized automated updates." }
      ]}

      lifecycleTitle="Accelerate your hiring lifecycle"
      lifecycleCards={[
        { title: "Scalable Workflows", desc: "Build customized pipelines that adapt to any role complexity, scaling instantly with your growing global hiring requirements.", linkText: "Explore Automation UIs", uiType: "kanban" },
        { title: "Interviewing & Decision-Making", desc: "Collaborate on scorecards in real-time, standardize rubrics, and unify stakeholder input to execute decisive offers faster.", linkText: "Explore Scorecards", uiType: "scorecard" },
        { title: "Talent Matching", desc: "Instantly analyze pipeline profiles against open requisitions to accurately predict role compatibility and cultural fit.", linkText: "Explore Matching Engine", uiType: "match" },
        { title: "Onboarding", desc: "Automatically trigger software provisioning, compliance documentation, and orientation scheduling the moment a candidate signs.", linkText: "Explore Onboarding", uiType: "onboarding" },
        { title: "Reporting & Insights", desc: "Access granular dashboards tracking time-to-hire, pipeline drop-off rates, and sourcing origin performance natively.", linkText: "Explore Analytics", uiType: "chart" },
        { title: "Integrations", desc: "Easily sync your core HR tools, applicant tracking systems, communication stacks, and calendar systems out-of-the-box.", linkText: "Explore ATS Integrations", uiType: "nodes" }
      ]}
    />
  );
}
