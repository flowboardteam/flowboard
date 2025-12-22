import { Brain, Users, Rocket, GraduationCap, Clock } from "lucide-react";
import { motion } from "framer-motion";

// --- Configuration ---
const cycleSteps = [
  {
    step: 1,
    label: "Talent Needs Defined",
    icon: Users,
    description: "Your hiring criteria and project scope are digitized.",
    color: "text-red-500", // Pink/Red hue
  },
  {
    step: 2,
    label: "AI Smart Matching",
    icon: Brain,
    description: "Predictive AI scans global talent pools for the top 1%.",
    color: "text-blue-500", // Blue hue
  },
  {
    step: 3,
    label: "Vetting & Training",
    icon: GraduationCap,
    description: "Skills are validated through continuous technical assessment.",
    color: "text-green-500", // Green/Teal hue
  },
  {
    step: 4,
    label: "Rapid Deployment",
    icon: Rocket,
    description: "Matched talent is onboarded and integrated in 48 hours.",
    color: "text-purple-500", // Violet hue
  },
];

// Map positions to Tailwind classes for the circular layout
const positions: Record<number, string> = {
  1: "top-0 left-1/2 -translate-x-1/2", // Top
  2: "right-0 top-1/2 -translate-y-1/2", // Right
  3: "bottom-0 left-1/2 -translate-x-1/2", // Bottom
  4: "left-0 top-1/2 -translate-y-1/2", // Left
};

// Animation variants for staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 relative overflow-hidden bg-background"
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
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            The Flowboard Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            The Adaptive Talent <span className="gradient-text">Lifecycle</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our continuous loop of matching, training, and deployment ensures your team always has the perfectly skilled talent—no manual hiring required.
          </p>
        </motion.div>

        {/* --- Diagram & Explainer Grid --- */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: The Central Diagram (Responsive Circle) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={containerVariants}
            className="relative mx-auto w-full max-w-[450px] aspect-square hidden lg:block" // Hidden on small screens, shown on large
          >
            {/* Pulsating Outer Ring (Subtle animation) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-primary/30 shadow-inner shadow-primary/20"
            />
            
            {/* Center Core */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-1/4 rounded-full bg-primary/10 border border-primary/50 backdrop-blur-sm flex flex-col items-center justify-center text-center shadow-2xl p-4"
            >
              <Brain className="w-10 h-10 text-primary mb-2" />
              <p className="text-lg font-extrabold text-primary leading-tight">
                Flowboard AI
              </p>
              <p className="text-xs text-muted-foreground">
                Intelligent Core
              </p>
            </motion.div>

            {/* Orbiting Nodes */}
            {cycleSteps.map((node) => (
              <motion.div
                key={node.step}
                variants={itemVariants}
                className={`absolute ${positions[node.step]} flex flex-col items-center w-32`}
                style={{ zIndex: 10 }}
              >
                {/* Node Icon Circle */}
                <div className={`w-16 h-16 rounded-full bg-card border-2 border-primary/50 flex items-center justify-center shadow-lg transition-colors duration-300 hover:bg-primary/10 ${node.color}`}>
                  <node.icon className={`w-7 h-7 ${node.color}`} />
                </div>
                {/* Step Number Badge */}
                <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full bg-primary text-xs font-bold text-white flex items-center justify-center border-2 border-background`}>
                    {node.step}
                </div>
                <span className="mt-3 text-sm font-semibold text-foreground text-center">
                  {node.label}
                </span>
              </motion.div>
            ))}
            
            {/* Loop Arrow (Requires custom CSS/SVG path) */}
            <div className="absolute inset-0 z-0">
                {/* Placeholder for a visually interesting SVG arrow or rotating glow */}
            </div>

          </motion.div>
          
          {/* Right Column: Steps Explainer (Visible on all screens) */}
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
                className="flex items-start space-x-4 group"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-card border-2 border-primary/50 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 ${step.color}`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xl font-extrabold ${step.color}`}>{`0${step.step}`}</span>
                    <h3 className="text-xl font-bold text-foreground">{step.label}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
            
            {/* Added Final State for Completion */}
            <motion.div 
                variants={itemVariants}
                className="flex items-start space-x-4 opacity-70 mt-10 border-t pt-6 border-border/50"
            >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 border-2 border-primary/50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary">Continuous Loop</h3>
                    <p className="text-muted-foreground">The cycle continuously iterates to scale teams, measure velocity, and refine talent matching over time.</p>
                </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}