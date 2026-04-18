import { useState, useRef } from "react";
import { PreparedNavbar } from "@/components/landing/PreparedNavbar";
import { PreparedFooter } from "@/components/landing/PreparedFooter";
import { Link } from "react-router-dom";
import { Play, ArrowLeft, ArrowRight, ArrowRight as ArrowRightIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlatformTemplateProps {
  metaTitle: string;
  heroTitle: string;
  heroDescription: string;
  heroImage?: string;
  features?: { num: string; title: string; desc: string }[];
  lifecycleTitle?: string;
  lifecycleCards?: { title: string; desc: string; linkText: string; uiType?: string }[];
}

export function PlatformPageTemplate({ metaTitle, heroTitle, heroDescription, heroImage, features, lifecycleTitle, lifecycleCards }: PlatformTemplateProps) {
    return (
        <main className="min-h-screen bg-[#FCFBF9] font-sans selection:bg-[#fce000] selection:text-[#111] overflow-hidden" 
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")' }}>
          <PreparedNavbar />
          
          {/* Main Grid Container defining the structural columns throughout the page */}
          <div className="max-w-[1440px] mx-auto border-x border-gray-300 relative">

             {/* 1. HERO SECTION */}
             <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] border-b border-gray-300">
               <div className="col-span-1 lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-300 p-12 pr-10 flex flex-col justify-center">
                 <span className="text-[12px] font-mono tracking-widest text-[#555] mb-6 uppercase">{metaTitle}</span>
                 <h1 className="text-5xl lg:text-7xl font-normal tracking-tight text-[#111] mb-6 leading-[1.05]">{heroTitle}</h1>
                 <p className="text-[#555] text-[18px] leading-relaxed mb-10 pr-4">{heroDescription}</p>
                 <Link to="#" className="inline-flex items-center justify-center px-8 py-3 bg-[#111] text-white text-[15px] font-medium transition-all hover:bg-black self-start w-max">
                   Request Demo
                 </Link>
               </div>

               <div className="col-span-1 lg:col-span-8 p-12 relative flex items-center justify-center min-h-[500px]">
                  {/* Pseudo dashboard image showcasing software */}
                  <div className={`w-full h-full rounded-sm overflow-hidden shadow-2xl relative max-w-[900px] border ${heroImage ? "bg-[#f5f5f5] border-gray-200 shadow-[0_15px_60px_rgba(0,0,0,0.08)]" : "bg-gradient-to-tr from-[#161616] to-[#2a2a2a] border-black/10"}`}>
                     {/* Fake Window styling */}
                     <div className={`h-10 border-b w-full flex items-center px-6 gap-2 ${heroImage ? "bg-[#fcfbf9] border-gray-200" : "bg-black/40 border-white/10"}`}>
                         <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                         <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                         <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                     </div>
                     <div className="absolute inset-0 top-10 flex items-center justify-center">
                        <img src={heroImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"} alt="Dashboard UI" className={`w-full h-full object-cover ${heroImage ? "opacity-100" : "opacity-50 mix-blend-overlay"}`} />
                     </div>
                  </div>
               </div>
             </div>

             {/* 2. GRADIENT VIDEO BLOCK */}
             <div className="w-full border-b border-[#f1edff] p-16 bg-[#f1edff]">
                 <div className="w-full rounded-xl overflow-hidden shadow-xl bg-white p-12 lg:p-20 flex flex-col lg:flex-row gap-16 items-center border border-white/20">
                    <div className="w-full lg:w-1/2 relative rounded-lg overflow-hidden aspect-video shadow-2xl group cursor-pointer border border-black/5">
                        <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80" alt="Video thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full border border-white/50 backdrop-blur-sm flex items-center justify-center bg-white/10 group-hover:bg-white/20 group-hover:scale-110 transition-all">
                                <Play fill="white" className="w-8 h-8 text-white ml-2" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <span className="text-[12px] font-mono tracking-widest text-[#555] mb-6 uppercase block font-medium">Workforce Intelligence</span>
                        <h2 className="text-4xl lg:text-[54px] font-medium tracking-tight text-[#111] mb-6 leading-[1.05]">Rethink Administrative Workflows</h2>
                        <p className="text-[#555] text-[18px] leading-relaxed max-w-lg">
                            CEO and leadership teams discuss how our dynamic AI can rapidly organize, streamline, and solve foundational platform challenges.
                        </p>
                    </div>
                 </div>
             </div>

             {/* ---------------- NEW DEEL THEMED SECTIONS ----------------- */}

             {/* 5. LIFECYCLE GRID */}
             <LifecycleGrid title={lifecycleTitle} cards={lifecycleCards} />

             {/* 6. INTERACTIVE TEAM TABS */}
             <TeamTabsBlock />

             {/* 3. THREE COLUMN FEATURE GRID */}
             <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-gray-300 min-h-[500px]">
                 {features ? (
                     features.map((f, i) => (
                         <FeatureCol key={i} num={f.num} title={f.title} desc={f.desc} borderNone={i === features.length - 1} />
                     ))
                 ) : (
                     <>
                         <FeatureCol num="01" title="Eliminate Backlogs" desc="When application volumes are high, don't lose valuable time strictly to administrative data parsing." />
                         <FeatureCol num="02" title="Unified Integration" desc="Seamlessly merge your legacy HR frameworks into our centralized API ecosystem efficiently." />
                         <FeatureCol num="03" title="One Source of Truth" desc="See all candidate data, historical metrics, and payroll performance in a centralized platform." borderNone />
                     </>
                 )}
             </div>

             {/* 7. CUSTOMER TESTIMONIAL CAROUSEL */}
             <CustomerCarousel />

             {/* --------------------------------------------------------- */}

             {/* 4. QUOTE BANNER GRID */}
             <div className="w-full p-16 bg-[#f1edff] border-t border-[#f1edff]">
                 <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                     
                     {/* CARD 1 */}
                     <div className="w-full min-h-[300px] rounded-xl overflow-hidden bg-white p-12 lg:p-16 flex items-center relative shadow-xl border border-white/20 hover:-translate-y-1 transition-transform duration-500">
                        {/* Concentric Decorative Circles */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 right-4 opacity-[0.15] pointer-events-none">
                            <div className="w-[300px] h-[300px] rounded-full border border-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            <div className="w-[150px] h-[150px] rounded-full border border-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            <div className="w-[80px] h-[80px] rounded-full border border-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
    
                        <div className="relative z-10">
                            <p className="text-2xl lg:text-3xl leading-[1.3] font-medium text-[#111] mb-8 tracking-tight">
                                "We have core workflows that contain massive decision trees... with the Flowboard system... we've been able to get candidates onboarded in about a minute."
                            </p>
                            <p className="text-[12px] font-mono tracking-widest text-[#555] uppercase font-bold">
                                MICHAEL BERRY, DIRECTOR OF OPERATIONS
                            </p>
                        </div>
                     </div>

                     {/* CARD 2 */}
                     <div className="w-full min-h-[300px] rounded-xl overflow-hidden bg-[#111] p-12 lg:p-16 flex items-center relative shadow-xl border border-white/10 hover:-translate-y-1 transition-transform duration-500">
                        {/* Abstract Dashed Geometry */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 right-10 opacity-[0.1] pointer-events-none">
                            <div className="w-[600px] h-[1px] bg-white border border-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 block border-dashed" />
                            <div className="w-[600px] h-[1px] bg-white border border-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex rotate-45 block border-dashed" />
                            <div className="w-[200px] h-[200px] border border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
    
                        <div className="relative z-10">
                            <p className="text-2xl lg:text-3xl leading-[1.3] font-medium text-white mb-8 tracking-tight">
                                "Our payroll latency dropped to zero across 40 countries. Flowboard's programmatic architecture fundamentally changed how we sequence global talent scaling."
                            </p>
                            <p className="text-[12px] font-mono tracking-widest text-[#A99DFE] uppercase font-bold">
                                SARAH JENKINS, VP OF TALENT
                            </p>
                        </div>
                     </div>

                 </div>
             </div>

          </div>

          <PreparedFooter />
        </main>
    );
}

/* ----------------------------------------------------- */
/* ADDITIONAL SECTIONS IMPLEMENTED FROM NEW DEEL UI REQS */
/* ----------------------------------------------------- */

function LifecycleGrid({ title, cards }: { title?: string; cards?: {title: string; desc: string; linkText: string; uiType?: string}[] }) {
  const displayTitle = title || "Everything connected across the entire lifecycle";
  const displayCards = cards || [
    { title: "Buy, lease, and manage devices", desc: "Procure laptops and accessories in one place, with devices configured, enrolled in MDM, and shipped globally ready to use on day one.", linkText: "Explore Hardware & Equipment", uiType: "kanban" },
    { title: "Run global operations", desc: "Manage devices, application access, security, and offboarding in one system, with policies enforced consistently everywhere you hire.", linkText: "Explore Lifecycle Management", uiType: "scorecard" },
    { title: "Automate onboarding and exits", desc: "From MDM enrollment to access updates and device orders, automate every action triggered by a hire, role change, or offboarding without back-and-forth.", linkText: "Explore Access Management", uiType: "onboarding" },
    { title: "Manage application access", desc: "Automatically grant, update, and revoke app access based on role and employment status to reduce security risk and manual work.", linkText: "Explore Security Control", uiType: "match" },
    { title: "Secure devices and data", desc: "Protect devices and data with active threat defense to reduce risk and stop data loss effortlessly across all geographical endpoints.", linkText: "Explore Endpoint Protection", uiType: "chart" },
    { title: "24/7 global tech support", desc: "Give employees direct access to real experts for device issues, app access, repairs, replacements, and loaners in any time zone natively.", linkText: "Explore 24/7 Support", uiType: "nodes" }
  ];

  return (
    <div className="w-full border-b border-gray-300 py-24 px-10 relative bg-[#FCFBF9]">
      <h2 className="text-4xl lg:text-[54px] font-medium tracking-tight text-center mb-20 max-w-2xl mx-auto leading-tight text-[#111]">
        {displayTitle}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayCards.map((c, i) => (
           <LifecycleCard key={i} title={c.title} desc={c.desc} linkText={c.linkText} uiType={c.uiType} />
        ))}
      </div>
    </div>
  );
}

function LifecycleCard({ title, desc, linkText, uiType = "chart" }: { title: string; desc: string; linkText: string; uiType?: string; }) {
  const renderUI = () => {
    switch(uiType) {
      case "kanban":
         return (
             <div className="w-[85%] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col p-5 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 scale-95 relative overflow-hidden my-auto">
                 <div className="flex justify-between items-center mb-4">
                     <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hiring Pipeline</span>
                     <span className="text-[13px] font-bold text-[#111]">1,240 Active</span>
                 </div>
                 <div className="flex justify-between items-center mb-5">
                     <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Time to hire</span>
                     <span className="text-[13px] font-bold text-[#111]">14 Days</span>
                 </div>
                 <div className="flex justify-between items-center mb-6">
                     <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Top sources</span>
                     <div className="flex -space-x-1">
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80" alt="Avatar" />
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80" alt="Avatar" />
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80" alt="Avatar" />
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500">+8</div>
                     </div>
                 </div>
                 <button className="w-full py-2.5 bg-[#111] text-white text-[12px] font-medium rounded-lg">Scale Workflows</button>
             </div>
         );
      case "scorecard":
         return (
             <div className="w-full h-full flex flex-col items-center justify-center relative p-4 gap-2">
                 <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 w-full max-w-[200px] z-10 group-hover:-translate-y-1 transition-transform duration-500 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#A99DFE]/10 flex items-center justify-center">
                         <svg className="w-4 h-4 text-[#A99DFE]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                     </div>
                     <div className="flex flex-col flex-1">
                         <div className="flex justify-between text-[9px] text-[#111] font-bold uppercase mb-1"><span>Rubric Avg</span><span className="text-[#A99DFE]">85%</span></div>
                         <div className="w-full h-1 bg-gray-100 rounded-full"><div className="w-[85%] h-full bg-[#A99DFE] rounded-full"></div></div>
                     </div>
                 </div>
                 
                 <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-full max-w-[220px] z-20 group-hover:-translate-y-2 transition-transform duration-500 delay-75">
                     <span className="text-[10px] font-bold text-gray-400 block mb-3 uppercase tracking-widest pl-1">Engineering Assessment</span>
                     <div className="flex items-end gap-1.5 h-10 w-full mb-1">
                         <div className="w-full bg-amber-100 rounded-t-sm h-[40%]"></div>
                         <div className="w-full bg-amber-200 rounded-t-sm h-[70%] relative"><div className="absolute -top-4 w-full text-center text-[9px] font-bold text-amber-600">72%</div></div>
                         <div className="w-full bg-[#A99DFE] rounded-t-sm h-[95%] relative"><div className="absolute -top-4 w-full text-center text-[9px] font-bold text-[#A99DFE]">95%</div></div>
                     </div>
                 </div>
             </div>
         );
      case "match":
         return (
             <div className="w-full h-full flex flex-col items-center justify-center relative p-2">
                 <div className="flex items-center gap-2 w-full px-2 relative z-10 group-hover:-translate-y-1 transition-transform duration-500">
                     <div className="w-10 h-10 rounded-full shadow-md bg-white overflow-hidden border-2 border-white z-10"><img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=64&h=64&q=80" /></div>
                     
                     <div className="flex-1 border-t border-dashed border-gray-300 relative mx-1">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">MATCHED</div>
                     </div>

                     <div className="w-10 h-10 rounded-full shadow-md bg-white overflow-hidden border-2 border-white z-20 flex items-center justify-center font-bold text-[14px]">🏢</div>
                 </div>
                 
                 <div className="mt-4 bg-white rounded-xl shadow-md border border-gray-100 p-3 flex justify-between items-center w-[90%] group-hover:-translate-y-2 transition-transform duration-500 delay-100">
                     <div className="flex flex-col">
                         <span className="text-[12px] font-bold text-[#111]">System Architect</span>
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Req #4921 • Open</span>
                     </div>
                     <div className="flex flex-col items-center">
                         <span className="text-[14px] font-black text-[#A99DFE]">99<span className="text-[9px] text-[#A99DFE]/60">%</span></span>
                     </div>
                 </div>
             </div>
         );
      case "onboarding":
         return (
             <div className="w-[85%] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-5 relative group-hover:-translate-y-2 transition-all duration-500 my-auto">
                 <div className="flex items-start gap-3 mb-4">
                     <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                     <div className="flex flex-col flex-1">
                         <span className="text-[12px] font-bold text-[#111]">Offer Signed</span>
                         <span className="text-[10px] text-gray-400">Today, 9:24 AM</span>
                     </div>
                     <img className="w-5 h-5 rounded-full" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80" />
                 </div>
                 <div className="absolute left-[29px] top-[30px] w-[2px] h-[34px] bg-gray-100 -z-10"></div>
                 
                 <div className="flex items-start gap-3 mb-4">
                     <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                     <div className="flex flex-col flex-1">
                         <span className="text-[12px] font-bold text-[#111]">Background Check</span>
                         <span className="text-[10px] text-gray-400">Processing via Checkr</span>
                     </div>
                 </div>
                 <div className="absolute left-[29px] top-[72px] w-[2px] h-[34px] bg-gray-100 -z-10"></div>

                 <div className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded-full bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center shrink-0 mt-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                     <div className="flex items-center justify-between flex-1">
                         <span className="text-[12px] font-bold text-gray-500">IT Setup Triggered</span>
                         <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>
                     </div>
                 </div>
             </div>
         );
      case "chart":
         return (
             <div className="w-full px-5 flex flex-col justify-center h-full">
                 <div className="flex items-center justify-between mb-3 mt-1 px-2">
                     <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Candidate Origin</span>
                     <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                 </div>
                 <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-1.5 flex flex-col gap-1.5 group-hover:-translate-y-2 transition-transform duration-500">
                     <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                         <div className="flex items-center gap-3">
                             <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px]">🇺🇸</div>
                             <div className="flex -space-x-1.5">
                                <img className="w-5 h-5 rounded-full border border-white" src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=64&h=64&q=80" />
                                <img className="w-5 h-5 rounded-full border border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80" />
                             </div>
                         </div>
                         <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Accepted</span>
                     </div>
                     <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                         <div className="flex items-center gap-3">
                             <div className="w-5 h-5 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[10px]">🇬🇧</div>
                             <div className="flex -space-x-1.5">
                                <img className="w-5 h-5 rounded-full border border-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80" />
                             </div>
                         </div>
                         <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Interviewing</span>
                     </div>
                 </div>
             </div>
         );
      case "nodes":
         return (
             <div className="w-full h-full relative flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-500">
                 <div className="absolute top-4 left-[2%] bg-white rounded-full shadow-md border border-gray-100 flex items-center gap-2 px-3 py-1.5 z-10 hover:shadow-lg">
                     <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[12px]">☁️</div>
                     <span className="text-[11px] font-bold text-[#111]">Workday<span className="block text-[8px] text-gray-400 uppercase font-normal tracking-wide">HRIS</span></span>
                 </div>
                 
                 <div className="absolute top-1/2 left-[20%] -translate-y-1/2 bg-white rounded-full shadow-md border border-gray-100 flex items-center gap-2 px-3 py-1.5 z-20 hover:shadow-lg">
                     <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[12px]">🟢</div>
                     <span className="text-[11px] font-bold text-[#111]">Greenhouse<span className="block text-[8px] text-gray-400 uppercase font-normal tracking-wide">ATS Sync</span></span>
                 </div>

                 <div className="absolute bottom-4 right-[5%] bg-white rounded-full shadow-md border border-gray-100 flex items-center gap-2 px-3 py-1.5 z-10 hover:shadow-lg">
                     <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[12px]">💬</div>
                     <span className="text-[11px] font-bold text-[#111]">Slack<span className="block text-[8px] text-gray-400 uppercase font-normal tracking-wide">Alerts</span></span>
                 </div>

                 <div className="absolute top-[18%] right-[5%] bg-white rounded-full shadow-md border border-gray-100 flex items-center gap-2 px-3 py-1.5 z-10 hover:shadow-lg">
                     <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[12px]">📅</div>
                     <span className="text-[11px] font-bold text-[#111]">G-Suite<span className="block text-[8px] text-gray-400 uppercase font-normal tracking-wide">Calendar</span></span>
                 </div>
                 
                 {/* Decorative connections */}
                 <svg className="absolute inset-0 w-full h-full -z-10 opacity-30" pointerEvents="none">
                    <line x1="15%" y1="20%" x2="40%" y2="50%" stroke="gray" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="40%" y1="50%" x2="80%" y2="80%" stroke="gray" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="40%" y1="50%" x2="80%" y2="30%" stroke="gray" strokeWidth="1" strokeDasharray="4 4" />
                 </svg>
             </div>
         );
      default:
         return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 flex flex-col h-full border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
       <div className="w-full h-40 bg-[#f9f9f9] rounded-lg mb-8 flex items-center justify-center overflow-hidden relative border border-gray-100/50">
           {renderUI()}
       </div>
       <h3 className="text-xl font-semibold tracking-tight text-[#111] mb-3">{title}</h3>
       <p className="text-[#555] text-[15px] leading-relaxed mb-auto">{desc}</p>
    </div>
  );
}

function TeamTabsBlock() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Growth Leaders", "HR & People Teams", "Job Board", "Global Workforces"];

  const tabContent = [
    {
      title: "Run from one global system",
      desc: "Manage devices, access, security, and support from a single platform. Standardize policies, automate workflows, and maintain full visibility across regions without adding tools or headcount.",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80"
    },
    {
      title: "Sync internal logic continuously",
      desc: "Connect your global directory natively. When an employee is hired, transferred, or terminated, their application access and hardware lifecycle respond intelligently and securely.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80"
    },
    {
      title: "Syndicate open opportunities",
      desc: "Push your open requisitions with a single click out to dozens of top-tier external job boards, pulling all candidate data centrally back into your unified hiring pipeline automatically.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80"
    },
    {
      title: "Self-service for everything",
      desc: "Empower your diverse workforce to securely request hardware repairs, reset authentication tokens, or order approved peripherals immediately from their own native dashboard automatically.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="w-full bg-primary/5 text-[#111] pt-32 pb-40 px-10 border-b border-gray-300">
      <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-center mb-16 max-w-3xl mx-auto leading-tight text-[#111]">
        Built for every team<br />that runs globally
      </h2>
      
      {/* Tabs Row */}
      <div className="flex flex-wrap justify-center gap-6 lg:gap-16 border-b border-[#111]/10 mb-20 max-w-5xl mx-auto w-full">
        {tabs.map((tab, idx) => (
          <button 
             key={tab} 
             onClick={() => setActiveTab(idx)}
             className={`pb-5 px-3 text-[17px] font-medium tracking-wide transition-all relative ${activeTab === idx ? "text-[#111]" : "text-[#555] hover:text-[#111]"}`}
          >
            {tab}
            {activeTab === idx && (
                <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#111]" />
            )}
          </button>
        ))}
      </div>

      {/* Interactive Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1440px] mx-auto min-h-[500px]">
        {/* Left Interactive Copy Card */}
        <div className="lg:col-span-5 bg-white rounded-sm p-12 lg:p-16 flex flex-col justify-center border border-gray-200 shadow-xl relative overflow-hidden">
           {/* Soft glow in background */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
           <AnimatePresence mode="wait">
             <motion.div 
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
               className="relative z-10"
             >
               <h3 className="text-3xl lg:text-[40px] font-medium tracking-tight text-[#111] mb-6 leading-[1.1]">
                 {tabContent[activeTab].title}
               </h3>
               <p className="text-[#555] text-[18px] leading-relaxed mb-12">
                 {tabContent[activeTab].desc}
               </p>
             </motion.div>
           </AnimatePresence>
           <Link to="#" className="w-max px-8 py-3.5 rounded-full border border-[#111] text-[#111] font-medium hover:bg-gray-100 transition-colors relative z-10 text-[15px]">
             Book a free 30-minute demo
           </Link>
        </div>
        {/* Right Photo Area */}
        <div className="lg:col-span-7 bg-white rounded-sm overflow-hidden relative shadow-xl border border-gray-200 min-h-[400px]">
           <AnimatePresence mode="wait">
             <motion.img 
                key={activeTab}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                src={tabContent[activeTab].image} 
                alt="Highlight Feature" 
                className="w-full h-full object-cover absolute inset-0"
             />
           </AnimatePresence>
           {/* Floating generic card overlay imitating security stats */}
           <div className="absolute bottom-10 left-10 bg-white text-black p-8 rounded-sm shadow-2xl w-80 lg:w-[400px] border border-gray-100 z-20">
              <span className="font-semibold text-[17px] tracking-tight mb-6 block">Device security rules</span>
              <div className="space-y-5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-8 bg-blue-100 rounded" />
                        <div className="flex flex-col">
                            <span className="text-[14px] font-semibold tracking-tight text-[#111]">MacBook Air M3</span>
                            <span className="text-[12px] text-gray-400">#ITM-4545214</span>
                        </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">ENCRYPTED</span>
                 </div>
                 <div className="w-full h-[1px] bg-gray-100/80"></div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-8 bg-gray-100 rounded" />
                        <div className="flex flex-col">
                            <span className="text-[14px] font-semibold tracking-tight text-[#111]">Dell Precision</span>
                            <span className="text-[12px] text-gray-400">#ITM-7019293</span>
                        </div>
                    </div>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full">PENDING</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function CustomerCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (containerRef.current) containerRef.current.scrollBy({ left: -420, behavior: "smooth" });
  };
  const scrollRight = () => {
    if (containerRef.current) containerRef.current.scrollBy({ left: 420, behavior: "smooth" });
  };

  const customers = [
    { name: "TURING", text: "How Turing expedites payments for 6,000+ global workers efficiently using centralized infrastructure.", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80" },
    { name: "Revolut", text: "How Revolut streamlined employee relocation workflows autonomously avoiding compliance snags.", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80" },
    { name: "Magic", text: "How Magic saves 50+ hours a month on administrative data entry with automated synchronization.", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" },
    { name: "BCG", text: "How BCG centralizes nations with a unified platform schema seamlessly matching global regulatory constraints.", img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="w-full border-b border-gray-300 py-32 px-10 overflow-hidden relative bg-[#FCFBF9]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 max-w-[1440px] mx-auto gap-8">
        <h2 className="text-4xl lg:text-[54px] font-medium tracking-tight text-[#111]">
          See what customers are saying
        </h2>
        <div className="flex gap-4">
          <button onClick={scrollLeft} className="w-14 h-14 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm cursor-pointer">
            <ArrowLeft className="w-6 h-6 text-[#111]" />
          </button>
          <button onClick={scrollRight} className="w-14 h-14 rounded-full bg-[#111] hover:bg-black flex items-center justify-center transition-colors shadow-sm cursor-pointer border border-[#111]">
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Track */}
      <div 
         ref={containerRef}
         className="flex gap-8 overflow-x-auto pb-16 pt-4 snap-x snap-mandatory scrollbar-hide max-w-[1440px] mx-auto"
         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
         {customers.map((c, i) => (
            <div key={i} className="min-w-[320px] md:min-w-[420px] w-[320px] md:w-[420px] flex-shrink-0 bg-white rounded-sm overflow-hidden shadow-sm border border-gray-200 snap-start group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
               <div className="h-[260px] w-full overflow-hidden">
                 <img src={c.img} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt={c.name} />
               </div>
               <div className="p-10 flex flex-col min-h-[220px]">
                  <span className="text-3xl font-black tracking-tighter text-[#111] mb-6 block uppercase">{c.name}</span>
                  <p className="text-[#555] text-[17px] leading-relaxed mb-12 flex-1">
                     {c.text}
                  </p>
                  <span className="font-semibold text-[#111] flex items-center gap-2 mt-auto group-hover:underline underline-offset-4 text-[15px]">
                     Read more <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </span>
               </div>
            </div>
         ))}
      </div>
      
      {/* Decorative Progress Style Line */}
      <div className="max-w-[1440px] mx-auto mt-4 hidden md:block px-8 relative">
         <div className="w-full h-[2px] bg-gray-200 rounded-full overflow-hidden relative">
            <div className="w-[15%] h-full bg-[#111] rounded-full absolute left-0"></div>
         </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------- */
/* SMALL HELPER COLUMN USED ABOVE IN ORIGINAL DESIGN     */
/* ----------------------------------------------------- */
function FeatureCol({ num, title, desc, borderNone = false }: { num: string; title: string; desc: string; borderNone?: boolean }) {
    return (
        <div className={`col-span-1 p-12 pr-10 flex flex-col bg-[#FCFBF9] ${borderNone ? '' : 'border-b lg:border-b-0 lg:border-r border-gray-300'}`}>
            <span className="text-[13px] font-mono tracking-widest text-[#555] mb-4 font-semibold">{num}</span>
            <h3 className="text-3xl lg:text-[34px] font-medium tracking-tight text-[#111] mb-12">{title}</h3>
            
            <div className="w-full aspect-[4/3] bg-primary/10 rounded-sm mb-12 flex items-center justify-center relative overflow-hidden">
                {/* Abstract graphic circles matching screenshot style */}
                <div className="flex items-center gap-6 z-10">
                    <div className="w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center opacity-90 border-[3px] border-white/50" />
                    <div className="w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center opacity-90 border-[3px] border-white/50" />
                    <div className="w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center opacity-90 border-[3px] border-white/50" />
                </div>
            </div>

            <p className="text-[#555] text-[17px] leading-relaxed max-w-sm">
                {desc}
            </p>
        </div>
    );
}
