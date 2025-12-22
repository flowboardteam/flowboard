import {
  Code,
  Palette,
  Brain,
  Smartphone,
  Megaphone,
  Headphones,
  BarChart3,
  Briefcase,
} from "lucide-react";

const categories = [
  {
    icon: Code,
    title: "Software Engineers",
    count: "3,500+",
    description: "Frontend, backend, full-stack, DevOps",
  },
  {
    icon: Brain,
    title: "Data & AI Engineers",
    count: "1,200+",
    description: "Machine learning, data, automation",
  },
  {
    icon: Smartphone,
    title: "Mobile Developers",
    count: "1,100+",
    description: "iOS, Android, cross-platform",
  },
  {
    icon: Palette,
    title: "Product Designers",
    count: "1,200+",
    description: "UI/UX, product, brand design",
  },
  {
    icon: Megaphone,
    title: "Growth & Marketing",
    count: "950+",
    description: "Performance, content, acquisition",
  },
  {
    icon: Briefcase,
    title: "Business & Operations",
    count: "1,400+",
    description: "Operations, project & program roles",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    count: "2,100+",
    description: "CX, support, virtual assistants",
  },
  {
    icon: BarChart3,
    title: "Business Analysts",
    count: "800+",
    description: "Analytics, insights, reporting",
  },
];

export function TalentCategoriesSection() {
  return (
    <section id="talent" className="section-padding bg-muted/30">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Teams & Roles
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 tracking-tight">
            Build complete <span className="text-primary">remote teams</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From engineering to operations, FlowBoard helps companies hire
            reliable talent across technical and business functions.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group rounded-2xl bg-white border border-border p-6 shadow-sm
                         hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon badge */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2 tracking-tight">
                {category.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4">
                {category.description}
              </p>

              <p className="text-2xl font-semibold text-primary">
                {category.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
