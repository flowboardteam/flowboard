import { useState } from "react";
import { PreparedNavbar } from "./PreparedNavbar";
import { PreparedFooter } from "./PreparedFooter";
import { Link } from "react-router-dom";
import { ShieldCheck, Workflow, BarChart3, Users2, CheckCircle2, ArrowRight } from "lucide-react";

interface AccordionItem {
  title: string;
  desc: string;
  id: string; // Used to identify which graphic to show
}

interface UseCaseTemplateProps {
  metaTitle: string;
  heroTitle: string;
  heroDescription: string;
  accordionItems: AccordionItem[];
  comparisonOldTitle?: string;
  comparisonNewTitle?: string;
}

export function UseCaseTemplate({ 
  metaTitle, 
  heroTitle, 
  heroDescription, 
  accordionItems,
  comparisonOldTitle = "The old way",
  comparisonNewTitle = "The Flowboard way"
}: UseCaseTemplateProps) {
  const [activeAccordion, setActiveAccordion] = useState(accordionItems[0]?.id || "item-1");

  // Renders distinct, hand-coded SVG wireframes based on the active accordion item
  const renderInteractiveGraphic = () => {
    switch(activeAccordion) {
      case "source":
        return (
          <div className="w-full h-full relative perspective-[1000px] flex items-center justify-center transform-gpu">
             <div className="w-[380px] h-[700px] bg-[#111] border-[3px] border-[#222] shadow-[0_20px_80px_rgba(0,0,0,0.2)] flex flex-col p-4 rotate-y-[-15deg] rotate-x-[15deg] transition-all duration-700 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-10 w-20 h-40 bg-rose-500/20 blur-[50px]"></div>
                <div className="w-full h-6 flex justify-center mb-6 mt-2"><div className="w-24 h-1.5 bg-white/20 rounded-full"></div></div>
                {/* Search / Source Abstract */}
                <div className="w-full relative h-[140px] border border-white/20 rounded-2xl bg-white/5 p-4 flex flex-col mb-4">
                   <div className="flex gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">🔍</div>
                      <div className="w-32 h-6 rounded bg-white/10"></div>
                   </div>
                   <div className="flex -space-x-2 mt-auto">
                      <div className="w-8 h-8 rounded-full border border-white/30 bg-[#c9622d]"></div>
                      <div className="w-8 h-8 rounded-full border border-white/30 bg-[#7f4a82]"></div>
                      <div className="w-8 h-8 rounded-full border border-white/30 bg-[#ba5d42]"></div>
                   </div>
                </div>
                {/* List Abstract */}
                <div className="flex-1 flex flex-col gap-3">
                   <div className="w-full h-16 rounded-xl border border-white/10 bg-white/5 flex items-center p-3 gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10"></div>
                      <div className="flex flex-col gap-1.5 flex-1"><div className="w-full h-2 bg-white/20 rounded-full"></div><div className="w-1/2 h-2 bg-white/10 rounded-full"></div></div>
                      <div className="w-12 h-6 rounded bg-white/20"></div>
                   </div>
                   <div className="w-full h-16 rounded-xl border border-white/10 bg-white/5 flex items-center p-3 gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10"></div>
                      <div className="flex flex-col gap-1.5 flex-1"><div className="w-3/4 h-2 bg-white/20 rounded-full"></div><div className="w-1/3 h-2 bg-white/10 rounded-full"></div></div>
                      <div className="w-12 h-6 rounded bg-[#c9622d]/60"></div>
                   </div>
                   <div className="w-full h-16 rounded-xl border border-white/10 bg-white/5 flex items-center p-3 gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10"></div>
                      <div className="flex flex-col gap-1.5 flex-1"><div className="w-5/6 h-2 bg-white/20 rounded-full"></div><div className="w-2/3 h-2 bg-white/10 rounded-full"></div></div>
                      <div className="w-12 h-6 rounded bg-white/20"></div>
                   </div>
                </div>
             </div>
          </div>
        );
      case "track":
        return (
          <div className="w-full h-full relative perspective-[1000px] flex items-center justify-center transform-gpu">
             <div className="w-[380px] h-[700px] bg-[#111] border-[3px] border-[#222] shadow-[0_20px_80px_rgba(0,0,0,0.2)] flex flex-col p-6 rotate-y-[-15deg] rotate-x-[15deg] transition-all duration-700 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-20 left-10 w-40 h-40 bg-[#c9622d]/20 blur-[50px]"></div>
                <div className="w-full h-6 flex justify-center mb-6"><div className="w-24 h-1.5 bg-white/20 rounded-full"></div></div>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="h-28 rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col justify-end">
                      <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Velocity</span>
                      <span className="text-3xl text-white font-medium">94%</span>
                   </div>
                   <div className="h-28 rounded-xl bg-[#7f4a82]/40 border border-[#7f4a82] p-4 flex flex-col justify-end">
                      <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold mb-1">Output</span>
                      <span className="text-3xl text-white font-medium">2.4x</span>
                   </div>
                </div>
                {/* Chart Abstract */}
                <div className="flex-1 rounded-xl border border-white/20 bg-white/5 p-4 flex items-end gap-2">
                   <div className="w-full bg-white/20 rounded-t h-[30%]"></div>
                   <div className="w-full bg-white/30 rounded-t h-[50%]"></div>
                   <div className="w-full bg-white/50 rounded-t h-[40%]"></div>
                   <div className="w-full bg-white/70 rounded-t h-[80%]"></div>
                   <div className="w-full bg-[#c9622d]/80 rounded-t h-[100%] border-t border-[#c9622d] shadow-[0_0_15px_#c9622d]"></div>
                </div>
             </div>
          </div>
        );
      case "compliance":
        return (
          <div className="w-full h-full relative perspective-[1000px] flex items-center justify-center transform-gpu">
             <div className="w-[380px] h-[700px] bg-[#111] border-[3px] border-[#222] shadow-[0_20px_80px_rgba(0,0,0,0.2)] flex flex-col p-5 rotate-y-[-15deg] rotate-x-[15deg] transition-all duration-700 relative overflow-hidden backdrop-blur-md">
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-500/20 blur-[60px]"></div>
                <div className="w-full h-6 flex justify-center mb-6"><div className="w-24 h-1.5 bg-white/20 rounded-full"></div></div>
                
                {/* Compliance Checks */}
                <div className="flex flex-col gap-3">
                   <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                      <div className="flex flex-col gap-1.5 flex-1"><div className="w-3/4 h-2 bg-emerald-500/50 rounded-full"></div></div>
                   </div>
                   <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                      <div className="flex flex-col gap-1.5 flex-1"><div className="w-1/2 h-2 bg-emerald-500/50 rounded-full"></div></div>
                   </div>
                   <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                      <div className="flex flex-col gap-1.5 flex-1"><div className="w-4/5 h-2 bg-emerald-500/50 rounded-full"></div></div>
                   </div>
                </div>
                
                <div className="mt-auto w-full p-6 rounded-2xl border border-white/20 bg-white/5 flex flex-col items-center text-center">
                    <ShieldCheck className="w-12 h-12 text-[#7f4a82] mb-4" />
                    <div className="w-3/4 h-3 bg-white/30 rounded-full mb-2"></div>
                    <div className="w-1/2 h-2 bg-white/20 rounded-full"></div>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full relative perspective-[1000px] flex items-center justify-center transform-gpu">
             <div className="w-[380px] h-[700px] bg-[#111] border-[3px] border-[#222] shadow-[0_20px_80px_rgba(0,0,0,0.2)] flex flex-col p-4 rotate-y-[-15deg] rotate-x-[15deg] transition-all duration-700 relative overflow-hidden backdrop-blur-md">
                <div className="w-full h-6 flex justify-center mb-6 mt-2"><div className="w-24 h-1.5 bg-white/20 rounded-full"></div></div>
                <div className="flex-1 w-full border border-white/10 rounded-xl bg-white/5 mb-4"></div>
                <div className="flex-1 w-full border border-white/10 rounded-xl bg-white/5"></div>
             </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFBF9] font-sans selection:bg-[#fce000] selection:text-[#111]">
      <PreparedNavbar />
      
      {/* 1. GRADIENT HERO BLOCK (Prepared911 Style) */}
      <section className="relative w-full pt-40 pb-32 overflow-hidden bg-[linear-gradient(180deg,_#A079FF_0%,_#8B6CE5_40%,_#5D489A_80%,_#3D2E68_100%)]">
         {/* Noise Overlay */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
         
         {/* Standardized Non-Overlapping Background Keywords */}
         <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
           <span className="absolute top-[8%] left-[4%] text-[5rem] font-bold text-white/[0.04] tracking-tighter uppercase">PAYROLL</span>
           <span className="absolute top-[8%] right-[4%] text-[5rem] font-bold text-white/[0.04] tracking-tighter uppercase">HR</span>
           <span className="absolute top-[32%] left-[10%] text-[5rem] font-bold text-white/[0.03] tracking-tighter uppercase">ATS</span>
           <span className="absolute top-[32%] right-[10%] text-[5rem] font-bold text-white/[0.03] tracking-tighter uppercase">TALENTS</span>
           <span className="absolute bottom-[32%] left-[5%] text-[5rem] font-bold text-white/[0.04] tracking-tighter uppercase">Haraka01</span>
           <span className="absolute bottom-[32%] right-[5%] text-[5rem] font-bold text-white/[0.04] tracking-tighter uppercase text-right">TRACKING</span>
           <span className="absolute bottom-[8%] left-[12%] text-[5rem] font-bold text-white/[0.03] tracking-tighter uppercase">IT</span>
           <span className="absolute bottom-[8%] right-[12%] text-[5rem] font-bold text-white/[0.03] tracking-tighter uppercase">TASKS</span>
         </div>
         
         {/* Vertical decorative lines mimicking screenshot logic */}
         <div className="absolute inset-0 flex justify-evenly pointer-events-none z-0">
             <div className="w-[1px] h-full bg-white/10"></div>
             <div className="w-[1px] h-full bg-white/10"></div>
             <div className="w-[1px] h-full bg-white/10"></div>
             <div className="w-[1px] h-full bg-white/10"></div>
         </div>

         <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            {/* Left Narrative */}
            <div className="flex flex-col justify-center min-h-[400px]">
                <h1 className="text-[52px] lg:text-[72px] font-medium tracking-tight text-white leading-[1.05] mb-8">
                    {heroTitle}
                </h1>
                <p className="text-xl lg:text-2xl text-white/90 leading-relaxed mb-10 max-w-lg">
                    {heroDescription}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                   <Link to="#" className="px-8 py-3.5 bg-transparent border border-white/50 text-white font-medium hover:bg-white/10 transition-colors">
                     Learn How
                   </Link>
                   <Link to="#" className="px-8 py-3.5 bg-[#111] border border-[#111] text-white font-medium hover:bg-black transition-colors">
                     Request Demo
                   </Link>
                </div>
            </div>

            {/* Right Interactive Mockup Container */}
            <div className="relative flex items-center justify-center">
                {/* Floating dark UI Mockup mirroring Prepared911 */}
                <div className="w-[110%] absolute left-0 rounded-lg shadow-2xl bg-[#1d1f21] border border-white/10 overflow-hidden aspect-[4/3] flex flex-col hover:-translate-y-2 transition-transform duration-700">
                    <div className="h-12 border-b border-white/5 bg-[#151618] flex flex-col justify-center px-4">
                        <div className="w-1/3 h-2 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="flex-1 flex p-4 gap-4">
                        <div className="w-1/3 h-full border border-white/5 rounded-lg bg-[#25282a] flex flex-col gap-2 p-2 relative overflow-hidden">
                           <div className="absolute inset-0 top-1/2 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none"></div>
                           <div className="w-full h-10 border border-red-500/30 bg-red-500/10 rounded items-center flex px-3"><div className="w-1/2 h-2 bg-red-500/50 rounded-full"></div></div>
                           <div className="w-full h-10 border border-white/5 bg-white/5 rounded items-center flex px-3"><div className="w-1/3 h-2 bg-white/20 rounded-full"></div></div>
                           <div className="w-full h-10 border border-white/5 bg-white/5 rounded items-center flex px-3"><div className="w-1/2 h-2 bg-white/20 rounded-full"></div></div>
                           <div className="w-full h-10 border border-white/5 bg-white/5 rounded items-center flex px-3"><div className="w-2/3 h-2 bg-white/20 rounded-full"></div></div>
                           <div className="w-full h-10 border border-white/5 bg-white/5 rounded items-center flex px-3"><div className="w-1/2 h-2 bg-white/20 rounded-full"></div></div>
                           <div className="w-full h-10 border border-white/5 bg-white/5 rounded items-center flex px-3"><div className="w-1/3 h-2 bg-white/20 rounded-full"></div></div>
                        </div>
                        <div className="flex-1 h-full border border-white/5 rounded-md flex flex-col p-4 bg-[#1a1c1e]">
                            <div className="w-full flex items-center justify-between mb-4">
                               <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center"><Workflow className="w-4 h-4 text-white/50" /></div>
                               <div className="flex gap-2">
                                   <div className="w-24 h-8 border border-white/10 rounded"></div>
                                   <div className="w-24 h-8 border border-white/10 rounded"></div>
                               </div>
                            </div>
                            <div className="w-full rounded border border-white/5 bg-white/5 p-3 flex flex-col gap-4">
                               <div className="flex flex-col gap-2 relative">
                                  <div className="w-2/3 h-2 bg-white/30 rounded-full"></div>
                                  <div className="w-full h-1 bg-red-500/50 rounded-full"><div className="w-1/3 h-full bg-red-500"></div></div>
                                  <span className="absolute right-0 top-0 text-[10px] text-white/50">LIVE</span>
                               </div>
                               <div className="flex flex-col gap-1 text-[11px] text-white/60">
                                   <span><strong className="text-white">Operator:</strong> I'm locating the necessary resources.</span>
                                   <span><strong className="text-white">System:</strong> Translated output injected automatically.</span>
                               </div>
                            </div>
                            <div className="mt-auto w-full h-10 border border-white/10 bg-black/40 rounded flex items-center justify-between px-3">
                                <div className="w-1/3 h-2 bg-white/20 rounded-full"></div>
                                <ArrowRight className="w-4 h-4 text-white/50"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </div>
         
      </section>

      {/* 2. END-TO-END ACCORDION BLOCK (Prepared911 Style) */}
      <section className="relative w-full py-40 overflow-hidden bg-[#f1edff]">
         <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
            
            {/* Left List side */}
            <div className="lg:col-span-5 flex flex-col">
                <span className="text-[12px] font-mono tracking-widest text-[#8a0a65] mb-8 uppercase font-bold">END-TO-END</span>
                <h2 className="text-[40px] lg:text-[48px] font-medium tracking-tight text-[#111] leading-tight mb-16 max-w-md">
                    One system, one screen, every phase.
                </h2>

                <div className="flex flex-col border-t border-[#111]/10">
                    {accordionItems.map((item) => {
                        const isActive = activeAccordion === item.id;
                        return (
                            <div 
                                key={item.id} 
                                onClick={() => setActiveAccordion(item.id)}
                                className={`border-b border-[#111]/10 py-8 cursor-pointer transition-all duration-300 relative group
                                            ${isActive ? "bg-[#111]/5 px-6 -mx-6" : "hover:bg-[#111]/5 hover:px-6 hover:-mx-6"}`}
                            >
                                {/* Left Active Bar */}
                                {isActive && <div className="absolute left-[-24px] lg:left-0 top-0 bottom-0 w-1 bg-[#8a0a65]"></div>}

                                <div className="flex justify-between items-center w-full">
                                    <h3 className="text-2xl font-medium text-[#111] tracking-tight">{item.title}</h3>
                                    <span className="text-[#111]/50 text-2xl font-light">
                                        {isActive ? "-" : "+"}
                                    </span>
                                </div>
                                
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isActive ? "max-h-[200px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
                                    <p className="text-[#555] text-lg leading-relaxed max-w-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Graphics side */}
            <div className="lg:col-span-7 flex items-center justify-center min-h-[500px]">
               {renderInteractiveGraphic()}
            </div>

         </div>
      </section>

      {/* 3. COMPARATIVE BLOCK (Rippling Style) */}
      <section className="w-full py-40 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col items-center">
              <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-[#111] mb-6 text-center max-w-2xl leading-[1.1]">
                  The only all-in-one software without silos
              </h2>
              <p className="text-[#555] text-xl text-center max-w-2xl mb-20 leading-relaxed">
                  Unlike traditional systems, Flowboard is powered by a single source of truth. This lets you eliminate manual data entry and flow information seamlessly between operations.
              </p>

              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
                  
                  {/* The Old Way Card */}
                  <div className="w-full bg-[#f9f8f6] rounded-3xl p-16 flex flex-col items-center shadow-inner relative overflow-hidden h-[450px]">
                      <h3 className="text-3xl font-medium text-[#111] mb-12 relative z-10">{comparisonOldTitle}</h3>
                      {/* Chaotic Nodes Overlay */}
                      <div className="absolute inset-x-0 bottom-0 top-[30%] flex items-center justify-center">
                          {/* Scattered lines */}
                          <svg className="absolute inset-0 w-full h-full" pointerEvents="none">
                               <line x1="20%" y1="20%" x2="50%" y2="80%" stroke="#e5e5e5" strokeWidth="2" />
                               <line x1="80%" y1="30%" x2="30%" y2="70%" stroke="#e5e5e5" strokeWidth="2" />
                               <line x1="10%" y1="60%" x2="60%" y2="20%" stroke="#e5e5e5" strokeWidth="2" />
                               <line x1="60%" y1="20%" x2="90%" y2="70%" stroke="#e5e5e5" strokeWidth="2" />
                          </svg>
                          <div className="absolute top-[20%] left-[20%] w-14 h-14 bg-white rounded shadow-md border border-gray-100 flex items-center justify-center">
                             <div className="w-4 h-4 rounded bg-rose-500"></div>
                          </div>
                          <div className="absolute top-[30%] right-[20%] w-14 h-14 bg-white rounded shadow-md border border-gray-100 flex items-center justify-center">
                             <div className="w-4 h-4 rounded bg-blue-500"></div>
                          </div>
                          <div className="absolute bottom-[20%] left-[30%] w-14 h-14 bg-white rounded shadow-md border border-gray-100 flex items-center justify-center">
                             <div className="w-4 h-4 rounded bg-emerald-500"></div>
                          </div>
                          <div className="absolute bottom-[30%] right-[10%] w-14 h-14 bg-white rounded shadow-md border border-gray-100 flex items-center justify-center">
                             <div className="w-4 h-4 rounded bg-amber-500"></div>
                          </div>
                          <div className="absolute top-[60%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded shadow-lg border border-gray-200 flex items-center justify-center z-10">
                             <span className="font-bold text-[#111] text-lg">System</span>
                          </div>
                      </div>
                  </div>

                  {/* The Flowboard Way Card */}
                  <div className="w-full bg-[#46013a] rounded-3xl p-16 flex flex-col items-center shadow-2xl relative overflow-hidden h-[450px]">
                      <h3 className="text-3xl font-medium text-white mb-12 relative z-10">{comparisonNewTitle}</h3>
                      {/* Organized Flowboard Nodes */}
                      <div className="absolute inset-x-0 bottom-0 top-[30%] flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full" pointerEvents="none">
                               <line x1="50%" y1="50%" x2="30%" y2="25%" stroke="#a36098" strokeWidth="2" strokeDasharray="4 4" />
                               <line x1="50%" y1="50%" x2="70%" y2="25%" stroke="#a36098" strokeWidth="2" strokeDasharray="4 4" />
                               <line x1="50%" y1="50%" x2="20%" y2="60%" stroke="#a36098" strokeWidth="2" strokeDasharray="4 4" />
                               <line x1="50%" y1="50%" x2="80%" y2="60%" stroke="#a36098" strokeWidth="2" strokeDasharray="4 4" />
                               <line x1="50%" y1="50%" x2="30%" y2="85%" stroke="#a36098" strokeWidth="2" strokeDasharray="4 4" />
                               <line x1="50%" y1="50%" x2="70%" y2="85%" stroke="#a36098" strokeWidth="2" strokeDasharray="4 4" />
                          </svg>

                          {/* Center Hub */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-[#8a0a65] rounded-full shadow-[0_0_50px_rgba(138,10,101,0.8)] border border-[#c1158f] flex items-center justify-center z-20">
                              <span className="font-black text-white text-3xl tracking-tighter">FLOW</span>
                          </div>

                          {/* Orbital Nodes */}
                          <div className="absolute top-[25%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#8a0a65]/50 backdrop-blur rounded flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-white"/></div>
                          <div className="absolute top-[25%] left-[70%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#8a0a65]/50 backdrop-blur rounded flex items-center justify-center"><Workflow className="w-6 h-6 text-white"/></div>
                          <div className="absolute top-[60%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#8a0a65]/50 backdrop-blur rounded flex items-center justify-center"><BarChart3 className="w-6 h-6 text-white"/></div>
                          <div className="absolute top-[60%] left-[80%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#8a0a65]/50 backdrop-blur rounded flex items-center justify-center"><Users2 className="w-6 h-6 text-white"/></div>
                          <div className="absolute top-[85%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#8a0a65]/50 backdrop-blur rounded flex items-center justify-center"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                          <div className="absolute top-[85%] left-[70%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#8a0a65]/50 backdrop-blur rounded flex items-center justify-center"><div className="w-4 h-4 bg-white/50 rounded-sm"></div></div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <PreparedFooter />
    </main>
  );
}
