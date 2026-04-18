import { PreparedNavbar } from "./PreparedNavbar";
import { PreparedFooter } from "./PreparedFooter";
import { Link } from "react-router-dom";
import { Trophy, Handshake, Users, HeartHandshake, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface AudienceTemplateProps {
  metaHeadline: string;
  missionHeading: string;
  missionDescription: string;
}

export function AudienceTemplate({ 
  metaHeadline, 
  missionHeading, 
  missionDescription 
}: AudienceTemplateProps) {
  return (
    <main className="min-h-screen bg-[#f4f2ee] font-sans selection:bg-[#ffb038] selection:text-[#111]">
      <PreparedNavbar />
      
      {/* 1. MISSION HERO OVERLAP BLOCK */}
      <section className="relative w-full pt-40 pb-32">
          {/* Noise Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>

          {/* Standardized Non-Overlapping Background Keywords */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <span className="absolute top-[8%] left-[4%] text-[5rem] font-bold text-[#111]/[0.03] tracking-tighter uppercase">PAYROLL</span>
            <span className="absolute top-[8%] right-[4%] text-[5rem] font-bold text-[#111]/[0.03] tracking-tighter uppercase">HR</span>
            <span className="absolute top-[32%] left-[10%] text-[5rem] font-bold text-[#111]/[0.02] tracking-tighter uppercase">ATS</span>
            <span className="absolute top-[32%] right-[10%] text-[5rem] font-bold text-[#111]/[0.02] tracking-tighter uppercase">TALENTS</span>
            <span className="absolute bottom-[32%] left-[5%] text-[5rem] font-bold text-[#111]/[0.03] tracking-tighter uppercase">Haraka01</span>
            <span className="absolute bottom-[32%] right-[5%] text-[5rem] font-bold text-[#111]/[0.03] tracking-tighter uppercase text-right">TRACKING</span>
            <span className="absolute bottom-[8%] left-[12%] text-[5rem] font-bold text-[#111]/[0.02] tracking-tighter uppercase">IT</span>
            <span className="absolute bottom-[8%] right-[12%] text-[5rem] font-bold text-[#111]/[0.02] tracking-tighter uppercase">TASKS</span>
          </div>

          {/* Faded vertical track lines */}
         <div className="absolute inset-0 flex justify-evenly pointer-events-none z-0">
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
         </div>

         <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            {/* Left Typography */}
            <div className="flex flex-col justify-center min-h-[400px]">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#555] mb-4 uppercase">{metaHeadline}</span>
                <h1 className="text-[64px] lg:text-[84px] font-medium tracking-tight text-[#111] leading-[1.05] mb-6">
                    {missionHeading}
                </h1>
                <p className="text-2xl lg:text-[28px] text-[#222] font-medium leading-[1.3] mb-12 max-w-md tracking-tight">
                    {missionDescription}
                </p>
                <div>
                   <Link to="#" className="inline-flex items-center justify-center px-8 py-4 bg-[#161616] border border-[#161616] text-white font-medium hover:bg-black transition-colors rounded-sm shadow-xl">
                     Join the Team
                   </Link>
                </div>
            </div>

            {/* Right Asymmetrical Images */}
            <div className="relative flex items-center justify-center min-h-[500px]">
                {/* Main Large Image Box */}
                <div className="absolute right-0 top-10 w-3/4 aspect-video bg-[#3d3d3d] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop" alt="Operations Center" className="w-full h-full object-cover mix-blend-overlay opacity-80" />
                </div>
                {/* Overlapping Small Image Box */}
                <div className="absolute left-10 bottom-10 w-1/2 aspect-square bg-[#222] overflow-hidden border-8 border-[#f4f2ee] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
                    <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop" alt="Team Member" className="w-full h-full object-cover mix-blend-overlay opacity-80" />
                </div>
            </div>
         </div>
      </section>

      {/* 2. VALUES GRID BLOCK */}
      <section className="relative w-full py-40 border-t border-[#111]/10">
         <div className="absolute inset-0 flex justify-evenly pointer-events-none z-0">
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
         </div>

         <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-20">
               <span className="text-[10px] font-mono tracking-[0.2em] text-[#555] mb-4 uppercase block">How We work</span>
               <h2 className="text-[48px] lg:text-[56px] font-medium tracking-tight text-[#111] leading-tight">
                   Our Values
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-[#111]/10">
                {/* Card 1 */}
                <div className="p-12 border-b border-r border-[#111]/10 flex flex-col md:flex-row gap-6 hover:bg-white/50 transition-colors">
                    <Trophy className="w-8 h-8 text-[#111] shrink-0" strokeWidth={1.5} />
                    <div>
                        <h3 className="text-2xl font-bold text-[#111] tracking-tight mb-4">Pursue Excellence</h3>
                        <p className="text-[#444] leading-relaxed text-lg text-pretty">
                            We reject the idea of okay or good enough. We give best and help others around us do the same, especially when it's difficult. We hold ourselves and each other to a high bar, putting in effort to meet it. We set ambitious goals, embrace feedback, and push learning and improving—because excellence doesn't just happen, it's earned.
                        </p>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="p-12 border-b border-r border-[#111]/10 flex flex-col md:flex-row gap-6 hover:bg-white/50 transition-colors">
                    <Handshake className="w-8 h-8 text-[#111] shrink-0" strokeWidth={1.5} />
                    <div>
                        <h3 className="text-2xl font-bold text-[#111] tracking-tight mb-4">Embrace the Effort</h3>
                        <p className="text-[#444] leading-relaxed text-lg text-pretty">
                            What we're doing is hard—and that's part of what makes it worth it. We're motivated by the mission, and we know <em className="font-serif">how</em> we work together matters just as much as <em className="font-serif">what</em> we achieve. We show up with positive intent, build trust on purpose, and find joy in the work—especially when we're in the trenches together.
                        </p>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="p-12 border-b border-r border-[#111]/10 flex flex-col md:flex-row gap-6 hover:bg-white/50 transition-colors">
                    <Users className="w-8 h-8 text-[#111] shrink-0" strokeWidth={1.5} />
                    <div>
                        <h3 className="text-2xl font-bold text-[#111] tracking-tight mb-4">Take Ownership</h3>
                        <p className="text-[#444] leading-relaxed text-lg text-pretty">
                            We take pride in what we do and hold ourselves accountable—not just for our success, but for the team's. We don't wait for things to happen; we make them happen. If we see a problem, we run it down to the outcome.
                        </p>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="p-12 border-b border-r border-[#111]/10 flex flex-col md:flex-row gap-6 hover:bg-white/50 transition-colors">
                    <HeartHandshake className="w-8 h-8 text-[#111] shrink-0" strokeWidth={1.5} />
                    <div>
                        <h3 className="text-2xl font-bold text-[#111] tracking-tight mb-4">Obsess Over the Customer</h3>
                        <p className="text-[#444] leading-relaxed text-lg text-pretty">
                            We put the customer at the center of everything we do - building long-term, trusted relationships that go beyond transactions. We strive to deeply understand both internal and external customers to better serve the mission of transforming organizational operations.
                        </p>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* 3. ADVISORS CAROUSEL BLOCK */}
      <section className="relative w-full py-40 bg-[#f4f2ee] border-t border-[#111]/10 overflow-hidden">
         <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col">
            <div className="flex w-full justify-between items-end mb-16">
                <h2 className="text-[48px] lg:text-[56px] font-medium tracking-tight text-[#111] leading-tight">
                   Our Advisors
                </h2>
                <div className="flex gap-4">
                    <button className="w-12 h-12 rounded-full border border-[#111]/20 flex items-center justify-center hover:bg-[#111] hover:text-white transition-colors group">
                        <ChevronLeft className="w-5 h-5 text-[#c9622d] group-hover:text-white" />
                    </button>
                    <button className="w-12 h-12 rounded-full border border-[#111]/20 flex items-center justify-center hover:bg-[#111] hover:text-white transition-colors group">
                        <ChevronRight className="w-5 h-5 text-[#c9622d] group-hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Horizontal Scroll Track */}
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar">
                
                {/* Advisor 1 */}
                <div className="min-w-[300px] max-w-[300px] flex flex-col snap-start shrink-0">
                   <div className="w-full aspect-[4/5] bg-gray-300 rounded-[1.5rem] mb-6 overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                       <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" className="w-full h-full object-cover" alt="Monica" />
                   </div>
                   <h3 className="text-[26px] font-medium text-[#111] tracking-tight mb-2">Monica Million</h3>
                   <p className="text-sm text-[#555] leading-snug">Past President, NENA and CEO, Million Consulting Services</p>
                </div>

                {/* Advisor 2 */}
                <div className="min-w-[300px] max-w-[300px] flex flex-col snap-start shrink-0">
                   <div className="w-full aspect-[4/5] bg-gray-300 rounded-[1.5rem] mb-6 overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                       <img src="https://images.unsplash.com/photo-1543132220-4bf5292c9e8c?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover" alt="Cathy" />
                   </div>
                   <h3 className="text-[26px] font-medium text-[#111] tracking-tight mb-2">Cathy Lanier</h3>
                   <p className="text-sm text-[#555] leading-snug">Former Police Chief, Washington DC</p>
                </div>

                {/* Advisor 3 */}
                <div className="min-w-[300px] max-w-[300px] flex flex-col snap-start shrink-0">
                   <div className="w-full aspect-[4/5] bg-gray-300 rounded-[1.5rem] mb-6 overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                       <img src="https://images.unsplash.com/photo-1508214751196-bfdd4ca4ccaa?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Marcia" />
                   </div>
                   <h3 className="text-[26px] font-medium text-[#111] tracking-tight mb-2">Marcia Thompson</h3>
                   <p className="text-sm text-[#555] leading-snug">Civil Rights Attorney, Aurora University</p>
                </div>

                {/* Advisor 4 */}
                <div className="min-w-[300px] max-w-[300px] flex flex-col snap-start shrink-0">
                   <div className="w-full aspect-[4/5] bg-gray-300 rounded-[1.5rem] mb-6 overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                       <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover" alt="Ed" />
                   </div>
                   <h3 className="text-[26px] font-medium text-[#111] tracking-tight mb-2">Ed Davis</h3>
                   <p className="text-sm text-[#555] leading-snug">Former Commissioner, Boston Police Department</p>
                </div>

            </div>
         </div>
         {/* Faded vertical track lines background */}
         <div className="absolute inset-0 flex justify-evenly pointer-events-none z-0">
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
         </div>
      </section>

      {/* 4. MASSIVE AMBER GRADIENT CTA & GRID */}
      <section className="relative w-full pt-12 pb-40 overflow-hidden bg-[#f4f2ee]">
         
         <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-20 flex flex-col gap-6">
             
             {/* News/Stories Grid (Now sitting directly on the section background) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                 {/* Story Card */}
                 <div className="border border-[#111]/10 bg-white/40 rounded-xl p-10 min-h-[220px] flex flex-col justify-center transform hover:scale-[1.01] transition-transform backdrop-blur-sm cursor-pointer hover:bg-white/60">
                     <span className="text-[11px] font-mono tracking-widest text-[#111]/70 mb-3 uppercase font-bold text-center w-full">OCTOBER 23RD, 2024</span>
                     <h3 className="text-[28px] font-medium text-[#111] tracking-tight leading-tight text-center">
                         Hamilton County Telecommunicator Saves a Life with T-CPR and Prepared
                     </h3>
                 </div>

                 {/* Story Card */}
                 <div className="border border-[#111]/10 bg-white/40 rounded-xl p-10 min-h-[220px] flex flex-col justify-center transform hover:scale-[1.01] transition-transform backdrop-blur-sm cursor-pointer hover:bg-white/60">
                     <span className="text-[11px] font-mono tracking-widest text-[#111]/70 mb-3 uppercase font-bold text-center w-full">JULY 16TH, 2024</span>
                     <h3 className="text-[28px] font-medium text-[#111] tracking-tight leading-tight text-center">
                         Palm Beach Uses Prepared to Rescue Swimmer Lost in Rip Current
                     </h3>
                 </div>

                 {/* Story Card */}
                 <div className="border border-[#111]/10 bg-white/40 rounded-xl p-10 min-h-[220px] flex flex-col justify-center transform hover:scale-[1.01] transition-transform backdrop-blur-sm cursor-pointer hover:bg-white/60">
                     <span className="text-[11px] font-mono tracking-widest text-[#111]/70 mb-3 uppercase font-bold text-center w-full">JUNE 28TH, 2024</span>
                     <h3 className="text-[28px] font-medium text-[#111] tracking-tight leading-tight text-center">
                         Poudre Fire Uses Prepared to Rescue Accident Victim
                     </h3>
                 </div>

                 {/* Story Card */}
                 <div className="border border-[#111]/10 bg-white/40 rounded-xl p-10 min-h-[220px] flex flex-col justify-center transform hover:scale-[1.01] transition-transform backdrop-blur-sm cursor-pointer hover:bg-white/60">
                     <span className="text-[11px] font-mono tracking-widest text-[#111]/70 mb-3 uppercase font-bold text-center w-full">NOVEMBER 14TH, 2023</span>
                     <h3 className="text-[28px] font-medium text-[#111] tracking-tight leading-tight text-center">
                         Akron PD Uses Prepared to Locate and Save Shooting Victim
                     </h3>
                 </div>
             </div>

             {/* Gradient Banner */}
             <div className="w-full min-h-[350px] rounded-2xl bg-gradient-to-br from-[#3b0d1e] via-[#b64b1d] to-[#e49b6b] p-12 flex flex-col justify-center relative overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 blur-2xl"></div>
                 <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-8 text-white">
                     <div className="flex flex-col">
                        <span className="text-[12px] font-mono tracking-[0.2em] text-white/70 mb-6 uppercase">JOIN OUR MISSION</span>
                        <h2 className="text-[56px] lg:text-[72px] font-medium tracking-tight leading-[1] max-w-lg mb-8">
                            Make an impact. Save lives.
                        </h2>
                        <div>
                           <Link to="#" className="px-6 py-3 border border-white text-white font-medium hover:bg-white hover:text-[#b64b1d] transition-colors rounded">
                               View Open Roles
                           </Link>
                        </div>
                     </div>
                     <ArrowRight className="w-24 h-24 text-white opacity-80 shrink-0 stroke-[1px]" />
                 </div>
             </div>

         </div>
         {/* Faded vertical track lines background spanning the gap */}
         <div className="absolute inset-0 flex justify-evenly pointer-events-none z-0">
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
             <div className="w-[1px] h-full bg-[#111]/5"></div>
         </div>
      </section>

      <PreparedFooter />
    </main>
  );
}
