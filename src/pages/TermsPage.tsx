import { LegalLayout } from "@/components/landing/LegalLayout";
import { Shield, Users, CreditCard, Lock, FileText, AlertTriangle, Scale, XCircle } from "lucide-react";

const sections = [
  {
    icon: FileText,
    number: "01",
    title: "Introduction",
    content: [
      {
        text: "These Terms and Conditions (\"Terms\") govern your use of Flowboard Team's platform, services, and website. By accessing or using our services, you agree to be bound by these Terms.",
      },
      {
        text: "Flowboard Team provides talent sourcing, screening, placement, and management services for companies, as well as onboarding and support services for independent professionals (\"Talents\").",
      },
    ],
  },
  {
    icon: Shield,
    number: "02",
    title: "Services Provided",
    content: [
      {
        text: "Flowboard Team offers a comprehensive suite of workforce solutions:",
      },
    ],
    bullets: [
      "Talent sourcing and recruitment services",
      "Talent verification and screening",
      "Talent placement and management",
      "Payroll and contractor support services",
      "Access to pre-vetted global professionals",
    ],
    note: "Flowboard acts as an intermediary between clients and independent talents and does not act as the direct employer unless explicitly stated.",
  },
  {
    icon: Users,
    number: "03",
    title: "Client Responsibilities",
    content: [{ text: "Clients agree to uphold the following responsibilities when using Flowboard's platform:" }],
    bullets: [
      "Provide accurate job descriptions and hiring requirements",
      "Conduct fair and lawful hiring practices",
      "Make payments according to agreed terms",
      "Respect confidentiality and intellectual property rights",
      "Not bypass Flowboard to engage talents directly outside agreed terms",
    ],
  },
  {
    icon: Users,
    number: "04",
    title: "Talent Responsibilities",
    content: [{ text: "Talents agree to maintain the following standards throughout their engagement:" }],
    bullets: [
      "Provide accurate personal and professional information",
      "Deliver work to agreed standards and timelines",
      "Maintain professionalism and confidentiality",
      "Comply with client requirements and contractual obligations",
    ],
  },
  {
    icon: CreditCard,
    number: "05",
    title: "Fees and Payments",
    content: [{ text: "All financial arrangements are governed by the following terms:" }],
    bullets: [
      "Clients agree to pay all fees associated with talent placement and services",
      "Payment terms (hourly, monthly, or per placement) will be defined in individual agreements",
      "Late payments may attract penalties or suspension of services",
    ],
  },
  {
    icon: AlertTriangle,
    number: "06",
    title: "Non-Circumvention",
    content: [
      {
        text: "Clients agree not to directly hire or engage Flowboard talents outside the platform without prior written consent. A buyout or conversion fee may apply for any direct engagement outside agreed terms.",
      },
    ],
  },
  {
    icon: Lock,
    number: "07",
    title: "Confidentiality",
    content: [
      {
        text: "Both clients and talents agree to keep confidential any proprietary or sensitive information shared during engagement. This obligation survives the termination of any service agreement.",
      },
    ],
  },
  {
    icon: FileText,
    number: "08",
    title: "Intellectual Property",
    content: [
      {
        text: "All work created by talents for clients belongs to the client upon full payment, unless otherwise agreed in writing. Flowboard retains no rights to deliverables created under client engagements.",
      },
    ],
  },
  {
    icon: Scale,
    number: "09",
    title: "Limitation of Liability",
    content: [{ text: "Flowboard Team is not liable for the following:" }],
    bullets: [
      "Any indirect or consequential damages",
      "Performance issues beyond reasonable control",
      "Disputes arising directly between client and talent",
    ],
  },
  {
    icon: XCircle,
    number: "10",
    title: "Termination",
    content: [{ text: "Flowboard reserves the right to suspend or terminate accounts for:" }],
    bullets: [
      "Breach of terms",
      "Non-payment",
      "Misconduct",
    ],
  },
  {
    icon: Scale,
    number: "11",
    title: "Governing Law",
    content: [
      {
        text: "These Terms shall be governed by applicable international commercial laws and relevant jurisdiction based on service agreements.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <title>Terms & Conditions – Flowboard Team</title>
      <meta name="description" content="Read Flowboard Team's terms and conditions governing the use of our talent sourcing and placement platform." />

      <LegalLayout
        badge="Legal"
        title="Terms & Conditions"
        subtitle="Please read these terms carefully before using Flowboard's platform and services. Your use of our services constitutes acceptance of these terms."
        lastUpdated="January 2025"
      >
        {/* TOC */}
        <div className="mb-14 p-6 rounded-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Contents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((s) => (
              <a key={s.number} href={`#section-${s.number}`}
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
              <section key={s.number} id={`section-${s.number}`} className="scroll-mt-28">
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
                  {s.content.map((c, ci) => (
                    <p key={ci} className="text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{c.text}</p>
                  ))}

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

                  {s.note && (
                    <div className="mt-4 p-4 rounded-none bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-400 leading-relaxed">{s.note}</p>
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

        {/* CTA */}
        <div className="mt-20 p-8 rounded-none bg-blue-600 text-white text-center">
          <h3 className="text-2xl font-extrabold tracking-tight mb-3">Questions about our terms?</h3>
          <p className="text-blue-200 font-medium mb-6">Our team is here to help clarify anything you need to know.</p>
          <a href="mailto:info@flowboard.team"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-black text-sm uppercase tracking-widest px-6 py-3 rounded-none hover:bg-blue-50 transition-colors">
            Contact us
          </a>
        </div>
      </LegalLayout>
    </>
  );
}