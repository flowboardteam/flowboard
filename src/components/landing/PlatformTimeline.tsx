import { useState } from "react";

export function PlatformTimeline() {
  const [activeTab, setActiveTab] = useState(0);

  const products = [
    {
      id: "payroll",
      name: "Payroll",
      fullName: "Flowboard Payroll",
      color: "blue",
      bgColor: "bg-blue-50/80",
      borderColor: "border-blue-100/50",
      textColor: "text-blue-900",
      accentBg: "bg-blue-100",
      icon: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      stages: [
        { label: "Today", text: "Set up payroll countries and owners" },
        { label: "Hours later", text: "Configure pay rules, approvals, and cutoffs" },
        { label: "Tomorrow", text: "Everyone gets paid on time" }
      ]
    },
    {
      id: "hr",
      name: "HR",
      fullName: "Flowboard HR",
      color: "yellow",
      bgColor: "bg-[#fdf8e6]",
      borderColor: "border-[#f1e6c3]",
      textColor: "text-[#7a6a3b]",
      accentBg: "bg-[#fef3c7]",
      icon: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      stages: [
        { label: "Today", text: "Sofia is added to your HR system" },
        { label: "Hours later", text: "Assign and track onboarding tasks" },
        { label: "Tomorrow", text: "Approve and manage time off" }
      ]
    },
    {
      id: "task",
      name: "Task",
      fullName: "Flowboard Task",
      color: "purple",
      bgColor: "bg-purple-50/80",
      borderColor: "border-purple-100/50",
      textColor: "text-purple-900",
      accentBg: "bg-purple-100",
      icon: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
      stages: [
        { label: "Today", text: "Choose a laptop for Sofia" },
        { label: "Day 3", text: "Flowboard ships equipment to Spain" },
        { label: "Hours later", text: "Sofia is ready for her first day" }
      ]
    },
    {
      id: "recruit",
      name: "Recruit",
      fullName: "Flowboard Recruit",
      color: "beige",
      bgColor: "bg-[#faf7f2]/80",
      borderColor: "border-[#ede4d7]",
      textColor: "text-[#8d7962]",
      accentBg: "bg-[#f5ece0]",
      icon: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
      stages: [
        { label: "Today", text: "Decide to hire Sofia from Spain" },
        { label: "Minutes later", text: "Send Sofia a compliant local contract" },
        { label: "Same day", text: "Sofia starts onboarding in Flowboard" }
      ]
    }
  ];

  const current = products[activeTab];

  return (
    <section className="relative w-full py-24 bg-transparent z-20">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 flex flex-col items-center">
        
        <div className="flex flex-col items-center mb-12 text-center">
          <span className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-4">FLOWBOARD SPEED</span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-indigo-950">
            Accomplish more in less time
          </h2>
        </div>

        {/* Product Selector (Pill Style) */}
        <div className="flex flex-wrap justify-center p-1.5 bg-slate-50 rounded-none mb-24 border border-slate-100">
          {products.map((p, idx) => {
             const Icon = p.icon;
             const isActive = activeTab === idx;
             return (
               <button
                 key={p.id}
                 onClick={() => setActiveTab(idx)}
                 className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                   isActive 
                     ? `${p.accentBg} ${p.textColor} shadow-[0_2px_10px_rgba(0,0,0,0.05)]` 
                     : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                 }`}
               >
                 <Icon className={`w-4 h-4 ${isActive ? p.textColor : 'text-slate-400 opacity-60'}`} />
                 {p.fullName}
               </button>
             );
          })}
        </div>

        {/* Timeline Graphic Section */}
        <div className="w-full relative px-4 md:px-10 max-w-5xl">
          
          {/* Vertical Grid Line for alignment */}
          <div className="absolute top-4 left-1/2 -translate-x-[0.5px] bottom-0 w-[1px] bg-slate-100 z-0 hidden md:block"></div>

          {/* Dotted Horizontal Connector */}
          <div className="absolute top-4 left-10 right-10 h-0.5 border-t-[2.5px] border-dotted border-slate-200 z-0 hidden md:block opacity-60"></div>

          {/* Nodes */}
          <div className="flex flex-col md:flex-row justify-between relative z-10 w-full mb-10 gap-x-12">
             <div className="flex-1 flex justify-center md:flex-none">
                <div className="w-8 h-8 bg-white border-[6px] border-slate-300 rounded-full shadow-sm transition-colors duration-500" />
             </div>
             <div className="flex-1 flex justify-center md:flex-none">
                <div className="w-8 h-8 bg-white border-[6px] border-slate-300 rounded-full shadow-sm transition-colors duration-500" />
             </div>
             <div className="flex-1 flex justify-center md:flex-none">
                <div className="w-8 h-8 bg-white border-[6px] border-slate-300 rounded-full shadow-sm transition-colors duration-500" />
             </div>
          </div>

          {/* Stage Cards */}
          <div className="flex flex-col md:flex-row justify-between w-full gap-8 relative">
             {current.stages.map((stage, i) => (
                <div 
                  key={i} 
                  className="flex flex-col items-center flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                   <h3 className="text-xl font-bold text-indigo-950 mb-7 leading-none">{stage.label}</h3>
                   <div className={`${current.bgColor} ${current.borderColor} border rounded-[2.5rem] p-10 min-h-[160px] w-full flex items-center justify-center text-center transition-all duration-700 hover:shadow-lg group shadow-sm`}>
                      <p className={`text-base font-bold ${current.textColor} leading-relaxed max-w-[200px]`}>
                         {stage.text}
                      </p>
                   </div>
                </div>
             ))}
          </div>

        </div>

      </div>
    </section>
  );
}
