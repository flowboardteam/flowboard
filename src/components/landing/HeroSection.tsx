import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  FileUp,
  Sparkles,
  Rocket,
  Globe,
  Zap,
} from "lucide-react";
import Typewriter from "typewriter-effect";
import { motion } from "framer-motion";

import dashboardImg from "@/assets/dashboard.png";

export function HeroSection() {
  return (
    // ADJUSTED: Changed pt-28 to pt-40 (mobile) and lg:pt-48 (desktop)
    <section className="relative w-full min-h-screen overflow-hidden pt-40 lg:pt-48 pb-32 font-sans">
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 -z-10 bg-white">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, #050B1E 0%, #0B2A52 40%, #3b82f6 85%)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white via-white/80 to-transparent" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px] opacity-20" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-16">
        {/* -------- LEFT COLUMN -------- */}
        <div className="flex-1 text-center lg:text-left text-white max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-600/20 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-sm mb-8 shadow-lg"
          >
            <Zap className="w-3 h-3 fill-white" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-blue-200">
              AI-Powered Recruiting/Staffing Platform
            </span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            <span className="text-blue-400 block h-[1.2em]">
              <Typewriter
                options={{
                  strings: ["Recruit", "Pay", "Manage"],
                  autoStart: true,
                  loop: true,
                  deleteSpeed: 50,
                }}
              />
            </span>
            <span>pre-vetted global talents</span>
          </h1>

          <div className="flex flex-nowrap lg:justify-start justify-center items-center gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { label: "Upload CV", icon: FileUp },
              { label: "Instant Feedback", icon: Sparkles },
              { label: "Test Projects", icon: Rocket },
              { label: "Get Hired", icon: Globe },
            ].map((step, i, arr) => (
              <div
                key={step.label}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
                  <step.icon className="w-4 h-4 text-blue-400" />
                  {step.label}
                </div>
                {i !== arr.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-white/30 hidden md:block" />
                )}
              </div>
            ))}
          </div>

          <p className="text-lg text-blue-100/80 max-w-2xl mb-10 font-medium mx-auto lg:mx-0">
            Custom-engineered talent hiring and management platform to deliver
            enterprise-level projects at scale — powered by advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a
              href="https://cal.com/flowboard/demo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-blue-600 hover:bg-blue-700 h-14 px-12 rounded-xl font-bold shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                Schedule a Demo
              </Button>
            </a>
            <Button
              variant="outline"
              className="h-14 px-10 rounded-xl bg-white/5 text-white border-white/20 hover:bg-white/10 backdrop-blur-sm"
            >
              <Play className="w-4 h-4 mr-2 fill-white" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* -------- RIGHT COLUMN -------- */}
        <div className="hidden lg:block flex-1 w-full max-w-2xl relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="p-2 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden">
              <img
                src={dashboardImg}
                alt="FlowBoard dashboard"
                className="rounded-[2rem] w-full h-auto"
              />
            </div>
            <div className="absolute -top-6 -right-6 w-48 h-48 bg-blue-500/40 blur-[80px] -z-10" />
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-indigo-500/40 blur-[80px] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
