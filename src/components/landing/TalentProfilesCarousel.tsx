import { useRef } from "react";

export function TalentProfilesCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const profiles = [
    {
      name: "Taiwo O.",
      role: "AI Native Full-Stack Engineer",
      former: "Formerly at Paystack",
      headline: "Builds AI-native, cloud platforms with Kubernetes Docker, and AWS.",
      image: "/images/talent/taiwo.jpg",
      logo: "/images/logos/paystack.png"
    },
    {
      name: "Syed A.",
      role: "Senior Data Engineer",
      former: "Formerly at Nvidia",
      headline: "Engineers scalable data platforms powering AI-driven analytics & efficiency.",
      image: "/images/talent/syed.jpg",
      logo: "/images/logos/nvidia.jpg"
    },
    {
      name: "El-Moatasem M.",
      role: "Mobile Developer (AI-Native)",
      former: "Formerly at Microsoft",
      headline: "Builds AI-native mobile apps with deep expertise in Swift and Objective-C.",
      image: "/images/talent/elmoatasem.jpg",
      logo: "/images/logos/microsoft.jpg"
    },
    {
      name: "Chukwuma K.",
      role: "Cloud Architect",
      former: "Formerly at Amazon",
      headline: "Optimizes massive Kubernetes clusters for high-availability AI services.",
      image: "/images/talent/chukwuma.jpg",
      logo: "/images/logos/amazon.png"
    },
    {
      name: "Amara E.",
      role: "AI Researcher",
      former: "AI Researcher at OPay",
      headline: "Specializes in fine-tuning Large Language Models for niche corporate domains.",
      image: "/images/talent/amara.jpg",
      logo: "/images/logos/opay.jpg"
    },
    {
      name: "Oluwatobi A.",
      role: "Frontend Architect",
      former: "Formerly at Microsoft",
      headline: "Focuses on building hyper-performant, accessible design systems at scale.",
      image: "/images/talent/oluwatobi.jpg",
      logo: "/images/logos/microsoft.jpg"
    },
    {
      name: "Ibrahim S.",
      role: "Security Engineer",
      former: "Formerly at Amazon Web Services",
      headline: "Hardens cloud infrastructure and AI pipelines against emerging threat vectors.",
      image: "/images/talent/ibrahim.jpg",
      logo: "/images/logos/amazon.png"
    }
  ];

  return (
    <section className="relative w-full py-24 bg-[#f1edff] z-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col items-center relative">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase mb-4 block">THE NETWORK</span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-indigo-950">
            Work with world-class engineers
          </h2>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={scrollLeft}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur rounded-none flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <svg className="w-6 h-6 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button 
          onClick={scrollRight}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur rounded-none flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <svg className="w-6 h-6 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Carousel Track */}
        <div 
          ref={scrollContainerRef}
          className="w-full flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 px-4"
        >
          {profiles.map((profile, i) => (
             <div 
               key={i} 
               className="flex-shrink-0 w-[320px] aspect-[3/4.5] rounded-none overflow-hidden relative snap-center shadow-xl group border border-slate-200 bg-white"
             >
               {/* Background Image - Reverted to object-top as requested */}
               <img src={profile.image} alt={profile.name} className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
               
               {/* Bottom Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                  
                  <h3 className="text-white text-xl font-medium leading-snug mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {profile.headline}
                  </h3>

                  <div className="flex justify-between items-end">
                     <div className="flex flex-col">
                        <span className="text-white font-bold text-sm tracking-tight">{profile.name}</span>
                        <span className="text-white/80 text-[11px] font-medium mt-1">{profile.role}</span>
                        <span className="text-white/60 text-[10px] mt-1">{profile.former}</span>
                     </div>
                     <div className="w-12 h-12 flex items-center justify-center mb-1">
                        <img 
                          src={profile.logo} 
                          alt="Company Logo" 
                          className="max-w-full max-h-full object-contain brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                        />
                     </div>
                  </div>

               </div>
             </div>
          ))}
        </div>

      </div>
    </section>
  );
}
