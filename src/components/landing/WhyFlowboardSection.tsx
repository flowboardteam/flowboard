import { Brain, Users, Rocket, GraduationCap, Clock, CheckCircle2 } from "lucide-react";
import { motion, Variants } from "framer-motion";

// 1. IMPORT LOCAL ASSETS CORRECTLY
// This tells Vite/React to process the file and provide a valid URL
import agiImg from "@/assets/agi.avif"; 
import teamImg from "@/assets/team.jpg"; 
import globalImg from "@/assets/global.jpg"; 

// --- Configuration ---
const cycleSteps = [
  {
    step: 1,
    label: "AGI Advancement",
    icon: Brain,
    description: "LLM Reasoning, Model Evaluation, Agentic Workflow, and Advanced Data Labelling for enterprise needs.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    image: agiImg, // Use the variable directly (no quotes)
  },
  {
    step: 2,
    label: "Smart Recruiting",
    icon: Users,
    description: "Streamline your hiring process with intelligent candidate matching and predictive talent analytics.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800",
  },
  {
    step: 3,
    label: "Team Collaboration",
    icon: GraduationCap,
    description: "Enhanced team workflows and communication tools integrated directly into your global talent stack.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    image: teamImg,
  },
  {
    step: 4,
    label: "Global Compliance",
    icon: Rocket,
    description: "Stay compliant across multiple jurisdictions effortlessly with automated payroll and legal safeguards.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    image: globalImg,
  },
];

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1]
    } 
  },
};

export function WhyFlowboardSection() {
  return (
    <section id="why-flowboard" className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-4">
        
        {/* Header Content */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1 rounded-full border border-blue-100 mb-6"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Why Flowboard</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            Your Best Talents Work 24/7
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 leading-relaxed"
          >
            Build and train enterprise-level agentic AGI with our Haraka-o1 model. 
            Replicate your best performing talents and put them on autopilot.
          </motion.p>
        </div>

        {/* The Card Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {cycleSteps.map((step) => (
            <motion.div
              key={step.step}
              variants={cardVariants}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col group"
            >
              {/* Image Container */}
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={step.image} // Corrected: Using curly braces to reference the variable
                  alt={step.label} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <div className={`${step.bgColor} p-2 rounded-lg backdrop-blur-md border border-white/20 shadow-sm`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  {step.label}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {step.description}
                </p>
                
                {/* Visual Indicator */}
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Capability 0{step.step}</span>
                   <CheckCircle2 className="w-4 h-4 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Accent */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-6 py-2 rounded-full">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700 tracking-tight">Enterprise velocity at startup scale</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}