import { useState } from "react";

export function PreparedHub() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { 
      num: "01", 
      category: "The Platform",
      heading: "Flowboard ATS.",
      title: "Applicant Tracking System", 
      desc: "Collects CVs, organize applications, and moves candidates through hiring stages based on your set rules. With in-built document parser, a rules engine for workflow automation, and bunch of integrations, you have all you need to find your next big talents.",
      uiImg: "/images/hub-ui.jpg",
      personImg: "/images/hub-person.jpg"
    },
    { 
      num: "02", 
      category: "Sourcing",
      heading: "Talent Cloud.",
      title: "Global Talent Network", 
      desc: "Access a pre-vetted global pool of top-tier engineering, design, and product talent. Our AI-driven match engine ensures you find the perfect fit for your specific technical stack and culture.",
      uiImg: "/images/tc-ui.jpg",
      personImg: "/images/tc-person.jpg"
    },
    { 
      num: "03", 
      category: "Execution",
      heading: "Project Manager.",
      title: "Agile Workflows", 
      desc: "Streamline your delivery with built-in agile workflows, resource allocation, and real-time progress tracking. Bridge the gap between hiring and execution with unified project oversight.",
      uiImg: "/images/pm-ui.jpg",
      personImg: "/images/pm-logo.jpg"
    },
    { 
      num: "04", 
      category: "Operations",
      heading: "Global Payroll.",
      title: "Automated Compensation", 
      desc: "Automate global compensation with support for multi-currency payments, tax compliance, and benefit management. Scale your team internationally without the administrative overhead.",
      uiImg: "/images/payroll-ui.jpg",
      personImg: "/images/payroll-person.jpg"
    }
  ];

  return (
    <section className="relative w-full py-32 z-20 hidden md:block">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative">
        
        {/* Left Side: Complex Graphic */}
        <div className="flex-1 w-full relative min-h-[500px]">
          {/* Main Map / UI Backdrop */}
          <div className="absolute top-0 left-0 w-4/5 aspect-[4/3] rounded-none overflow-hidden border border-slate-200 shadow-2xl z-10">
            <img 
              key={`ui-${activeTab}`}
              src={tabs[activeTab].uiImg} 
              alt="Flowboard Hub UI" 
              className="w-full h-full object-cover object-top animate-fade-in" 
            />
          </div>
 
          {/* Overlapping Dispatcher Image */}
          <div className="absolute -bottom-10 right-0 w-[55%] aspect-square rounded-none overflow-hidden border border-slate-200 shadow-2xl z-20">
            <img 
              key={`person-${activeTab}`}
              src={tabs[activeTab].personImg} 
              alt="Dispatcher" 
              className="w-full h-full object-cover animate-fade-in" 
            />
          </div>
        </div>

        {/* Right Side: Content & Tabs */}
        <div className="flex-1 w-full text-slate-900 flex gap-12 items-start relative z-20">
          
          {/* Vertical Tabs Tracker */}
          <div className="flex flex-col gap-12 mt-16 pt-8 pr-8 border-r border-slate-200 flex-shrink-0">
            {tabs.map((tab, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`relative flex items-center justify-center transform -rotate-90 origin-right transition-all font-sans font-bold tracking-widest text-sm
                    ${isActive ? 'text-white bg-slate-900 w-12 h-12 rounded-none shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  {tab.num}
                </button>
              );
            })}
          </div>

          {/* Text Content */}
          <div className="flex flex-col pt-8">
            <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4 block">
              {tabs[activeTab].category}
            </span>
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tight leading-[1] mb-12 text-slate-900">
              {tabs[activeTab].heading}
            </h2>

            <div className="flex flex-col mb-12 min-h-[160px] justify-center transition-all">
              <h3 className="text-2xl font-medium mb-4 text-slate-900">{tabs[activeTab].title}</h3>
              <p className="text-slate-600 text-lg leading-relaxed max-w-sm">
                {tabs[activeTab].desc}
              </p>
            </div>

            <button className="self-start px-8 py-3.5 bg-slate-900 text-white font-semibold rounded-none hover:bg-black transition-colors shadow-xl text-sm uppercase tracking-widest">
              Request Demo
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
