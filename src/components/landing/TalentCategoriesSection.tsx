import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Check,
  ArrowUpRight,
  Zap,
  CreditCard,
  Cloud,
  Search,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Configuration ---
const tabs = [
  {
    id: "recruiting",
    label: "Recruiting",
    link: "/client/signup",
    icon: Zap,
    title: "Hiring, faster than you've ever seen it.",
    description:
      "We combine expert local recruiters with AI-powered screening to deliver elite global talent, faster.",
    features: [
      {
        text: "Instant matches",
        sub: "Get candidate shortlists in days, not weeks",
      },
      {
        text: "Quality guaranteed",
        sub: "Expert recruiters review all AI submissions",
      },
      {
        text: "Hire globally",
        sub: "Tap into a curated talent pool across 100+ countries",
      },
    ],
  },
  {
    id: "payroll",
    label: "Payroll",
    link: "/client/signup",
    icon: CreditCard,
    title: "Global payroll handled in one click.",
    description:
      "Automate cross-border payments, tax compliance, and benefits for your entire international team.",
    features: [
      {
        text: "Local currency payments",
        sub: "Pay your team in their preferred local currency",
      },
      {
        text: "Automated compliance",
        sub: "Localized contracts and automatic tax filings",
      },
      {
        text: "Consolidated billing",
        sub: "One single invoice for your entire global workforce",
      },
    ],
  },
  {
    id: "talentcloud",
    label: "Talent Cloud",
    link: "/talent/signup",
    icon: Cloud,
    title: "Manage your workforce on autopilot.",
    description:
      "A unified platform to track performance, manage time-off, and scale your culture globally.",
    features: [
      {
        text: "Performance tracking",
        sub: "Monitor velocity and output in real-time",
      },
      {
        text: "Unified dashboard",
        sub: "One source of truth for all HR operations",
      },
      {
        text: "Agentic Workflows",
        sub: "AI agents that handle onboarding and offboarding",
      },
    ],
  },
  {
    id: "assistant",
    label: "AI Assistant",
    icon: MessageSquare,
    title: "Your 24/7 Agentic Workforce.",
    description:
      "Deploy custom AI agents that understand your company's context and handle complex operations autonomously.",
    features: [
      {
        text: "Haraka-o1 Reasoning",
        sub: "Advanced logic for complex decision making",
      },
      {
        text: "Context Aware",
        sub: "Trained on your specific workflows and docs",
      },
      {
        text: "Autonomous Action",
        sub: "Agents that can execute tasks, not just answer questions",
      },
    ],
  },
];

const contentVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
};

export function TalentCategoriesSection() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <section id="talent-features" className="py-24 bg-transparent">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-slate-50 border border-slate-200 rounded-none shadow-sm overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 md:px-8 py-3 text-sm font-bold transition-all rounded-none whitespace-nowrap ${
                  activeTab.id === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Container */}
        <div className="bg-slate-50/50 rounded-none border border-slate-100 overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row min-h-[580px]">
            {/* Left Column */}
            <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab.id}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="inline-flex items-center gap-2 text-blue-600 mb-6">
                    <activeTab.icon className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-widest text-xs">
                      {activeTab.label}
                    </span>
                  </div>

                  <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                    {activeTab.title}
                  </h2>

                  <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                    {activeTab.description}
                  </p>

                  <div className="space-y-5 mb-10">
                    {activeTab.features.map((feature, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="mt-1 w-5 h-5 rounded-none bg-blue-50 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-blue-600 stroke-[3px]" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {feature.text}.
                          </p>
                          <p className="text-sm text-slate-500">
                            {feature.sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 px-8 rounded-none border-slate-200 font-bold group"
                  >
                    <Link to={activeTab.link}>
                      Explore {activeTab.label}
                      <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Visual Mockups */}
            <div className="flex-1 bg-blue-50/30 relative p-8 lg:p-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full flex items-center justify-center"
                >
                  {activeTab.id === "recruiting" && <RecruitingMockup />}
                  {activeTab.id === "payroll" && <PayrollMockup />}
                  {activeTab.id === "talentcloud" && <CloudMockup />}
                  {activeTab.id === "assistant" && <AssistantMockup />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Visual Mockup Components ---

function AssistantMockup() {
  return (
    <div className="w-full max-w-[400px] bg-white rounded-none shadow-2xl border border-slate-100 flex flex-col overflow-hidden h-[400px]">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-none bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            Haraka-o1 Active
          </span>
        </div>
        <Sparkles className="w-4 h-4 text-blue-500" />
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="bg-slate-50 rounded-none rounded-none p-3 text-[11px] text-slate-600 max-w-[80%]">
          Hello! I've analyzed the Q4 payroll data. Would you like me to
          generate the compliance reports for Brazil?
        </div>
        <div className="bg-blue-600 rounded-none rounded-none p-3 text-[11px] text-white ml-auto max-w-[80%]">
          Yes, please. Also check if the new engineering hires in Poland are
          verified.
        </div>
        <div className="bg-slate-50 rounded-none rounded-none p-3 text-[11px] text-slate-600 max-w-[80%] flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-slate-300 rounded-none animate-bounce" />
            <span className="w-1 h-1 bg-slate-300 rounded-none animate-bounce delay-75" />
            <span className="w-1 h-1 bg-slate-300 rounded-none animate-bounce delay-150" />
          </div>
          Thinking...
        </div>
      </div>

      <div className="p-4 border-t border-slate-50">
        <div className="flex gap-2 items-center bg-slate-50 px-4 py-2 rounded-none border border-slate-100">
          <span className="text-[11px] text-slate-400 flex-1">
            Ask Haraka anything...
          </span>
          <Send className="w-3.5 h-3.5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

function RecruitingMockup() {
  const talents = [
    { id: 1, img: "https://i.pravatar.cc/150?u=1", flag: "🇧🇷" },
    { id: 2, img: "https://i.pravatar.cc/150?u=2", flag: "🇺🇸" },
    { id: 3, img: "https://i.pravatar.cc/150?u=3", flag: "🇨🇦" },
    { id: 4, img: "https://i.pravatar.cc/150?u=4", flag: "🇨🇭" },
    { id: 5, img: "https://i.pravatar.cc/150?u=5", flag: "🇺🇦" },
  ];

  return (
    <div className="w-full max-w-[400px] bg-white rounded-none shadow-2xl border border-slate-100 p-6 relative overflow-hidden">
      <div className="flex gap-2 mb-8 border-b border-slate-100 pb-4">
        {["Country", "Worker type", "Job title"].map((label) => (
          <div key={label} className="flex-1">
            <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              {label}
              <Search className="w-2.5 h-2.5" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-end gap-1 mb-10 h-24">
        {talents.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="w-14 h-14 rounded-none border-4 border-white shadow-lg overflow-hidden bg-slate-100">
              <img
                src={t.img}
                alt="talent"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-none shadow-sm flex items-center justify-center text-xs">
              {t.flag}
            </div>
          </motion.div>
        ))}
      </div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-none font-bold shadow-lg shadow-blue-200">
        Search
      </Button>
    </div>
  );
}

function PayrollMockup() {
  return (
    <div className="w-full max-w-sm bg-white rounded-none shadow-xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-bold text-slate-900">Upcoming Payments</p>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-none">
          Syncing
        </span>
      </div>
      <div className="space-y-3">
        {[
          { n: "Mateo Garcia", a: "$4,200", c: "USD" },
          { n: "Aisha Rahman", a: "$3,850", c: "GBP" },
        ].map((p) => (
          <div
            key={p.n}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-none border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-blue-100" />
              <span className="text-xs font-bold text-slate-700">{p.n}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-blue-600">{p.a}</p>
              <p className="text-[9px] text-slate-400 font-bold">{p.c}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CloudMockup() {
  return (
    <div className="w-full max-w-sm bg-white rounded-none shadow-xl border border-slate-100 p-6">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-slate-50 rounded-none border border-slate-100">
          <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">
            Velocity
          </p>
          <p className="text-xl font-bold text-slate-900">+15%</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-none border border-slate-100">
          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">
            Status
          </p>
          <p className="text-xl font-bold text-slate-900">Stable</p>
        </div>
      </div>
      <div className="p-5 bg-blue-600 rounded-none text-white">
        <p className="text-[10px] font-bold uppercase opacity-80 mb-3">
          Model Accuracy
        </p>
        <div className="h-1.5 w-full bg-white/20 rounded-none overflow-hidden mb-2">
          <div className="h-full w-[88%] bg-white" />
        </div>
        <div className="flex justify-between text-[10px] font-bold">
          <span>98.2% Efficiency</span>
          <span>Haraka-o1</span>
        </div>
      </div>
    </div>
  );
}
