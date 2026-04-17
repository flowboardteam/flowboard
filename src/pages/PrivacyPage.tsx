import { LegalLayout } from "@/components/landing/LegalLayout";
import { Eye, Database, Share2, Shield, Clock, UserCheck, Globe, Info } from "lucide-react";

const sections = [
  {
    icon: Info,
    number: "01",
    title: "Introduction",
    content: "Flowboard Team is committed to protecting your privacy and handling your data responsibly. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform and services.",
  },
  {
    icon: Database,
    number: "02",
    title: "Information We Collect",
    content: "We may collect the following types of information when you use Flowboard:",
    bullets: [
      "Personal details — name, email address, phone number",
      "Professional data — resume, skills, work experience, portfolio",
      "Company information — for clients onboarding to the platform",
      "Payment and billing details — processed securely via our payment partners",
      "Usage data — how you interact with our platform and services",
    ],
  },
  {
    icon: Eye,
    number: "03",
    title: "How We Use Information",
    content: "Your data is used strictly to deliver and improve our services. We use it to:",
    bullets: [
      "Provide and continuously improve our talent services",
      "Match talents with relevant job opportunities",
      "Process payments and manage billing",
      "Communicate updates, opportunities, and service information",
      "Ensure platform compliance, safety, and security",
    ],
  },
  {
    icon: Share2,
    number: "04",
    title: "Data Sharing",
    content: "We may share your data with specific parties under these circumstances:",
    bullets: [
      "Clients — for hiring and talent evaluation purposes",
      "Talents — for work collaboration and onboarding",
      "Service providers — including payment processors and infrastructure partners",
    ],
    highlight: {
      type: "positive",
      text: "We do not sell your personal data to third parties — ever.",
    },
  },
  {
    icon: Shield,
    number: "05",
    title: "Data Security",
    content: "We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or misuse. Our security practices include encryption at rest and in transit, access controls, and regular security audits.",
  },
  {
    icon: Clock,
    number: "06",
    title: "Data Retention",
    content: "We retain your personal data only as long as necessary to deliver our services and meet our legal obligations. When data is no longer required, it is securely deleted or anonymized.",
  },
  {
    icon: UserCheck,
    number: "07",
    title: "Your Rights",
    content: "As a user of Flowboard, you have the following rights regarding your personal data:",
    bullets: [
      "Request access to the data we hold about you",
      "Request correction of inaccurate or incomplete data",
      "Request deletion of your data (subject to legal requirements)",
      "Withdraw consent at any time where consent is the basis for processing",
    ],
  },
  {
    icon: Globe,
    number: "08",
    title: "International Data Transfers",
    content: "Your data may be processed in different countries to support Flowboard's global operations. We ensure appropriate safeguards are in place for all international transfers in compliance with applicable data protection laws.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <title>Privacy Policy – Flowboard Team</title>
      <meta name="description" content="Learn how Flowboard Team collects, uses, and protects your personal data." />

      <LegalLayout
        badge="Privacy"
        title="Privacy Policy"
        subtitle="Your privacy matters to us. This policy explains how we handle your personal information with transparency and care."
        lastUpdated="January 2025"
      >
        {/* Commitment strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {[
            { icon: Shield, label: "Industry-standard encryption", desc: "Data secured at rest and in transit" },
            { icon: UserCheck, label: "You control your data", desc: "Request access, edits, or deletion" },
            { icon: Share2, label: "We never sell your data", desc: "Your data is not a product" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col gap-3 p-5 rounded-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-none bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOC */}
        <div className="mb-14 p-6 rounded-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Contents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((s) => (
              <a key={s.number} href={`#privacy-${s.number}`}
                className="flex items-center gap-3 group">
                <span className="text-[10px] font-black text-blue-600 tabular-nums w-6">{s.number}</span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{s.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-14">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <section key={s.number} id={`privacy-${s.number}`} className="scroll-mt-28">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-11 h-11 rounded-none bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.number}</span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{s.title}</h2>
                  </div>
                </div>

                <div className="pl-16 space-y-4">
                  <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{s.content}</p>

                  {s.bullets && (
                    <ul className="space-y-2.5 mt-4">
                      {s.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-3">
                          <span className="mt-2 w-1.5 h-1.5 rounded-none bg-blue-600 shrink-0" />
                          <span className="text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {s.highlight && (
                    <div className={`mt-4 p-4 rounded-none flex items-start gap-3 ${
                      s.highlight.type === "positive"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900"
                        : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900"
                    }`}>
                      <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${s.highlight.type === "positive" ? "text-emerald-600" : "text-amber-600"}`} />
                      <p className={`text-sm font-bold leading-relaxed ${s.highlight.type === "positive" ? "text-emerald-800 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"}`}>
                        {s.highlight.text}
                      </p>
                    </div>
                  )}
                </div>

                {i < sections.length - 1 && (
                  <div className="mt-14 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                )}
              </section>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 p-8 rounded-none bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
          <div className="w-12 h-12 rounded-none bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight mb-3">Questions about your data?</h3>
          <p className="text-slate-400 font-medium mb-6">Contact our privacy team and we'll respond within 48 hours.</p>
          <a href="mailto:info@flowboard.team"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-black text-sm uppercase tracking-widest px-6 py-3 rounded-none hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30">
            info@flowboard.team
          </a>
        </div>
      </LegalLayout>
    </>
  );
}