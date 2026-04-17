import { useState } from "react";

export function PreparedPlatform() {
  const [activeAccordion, setActiveAccordion] = useState(1);

  const accordions = [
    {
      title: "LLM Reasoning",
      desc: "Model Evaluation, Agentic Workflow, and Advanced Data Labelling for enterprise needs.",
    },
    {
      title: "Smart Recruiting",
      desc: "Streamline your hiring process with intelligent candidate matching and predictive talent analytics.",
    },
    {
      title: "Team Collaboration",
      desc: "Enhanced team workflows and communication tools integrated directly into your global talent stack.",
    },
    {
      title: "Global Compliance",
      desc: "Stay compliant across multiple jurisdictions effortlessly with automated payroll and legal safeguards.",
    }
  ];

  return (
    <section className="relative w-full py-24 z-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Accordions */}
        <div className="flex-1 w-full max-w-xl text-slate-900">
          <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4 block">WHY FLOWBOARD</span>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-[1.1] mb-6">
            Your Best Talents Work 24/7
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Build and train enterprise-level agentic AGI with our Haraka-o1 model. Replicate your best performing talents and put them on autopilot.
          </p>
          <button className="px-5 py-2.5 bg-transparent border border-slate-900 hover:bg-slate-100 text-slate-900 rounded-none font-medium text-sm mb-12 transition-colors">
            AGI Advancement
          </button>

          <div className="flex flex-col border-t border-slate-200">
            {accordions.map((item, idx) => {
              const isActive = activeAccordion === idx;
              return (
                <div key={idx} className={`border-b border-slate-200 transition-colors duration-300 ${isActive ? 'bg-slate-50' : ''}`}>
                  <button
                    onClick={() => setActiveAccordion(idx)}
                    className="w-full py-5 px-6 flex items-center justify-between text-left group"
                  >
                    <h3 className={`text-2xl font-medium transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                      {item.title}
                    </h3>
                    <span className="text-2xl font-light text-slate-400 group-hover:text-slate-600 transition-colors">
                      {isActive ? '-' : '+'}
                    </span>
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out px-6 ${isActive ? 'max-h-[200px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-slate-600 text-base leading-relaxed max-w-[90%] border-l-2 border-[#ff3b00] pl-4">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Corporate Team Image */}
        <div className="flex-1 w-full h-[500px] relative group">
          <div className="w-full h-full overflow-hidden rounded-none border border-slate-200 shadow-2xl relative">
            <img 
              src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Corporate Team Collaborating" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 to-transparent pointer-events-none"></div>
          </div>
        </div>

        </div>
    </section>
  );
}
