import { Play } from "lucide-react";

export function PreparedVideoCallout() {
  return (
    <section className="relative w-full py-12 z-20 bg-[#F0EFE9]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        <div className="w-full relative rounded-none overflow-hidden shadow-2xl bg-[radial-gradient(ellipse_at_bottom_right,_#f2b066_0%,_#e67817_45%,_#592d13_100%)] flex flex-col md:flex-row items-center gap-12 p-8 lg:p-16">
          
          {/* Left Video Element */}
          <div className="w-full md:w-[55%] relative rounded-none overflow-hidden border border-white/20 shadow-2xl aspect-[16/9] group cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80" 
              alt="CEO Michael Chime Interview" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-none border-[1.5px] border-white/60 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <Play className="w-8 h-8 text-white ml-1 opacity-90" />
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="w-full md:w-[45%] flex flex-col text-white pl-4 lg:pl-8">
            <span className="text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase mb-4 font-mono">
              Non-Emergency Triage
            </span>
            <h2 className="text-3xl lg:text-4xl font-medium leading-[1.1] tracking-tight mb-6">
              Rethink Non-<br/>Emergency Calls
            </h2>
            <p className="text-white/90 text-[17px] leading-relaxed max-w-[400px]">
              CEO Michael Chime and three 911 leaders discuss why Prepared's dynamic AI voice assistant can be, or already is, the solution for their agency's non-emergency call challenges.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
