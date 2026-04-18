import { UseCaseTemplate } from "@/components/landing/UseCaseTemplate";

export default function ComplianceAutomation() {
  return (
    <UseCaseTemplate 
      metaTitle="SOLUTIONS"
      heroTitle="Compliance Automation"
      heroDescription="Next-generation automation empowers you to meet regulatory standards wherever your team works, gaining a new level of operational clarity."
      accordionItems={[
        { id: "compliance", title: "Automated Auditing", desc: "Continuously scan active workloads for SOC2, HIPAA, and GDPR posture drift asynchronously." },
        { id: "track", title: "Real-time Alerts", desc: "Gain unparalleled visibility with centralized alerts that flag improper access patterns." },
        { id: "source", title: "Vendor Vetting", desc: "Automatically review external dependencies for vulnerabilities before they compile." }
      ]}
    />
  );
}
