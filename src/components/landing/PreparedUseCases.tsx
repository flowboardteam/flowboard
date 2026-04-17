import { ArrowRight } from "lucide-react";

export function PreparedUseCases() {
  const cases = [
    {
      type: "Blog",
      title: "Prepared's NPSTW 2026 Telecommunicator Spotlights",
      tags: ["911"],
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80",
      topSub: "Prepared",
      topTitle: "NPSTW Telecommunicator Spotlight"
    },
    {
      type: "Case Study",
      title: "Delaware County Streamlines Spanish Call Processing with Text-to-Voice Translation",
      tags: ["911", "CALL-TAKING", "TRANSLATION"],
      image: null,
      topSub: "",
      topTitle: "CASE STUDY"
    },
    {
      type: "Case Study",
      title: "Baltimore 911 Improves Call Processing Efficiency with Assistive AI",
      tags: ["911", "CALL-TAKING", "SUPERVISOR"],
      image: null,
      topSub: "",
      topTitle: "CASE STUDY"
    }
  ];

  return (
    <section className="relative w-full py-20 z-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-10">
        
        {/* Left Column */}
        <div className="lg:w-1/3 flex flex-col items-start pt-8">
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Use Cases<br/>& Media<br/>Features
          </h2>
          <button className="px-6 py-3 border border-slate-300 hover:border-slate-900 text-slate-900 font-medium rounded-none transition-colors text-sm shadow-sm">
            View All Case Studies
          </button>
        </div>

        {/* Right Cards */}
        <div className="lg:w-2/3 flex gap-4 overflow-x-auto pb-8 scrollbar-hide">
          {cases.map((item, idx) => (
            <div key={idx} className="flex-shrink-0 w-[320px] rounded-none overflow-hidden bg-white border border-slate-200 shadow-xl flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
              
              {/* Top Half container */}
              <div className="h-48 relative border-b border-slate-100">
                {item.image ? (
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent p-6 flex flex-col justify-center">
                      <span className="text-white font-bold text-sm mb-2">{item.topSub}</span>
                      <h4 className="text-white text-lg font-medium leading-snug max-w-[180px]">{item.topTitle}</h4>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-slate-50 p-6 flex items-center justify-center">
                     <div className="w-full h-full border border-slate-200 rounded-none flex items-center justify-start p-6 bg-gradient-to-br from-slate-100 to-transparent shadow-sm">
                        <h4 className="text-slate-800 text-2xl font-mono tracking-widest">{item.topTitle}</h4>
                     </div>
                  </div>
                )}
              </div>

              {/* Bottom Half container */}
              <div className="flex-1 bg-gradient-to-b from-white via-white to-orange-50 p-6 flex flex-col group-hover:to-orange-100 transition-all duration-300">
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-800 text-white text-[10px] font-bold tracking-wider rounded-none uppercase shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs font-semibold text-[#111]/60 uppercase tracking-widest mb-2 font-mono">{item.type}</div>
                <h3 className="text-xl font-medium text-[#111] leading-snug mb-8 flex-1">{item.title}</h3>
                <div className="flex items-center gap-2 text-[#111] text-sm font-semibold mt-auto">
                  Read more <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
