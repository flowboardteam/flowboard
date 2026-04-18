import { PreparedNavbar } from "@/components/landing/PreparedNavbar";
import { PreparedFooter } from "@/components/landing/PreparedFooter";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function OpenPositions() {
  return (
    <main className="min-h-screen bg-[#f4f2ee] font-sans selection:bg-[#ffb038] selection:text-[#111] overflow-x-hidden">
      <PreparedNavbar />
      
      <section className="relative w-full pt-40 pb-32">
          {/* Noise Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>

          {/* Topographic Watermarks */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <span className="absolute top-[8%] left-[4%] text-[8rem] font-black text-[#111]/[0.02] tracking-tighter uppercase whitespace-nowrap">HIRING</span>
            <span className="absolute top-[25%] right-[2%] text-[6rem] font-black text-[#111]/[0.02] tracking-tighter uppercase whitespace-nowrap rotate-6">TALENT POOL</span>
            <span className="absolute bottom-[30%] left-[-5%] text-[10rem] font-black text-[#111]/[0.02] tracking-tighter uppercase whitespace-nowrap -rotate-3">CAREERS</span>
            <span className="absolute bottom-[10%] right-[10%] text-[5rem] font-black text-[#111]/[0.02] tracking-tighter uppercase whitespace-nowrap">MISSION</span>
          </div>

          {/* Faded vertical track lines */}
          <div className="absolute inset-0 flex justify-evenly pointer-events-none z-0">
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
          </div>

          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
            <div className="text-center mb-24">
               <span className="text-[10px] font-mono tracking-[0.2em] text-[#555] mb-6 uppercase block">Work with us</span>
               <h1 className="text-[64px] lg:text-[84px] font-medium tracking-tight text-[#111] leading-[1.05] mb-8">
                 Join the <span className="italic font-serif">Mission</span>
               </h1>
               <p className="text-2xl text-[#222] font-medium leading-[1.3] max-w-2xl mx-auto tracking-tight">
                 We're building the infrastructure for the future of work. Help us unlock human potential across borders.
               </p>
            </div>
            
            <div className="max-w-[1000px] mx-auto bg-white/40 backdrop-blur-xl border border-white/60 p-4 lg:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative z-20">
               <iframe 
                 src="https://docs.google.com/forms/d/e/1FAIpQLSeIcHvyKK5NOW5QtREqCieQNd1si4FcMmEoZfXEFWNPw7BYlA/viewform?embedded=true" 
                 width="100%" 
                 height="1965" 
                 frameBorder="0" 
                 marginHeight={0} 
                 marginWidth={0}
                 className="w-full bg-white shadow-sm"
               >
                 Loading…
               </iframe>
            </div>
          </div>
      </section>

      {/* MASSIVE CTA BLOCK */}
      <section className="relative w-full pb-40 overflow-hidden bg-[#f4f2ee]">
         <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-20">
             <div className="w-full min-h-[350px] rounded-2xl bg-gradient-to-br from-[#1a1a1a] via-[#333] to-[#111] p-12 flex flex-col justify-center relative overflow-hidden shadow-2xl">
                  {/* Subtle dark gradient variation for Careers */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-30 blur-2xl"></div>
                  <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-8 text-white">
                      <div className="flex flex-col">
                         <span className="text-[12px] font-mono tracking-[0.2em] text-white/70 mb-6 uppercase">CONNECT WITH US</span>
                         <h2 className="text-[56px] lg:text-[72px] font-medium tracking-tight leading-[1] max-w-lg mb-8">
                             Let's build the future together.
                         </h2>
                         <div>
                            <Link to="/partners/apply" className="px-8 py-4 border-2 border-white text-white font-bold hover:bg-white hover:text-black transition-all rounded-sm uppercase tracking-widest text-xs">
                                Partner with us
                            </Link>
                         </div>
                      </div>
                      <ArrowRight className="w-24 h-24 text-white opacity-80 shrink-0 stroke-[1px]" />
                  </div>
             </div>
         </div>
         {/* Vertical track lines background */}
         <div className="absolute inset-0 flex justify-evenly pointer-events-none z-0">
             <div className="w-[1px] h-full bg-[#111]/3"></div>
             <div className="w-[1px] h-full bg-[#111]/3"></div>
             <div className="w-[1px] h-full bg-[#111]/3"></div>
             <div className="w-[1px] h-full bg-[#111]/3"></div>
         </div>
      </section>

      <PreparedFooter />
    </main>
  );
}
