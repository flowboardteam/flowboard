import { ChevronDown, Send } from "lucide-react";

export function PreparedHero() {
  return (
    <section className="relative w-full pt-20 pb-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col items-center gap-16">
        
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

        {/* Structural Horizontal Line */}
        <div className="absolute top-[45%] left-0 w-full h-[1px] bg-white/[0.05] z-10 pointer-events-none"></div>

        {/* Top Centered Content */}
        <div className="w-full max-w-4xl text-white z-20 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] leading-[1.05] tracking-tight mb-8">
            The <span className="italic font-bold">only</span> hr suite you’ll<br className="hidden sm:block"/>ever need
          </h1>
          <p className="text-lg lg:text-xl font-light text-white/90 leading-relaxed max-w-2xl mb-10">
            Custom-engineered hiring and talent management platform to deliver enterprise-level projects at scale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button className="w-full sm:w-auto px-8 py-3.5 border border-white text-white font-medium rounded-none transition-colors text-lg hover:bg-white/10">
              Learn How
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-[#161616] border border-[#161616] text-white font-medium rounded-none transition-colors text-lg hover:bg-black shadow-2xl">
              Request Demo
            </button>
          </div>
        </div>

        {/* Bottom Full-Width Long Graphic */}
        <div className="w-full relative z-20 flex justify-center mt-4">
          <div className="relative w-full max-w-5xl aspect-[16/9] lg:aspect-[2.3/1] rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20 transform hover:scale-[1.01] transition-transform duration-700">
            <video 
              src="/herovideo.mov" 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Subtle Gradient Overlay so it blends with the dark theme */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1E1E1E] to-transparent pointer-events-none"></div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
