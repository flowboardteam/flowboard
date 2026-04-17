import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

// Asset imports (using existing paths as fallback or project convention)
import agiImg from "@/assets/agi.avif"; 
import teamImg from "@/assets/team.jpg"; 
import globalImg from "@/assets/global.jpg"; 

const capabilities = [
  {
    id: "agi",
    label: "AGI Advancement",
    subLabel: "LLM Reasoning",
    description: "Build and train enterprise-level agentic AGI with our Haraka-o1 model. Replicate your best performing talents and put them on autopilot.",
    image: agiImg,
  },
  {
    id: "recruiting",
    label: "Smart Recruiting",
    description: "Streamline your hiring process with intelligent candidate matching and predictive talent analytics.",
    image: "/images/recruiting.jpg",
  },
  {
    id: "team",
    label: "Team Collaboration",
    description: "Enhanced team workflows and communication tools integrated directly into your global talent stack.",
    image: teamImg,
  },
  {
    id: "compliance",
    label: "Global Compliance",
    description: "Stay compliant across multiple jurisdictions effortlessly with automated payroll and legal safeguards.",
    image: globalImg,
  }
];

export function WhyFlowboardSection() {
  const [activeTab, setActiveTab] = useState("recruiting");

  const activeCapability = capabilities.find(c => c.id === activeTab) || capabilities[1];

  return (
    <section id="why-flowboard" className="py-32 bg-[#fafafb] z-20 relative overflow-hidden">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none">
        <div className="h-full w-full bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Content */}
        <div className="mb-20">
          <span className="text-[11px] font-bold tracking-[0.2em] text-indigo-600 uppercase mb-4 block">WHY FLOWBOARD</span>
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-indigo-950 mb-6">
            Your Best Talents Work 24/7
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl font-medium">
            Build and train enterprise-level agentic AGI with our Haraka-o1 model. 
            Replicate your best performing talents and put them on autopilot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Accordion Column */}
          <div className="lg:col-span-7 space-y-2">
            {capabilities.map((cap) => {
              const isActive = activeTab === cap.id;
              return (
                <div 
                  key={cap.id}
                  className={`group border-b border-slate-200 transition-all duration-500 ${
                    isActive ? "bg-white shadow-xl shadow-indigo-100/50 -mx-4 px-4 py-2 border-transparent" : "py-2"
                  }`}
                >
                  <button
                    onClick={() => setActiveTab(cap.id)}
                    className="w-full flex items-center justify-between text-left py-6 focus:outline-none"
                  >
                    <div className="flex flex-col">
                      <span className={`text-2xl font-bold transition-colors duration-300 ${
                        isActive ? "text-indigo-600" : "text-indigo-950 hover:text-indigo-700"
                      }`}>
                        {cap.label}
                      </span>
                      {cap.subLabel && (
                        <span className={`text-xs font-bold uppercase tracking-widest mt-1 ${
                          isActive ? "text-indigo-400" : "text-slate-400"
                        }`}>
                          {cap.subLabel}
                        </span>
                      )}
                    </div>
                    <div className={`p-2 rounded-full transition-all duration-300 ${
                      isActive ? "bg-indigo-600 text-white rotate-0" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                    }`}>
                      {isActive ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="pb-8">
                          <p className="text-slate-600 text-[17px] leading-relaxed max-w-xl font-medium">
                            {cap.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Image Showcase Column */}
          <div className="lg:col-span-5 hidden lg:block sticky top-32">
            <div className="relative aspect-square w-full rounded-none overflow-hidden shadow-2xl border border-slate-100 bg-slate-50">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeTab}
                  src={activeCapability.image}
                  alt={activeCapability.label}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {/* Floating Badge */}
              <div className="absolute top-6 right-6 z-20">
                 <div className="bg-white/90 backdrop-blur-md px-4 py-2 border border-slate-100 shadow-lg flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-widest"> Haraka-o1 Powered </span>
                 </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 -mb-16 -ml-16 rounded-full blur-3xl" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}