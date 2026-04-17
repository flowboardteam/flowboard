export function PreparedQuoteBanner() {
  return (
    <section className="relative w-full py-12 z-20 bg-[#F0EFE9]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col gap-16">
        
        {/* Top 3-Column Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <p className="text-[#272522] text-xl font-medium leading-relaxed pr-8">
            When emergency call volumes are high, don't lose call-taker time to the admin line.
          </p>
          <p className="text-[#272522] text-xl font-medium leading-relaxed pr-8">
            Community members get the help they need, whether they speak English or Spanish.
          </p>
          <p className="text-[#272522] text-xl font-medium leading-relaxed pr-8">
            See all call data, emergency and non-emergency, in a centralized platform on a single screen.
          </p>
        </div>

        {/* Bottom Colorful Quote Banner */}
        <div className="w-full relative rounded-none overflow-hidden shadow-xl bg-[linear-gradient(135deg,_#28217D_0%,_#8F4F8D_45%,_#EE8B41_100%)] min-h-[360px] flex items-center">
          
          {/* Complex Geometric SVG Overlay */}
          <div className="absolute inset-y-0 right-0 w-[60%] h-full pointer-events-none opacity-80" style={{ mixBlendMode: 'overlay' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <circle cx="500" cy="200" r="300" fill="none" stroke="white" strokeWidth="1.5" />
              <circle cx="650" cy="250" r="100" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="650" cy="250" r="220" fill="none" stroke="white" strokeWidth="1" strokeDasharray="6 8" />
              <circle cx="650" cy="250" r="350" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 6" />
              {/* Crossing axes */}
              <line x1="100" y1="200" x2="800" y2="200" stroke="white" strokeWidth="1" strokeDasharray="5 5" opacity="0.5" />
            </svg>
          </div>

          <div className="relative z-10 w-full max-w-3xl px-12 lg:px-20 py-16">
            <p className="text-white text-3xl font-medium leading-normal lg:text-3xl mb-8 font-serif sm:font-sans track-tight">
              "We have some SOPs that contain multiple level decision trees...with the Prepared system...we've been able to get the caller help in about a minute."
            </p>
            <div className="text-white/90 text-sm font-bold tracking-widest uppercase font-mono">
              Michael Berry, Director, Summit 911
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
