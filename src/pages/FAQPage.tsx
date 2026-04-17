import { useState } from "react";
import { LegalLayout } from "@/components/landing/LegalLayout";
import { ChevronDown, RefreshCw, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  {
    label: "General",
    items: [
      {
        q: "What does Flowboard Team do?",
        a: "We help companies hire pre-vetted global talent across engineering, data, product, and business roles. We handle sourcing, screening, placement, and ongoing talent administration — so you can focus on building.",
      },
      {
        q: "How fast can I hire?",
        a: "Typically within 48 hours to 7 days, depending on role complexity. Simple roles with clear requirements are placed fastest. We'll give you a realistic timeline upfront after understanding your needs.",
      },
      {
        q: "Where are your talents based?",
        a: "Primarily from emerging markets, especially Africa, with strong English proficiency and remote readiness. Our talent network spans professionals with international experience across software engineering, design, product, and operations.",
      },
      {
        q: "Is there a minimum commitment?",
        a: "No strict minimum. We offer flexible engagement terms including hourly, part-time, full-time, and project-based. We'll structure the engagement to fit your business needs.",
      },
      {
        q: "How do I get started?",
        a: "Simply request a free quote or book a discovery call. We'll understand your requirements and match you with the right talent — usually within 48–72 hours.",
      },
    ],
  },
  {
    label: "Talent & Vetting",
    items: [
      {
        q: "Are your talents vetted?",
        a: "Yes. All talents go through a rigorous process including skills screening, structured interviews, background verification, and proficiency assessments before joining our network. Only the top candidates make it through.",
      },
      {
        q: "Can I hire full-time talent?",
        a: "Yes. You can hire talent on a full-time, part-time, or contract basis. We support all engagement types and handle the administrative overhead so you don't have to.",
      },
      {
        q: "What if I'm not satisfied with a hire?",
        a: "We offer replacement options within the agreed guarantee period. Our team will work closely with you to understand what went wrong and find the right fit as quickly as possible.",
      },
    ],
  },
  {
    label: "Pricing & Billing",
    items: [
      {
        q: "How much does it cost?",
        a: "We offer flexible pricing models including hourly, monthly retainer, and placement-based pricing depending on your needs and the engagement type. Contact us for a personalised quote.",
      },
      {
        q: "Do you handle payroll and contracts?",
        a: "Yes. We manage contracts, payments, compliance, and talent administration end-to-end. You get one invoice from us and we handle everything on the talent side.",
      },
    ],
  },
];

// ─── Refund Policy ────────────────────────────────────────────────────────────
const REFUND_SECTIONS = [
  {
    icon: CheckCircle2,
    color: "blue",
    title: "Placement Services",
    items: [
      "No refunds are issued after a successful placement",
      "If a talent leaves within the agreed guarantee period (if applicable), a replacement will be provided at no additional cost",
    ],
  },
  {
    icon: RefreshCw,
    color: "amber",
    title: "Subscription / Ongoing Services",
    items: [
      "Payments made for active billing cycles are non-refundable",
      "Clients may cancel future billing with prior written notice",
    ],
  },
  {
    icon: AlertCircle,
    color: "emerald",
    title: "Unsatisfactory Service",
    items: [
      "Clients must report issues within a reasonable timeframe",
      "Flowboard will investigate and may offer: replacement talent, service credits, or partial refund on a case-by-case basis",
    ],
  },
  {
    icon: CreditCard,
    color: "red",
    title: "No Refund Cases",
    items: [
      "Change of business needs after placement",
      "Delays caused by the client (e.g., unclear requirements, unresponsiveness)",
      "Misuse of services or platform",
      "Failure to provide clear hiring requirements",
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string; dot: string }> = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-950/30",    border: "border-blue-200 dark:border-blue-900",    icon: "text-blue-600",    dot: "bg-blue-600"    },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/30",  border: "border-amber-200 dark:border-amber-900",  icon: "text-amber-600",   dot: "bg-amber-500"   },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30",border: "border-emerald-200 dark:border-emerald-900",icon: "text-emerald-600",dot: "bg-emerald-500"},
  red:     { bg: "bg-red-50 dark:bg-red-950/30",      border: "border-red-200 dark:border-red-900",      icon: "text-red-500",     dot: "bg-red-500"     },
};

// ─── Accordion Item ───────────────────────────────────────────────────────────
function AccordionItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden transition-all ${open ? "bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900" : "bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700"}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="flex items-start gap-4 min-w-0">
          <span className="text-[10px] font-black text-blue-600 tabular-nums pt-0.5 shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white leading-snug">{q}</span>
        </div>
        <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 transition-all ${open ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="px-6 pb-5 pl-[3.75rem]">
          <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("General");

  const activeItems = FAQ_CATEGORIES.find(c => c.label === activeCategory)?.items ?? [];

  return (
    <>
      <title>FAQ & Refund Policy – Flowboard Team</title>
      <meta name="description" content="Frequently asked questions and refund policy for Flowboard Team's talent sourcing and placement services." />

      <LegalLayout
        badge="Help Center"
        title="FAQ & Refund Policy"
        subtitle="Everything you need to know about working with Flowboard — from hiring timelines to billing and refunds."
        lastUpdated="January 2025"
      >
        {/* ── FAQ Section ── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Frequently Asked Questions</h2>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-none text-xs font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat.label
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {cat.label}
                <span className="ml-2 opacity-60">{FAQ_CATEGORIES.find(c => c.label === cat.label)?.items.length}</span>
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {activeItems.map((item, i) => (
              <AccordionItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mb-20" />

        {/* ── Refund Policy Section ── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Refund Policy</h2>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          </div>

          <p className="text-base font-medium text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-10">
            At Flowboard Team, we are committed to delivering high-quality talent and services. Refunds are handled under the following conditions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {REFUND_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const colors = COLOR_MAP[sec.color];
              return (
                <div key={sec.title} className={`p-6 rounded-none border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">{sec.title}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {sec.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-2 w-1.5 h-1.5 rounded-none shrink-0 ${colors.dot}`} />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact CTA */}
        <div className="mt-20 p-8 rounded-none bg-blue-600 text-center text-white">
          <h3 className="text-2xl font-extrabold tracking-tight mb-3">Still have questions?</h3>
          <p className="text-blue-200 font-medium mb-6">
            Our team responds to all inquiries within one business day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:info@flowboard.team"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-black text-sm uppercase tracking-widest px-6 py-3 rounded-none hover:bg-blue-50 transition-colors">
              Email us
            </a>
            {/* <a href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-black text-sm uppercase tracking-widest px-6 py-3 rounded-none hover:bg-white/20 transition-colors border border-white/20">
              Book a call
            </a> */}
          </div>
        </div>
      </LegalLayout>
    </>
  );
}