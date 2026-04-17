export function InsightsGrid() {
  const articles = [
    {
      tag: "THE BIG IDEA",
      title: "The 24/7 Delivery Cycle Starts with AI-Powered DevOps",
      desc: "The AI train for software development, that is. More than 75% of developers use artificial intelligence in their development cycle...",
      image: "/images/insights/insight-1.jpg",
    },
    {
      tag: "GENIUS ROOM",
      title: "Inside the Architecture of Self-Improving LLM Agents",
      desc: "As LLMs like GPT-4 become more powerful, the question is no longer \"What can they generate?\" but \"How can they analyze and self-improve?\"...",
      image: "/images/insights/insight-2.jpg",
    },
    {
      tag: "THE BIG IDEA",
      title: "How Tech Leaders Can Win the AI Talent War",
      desc: "The AI talent wars that were “heating up” are now reaching nuclear levels. The talent shortage has reaching at an all time high...",
      image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=format&fit=crop&q=80",
    }
  ];

  return (
    <section className="relative w-full py-16 bg-transparent z-20">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 flex flex-col items-center">
        
        <div className="text-center max-w-3xl mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-indigo-950 leading-tight mb-6">
            Insights for leaders building AI systems
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Research, analysis, and perspectives on building, deploying, and scaling AI systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {articles.map((article, idx) => (
            <div key={idx} className="flex flex-col group cursor-pointer">
              <div className="w-full aspect-[4/3] rounded-none overflow-hidden mb-8 bg-slate-50 border border-slate-100 shadow-sm">
                 <img 
                   src={article.image} 
                   alt={article.title} 
                   className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                 />
              </div>
              <span className="bg-slate-100 text-slate-500 font-extrabold text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-none w-max mb-6">
                {article.tag}
              </span>
              <h3 className="text-2xl font-bold text-indigo-950 mb-4 leading-snug group-hover:text-indigo-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-slate-500 text-[15px] leading-relaxed font-medium">
                {article.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
