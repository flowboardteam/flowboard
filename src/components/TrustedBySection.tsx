"use client";

export function TrustedBySection() {
  // Using Simple Icons slug names for the logos
  const companies = [
    { name: "Stripe", slug: "stripe" },
    { name: "Notion", slug: "notion" },
    { name: "Figma", slug: "figma" },
    { name: "Vercel", slug: "vercel" },
    { name: "Linear", slug: "linear" },
    { name: "Raycast", slug: "raycast" },
    { name: "Framer", slug: "framer" },
    { name: "Webflow", slug: "webflow" },
  ];

  return (
    <section className="py-16 bg-white dark:bg-[#0B0F1A] border-y border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-xs font-bold text-slate-400 mb-12 uppercase tracking-[0.2em]">
          Powering the world's most innovative teams
        </p>

        {/* The Masking Container: Fades logos at the edges */}
        <div className="relative overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:from-white dark:before:from-[#0B0F1A] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l after:from-white dark:after:from-[#0B0F1A] after:to-transparent">
          
          <div className="flex gap-16 animate-scroll-logos w-max">
            {/* Doubling the array to create a seamless infinite loop */}
            {[...companies, ...companies, ...companies].map((company, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default group"
              >
                <img
                  src={`https://cdn.simpleicons.org/${company.slug}/64748b`} 
                  alt={company.name}
                  className="w-8 h-8 object-contain group-hover:filter-none transition-all"
                  // This hex code (64748b) matches Tailwind's slate-500
                />
                <span className="text-xl font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll-logos {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
}