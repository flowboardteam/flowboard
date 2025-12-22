import { Shield, Zap, Globe, Sparkles } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Pre-Vetted Talent",
    description:
      "Every professional is rigorously assessed for technical depth, communication skills, and reliability before joining FlowBoard.",
  },
  {
    icon: Zap,
    title: "Faster Hiring",
    description:
      "Get matched with qualified talent in as little as 48 hours — without endless screening or interviews.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Hire top engineers and business professionals from emerging and established markets worldwide.",
  },
  {
    icon: Sparkles,
    title: "AI-Driven Matching",
    description:
      "Our AI evaluates skills, experience, and team fit to connect you with the right talent — faster and smarter.",
  },
];

export function WhyFlowboardSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob blob-1 w-72 h-72 top-20 -left-32" />
      <div className="blob blob-2 w-72 h-72 bottom-20 -right-32 animation-delay-2000" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Why FlowBoard
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Hiring made{" "}
            <span className="gradient-text">simple, fast & reliable</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            FlowBoard is an AI-powered talent platform that helps companies hire, manage, and scale elite global teams — faster and smarter.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="
                group
                relative
                rounded-2xl
                border
                border-border
                bg-background
                p-6
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
              "
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Category label (like Andela) */}
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Flowboard
              </span>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-3 leading-snug">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Icon (subtle, bottom-right like Andela cards) */}
              <div className="absolute bottom-5 right-5 opacity-10 group-hover:opacity-20 transition-opacity">
                <feature.icon className="w-12 h-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
