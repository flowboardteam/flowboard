import { useState } from "react";

export function PreparedHowItWorks() {
  const [activeTab, setActiveTab] = useState(2);

  const tabs = [
    {
      num: "01",
      title: "AI Voice Assistant, Dynamic Caller Experience",
      desc: "Our conversational voice assistant seamlessly triages and processes calls based on custom SOPs."
    },
    {
      num: "02",
      title: "Bilingual",
      desc: "The system automatically detects caller language and converses natively to ensure accurate information gathering."
    },
    {
      num: "03",
      title: "Human-in-the-Loop",
      desc: "Emergencies are seamlessly, immediately transferred to call-takers."
    }
  ];

  return (
    <section className="relative w-full py-12 z-20 bg-[#F0EFE9]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        <div className="w-full relative rounded-none overflow-hidden shadow-2xl bg-[radial-gradient(circle_at_80%_40%,_#d24621_0%,_#7a160d_50%,_#380905_100%)] flex flex-col lg:flex-row gap-16 p-12 lg:p-20 has-noise">
          
          {/* Left Content */}
          <div className="flex-1 w-full max-w-sm relative z-10">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-16 tracking-tight">How it Works</h2>
            
            <div className="flex flex-col border-t border-white/20">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <div key={idx} className={`border-b border-white/20 transition-all duration-300 ${isActive ? 'bg-white/10' : ''}`}>
                    <button
                      onClick={() => setActiveTab(idx)}
                      className="w-full py-6 px-4 text-left flex flex-col items-start group"
                    >
                      <div className="rounded-none border border-white/40 w-8 h-8 flex items-center justify-center text-xs text-white/80 mb-3 group-hover:border-white transition-colors tracking-widest font-mono">
                        {tab.num}
                      </div>
                      <h3 className={`text-xl font-medium pr-8 transition-colors ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                        {tab.title}
                      </h3>
                      
                      {/* Active Description */}
                      <div className={`overflow-hidden transition-all duration-500 ease-in-out w-full mt-4 ${isActive ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                        <p className="text-white/90 text-[15px] leading-relaxed border-l-[3px] border-[#ff3b00] pl-4 py-1">
                          {tab.desc}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Dashboard Mockup */}
          <div className="flex-[1.5] w-full flex items-center justify-center relative z-10">
            
            {/* Base UI Frame */}
            <div className="w-full max-w-xl aspect-[1.4] bg-[#2a2a2a]/60 backdrop-blur-md rounded-none border border-white/10 shadow-2xl p-6 flex flex-col overflow-hidden text-left relative transform rotate-1 scale-105">
              <h4 className="text-2xl font-medium text-white mb-2">Non-Emergency</h4>
              <p className="text-white/60 text-xs mb-8">Agent &gt; Intents</p>
              
              <div className="flex items-center text-[10px] text-white/40 uppercase tracking-widest pb-3 border-b border-white/10">
                <span className="w-1/4">Intent Name</span>
                <span className="flex-1">Description</span>
              </div>
              
              <div className="flex flex-col gap-4 mt-4 relative z-0 opacity-30 pointer-events-none">
                <div className="flex items-start text-xs text-white/60">
                   <span className="w-1/4 pt-1 font-mono">hot_fire</span>
                   <span className="flex-1">A 'hot' fire call typically refers to a situation where the fire is no longer actively burning or is under control...</span>
                </div>
                <div className="flex items-start text-xs text-white/60">
                   <span className="w-1/4 pt-1 font-mono">cold_fire</span>
                   <span className="flex-1">A 'cold' fire typically refers to a situation where the fire is actively burning...</span>
                </div>
                <div className="flex items-start text-xs text-white/60">
                   <span className="w-1/4 pt-1 font-mono">hot_law_enforcement</span>
                   <span className="flex-1">A 'hot' law enforcement call involves an active crime...</span>
                </div>
              </div>

              {/* Active Hover Modal Block */}
              <div className="absolute top-1/3 -ml-12 w-[110%] bg-[#2b2b2b] p-4 rounded-none border border-white/10 shadow-2xl z-20 flex items-center pr-6">
                 <div className="w-1/4 text-white text-xs font-mono">medical</div>
                 <div className="flex-1 text-white/80 text-xs pr-4">Any medical call where it's very clear that the caller is experiencing something that could put them in harm's way</div>
                 <div className="w-32 text-white/60 text-[10px]">No additional questions</div>
                 <button className="px-4 py-2 bg-transparent border border-[#ff3b00]/60 text-white/90 text-[11px] rounded-none transition-colors hover:bg-white/5">Transfer Call</button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
