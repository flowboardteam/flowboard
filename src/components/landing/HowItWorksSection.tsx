import { Brain, Users, Rocket, GraduationCap, Clock } from "lucide-react";
import { motion, Variants } from "framer-motion";

// --- Configuration ---
const cycleSteps = [
  {
    step: 1,
    label: "Talent Needs Defined",
    icon: Users,
    description: "Your hiring criteria and project scope are digitized.",
    color: "text-blue-600",
  },
  {
    step: 2,
    label: "AI Smart Matching",
    icon: Brain,
    description: "Predictive AI scans global talent pools for the top 1%.",
    color: "text-blue-600",
  },
  {
    step: 3,
    label: "Rapid Deployment",
    icon: Rocket,
    description: "Matched talent is onboarded and integrated in 48 hours.",
    color: "text-blue-600",
  },
  {
    step: 4,
    label: "Talent Experience Management",
    icon: GraduationCap,
    description: "On-the-job training, skills validation through continuous technical assessment.",
    color: "text-blue-600",
  },
];

const positions: Record<number, string> = {
  1: "top-0 left-1/2 -translate-x-1/2",
  2: "right-0 top-1/2 -translate-y-1/2",
  3: "bottom-0 left-1/2 -translate-x-1/2",
  4: "left-0 top-1/2 -translate-y-1/2",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 relative overflow-hidden bg-white hidden lg:block"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
            The Flowboard Process
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900 tracking-tight">
            The Adaptive Talent <span className="text-blue-600">Lifecycle</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Our continuous loop of matching, training, and deployment ensures your team always has the perfectly skilled talent—no manual hiring required.
          </p>
        </motion.div>

        {/* --- Diagram & Explainer Grid --- */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: The Central Diagram (STAYS WITH NUMBERS) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={containerVariants}
            className="relative mx-auto w-full max-w-[450px] aspect-square"
          >
            {/* Pulsating Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-none border border-blue-100 shadow-inner"
            />
            
            {/* Center Core */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-1/4 rounded-none bg-blue-50/50 border border-blue-100 backdrop-blur-sm flex flex-col items-center justify-center text-center shadow-xl p-4"
            >
              <Brain className="w-10 h-10 text-blue-600 mb-2" />
              <p className="text-lg font-bold text-slate-900 leading-tight">
                Flowboard AI
              </p>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Intelligent Core
              </p>
            </motion.div>

            {/* Orbiting Nodes (Maintaining Number Badges) */}
            {cycleSteps.map((node) => (
              <motion.div
                key={node.step}
                variants={itemVariants}
                className={`absolute ${positions[node.step]} flex flex-col items-center w-32`}
                style={{ zIndex: 10 }}
              >
                <div className="w-16 h-16 rounded-none bg-white border-2 border-blue-100 flex items-center justify-center shadow-md transition-all duration-300 hover:border-blue-400 hover:scale-110">
                  <node.icon className="w-7 h-7 text-blue-600" />
                </div>
                {/* Number Badge stays here */}
                <div className="absolute -top-1 -left-1 w-6 h-6 rounded-none bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                    {node.step}
                </div>
                <span className="mt-3 text-sm font-bold text-slate-700 text-center">
                  {node.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Right Column: Steps Explainer (NUMBERS REMOVED) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={containerVariants}
            className="space-y-8 lg:space-y-10 lg:pl-10"
          >
            {cycleSteps.map((step, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="flex items-start space-x-6 group"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-none bg-blue-50 border border-blue-100 flex items-center justify-center transition-all duration-300 group-hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-200">
                  <step.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {step.label}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {/* Bottom Loop State */}
            <motion.div 
                variants={itemVariants}
                className="flex items-start space-x-6 mt-10 border-t pt-8 border-slate-100"
            >
                <div className="flex-shrink-0 w-14 h-14 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Continuous Loop</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">The cycle iterates to scale teams and refine talent matching over time automatically.</p>
                </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}