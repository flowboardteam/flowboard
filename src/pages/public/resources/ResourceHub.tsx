import { PreparedNavbar } from "@/components/landing/PreparedNavbar";
import { PreparedFooter } from "@/components/landing/PreparedFooter";
import { ArrowRight, ChevronLeft, ChevronRight, FileText, Play, BookOpen, Download, HelpCircle, Users, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function ResourceHub() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-[#ffb038] selection:text-[#111]">
      <PreparedNavbar />
      
      {/* --- HERO: FEATURED AND TRENDING --- */}
      <section className="pt-40 lg:pt-48 pb-20 px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="mb-12">
           <span className="text-[10px] font-mono tracking-[0.3em] text-[#888] uppercase block mb-4">RESOURCES HUB</span>
           <h1 className="text-[56px] lg:text-[84px] font-medium tracking-tight text-[#111] leading-[1.05]">
             Insights for the<br /><span className="italic font-serif">modern</span> workforce.
           </h1>
        </div>
        
        <div className="group cursor-pointer">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-[#111]/10 overflow-hidden bg-[#fdfcfa]">
            <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto bg-gray-100 overflow-hidden relative">
               <img 
                 src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                 alt="Featured" 
               />
               <div className="absolute top-8 left-8 bg-white px-4 py-2 flex items-center gap-2 shadow-xl">
                  <Play className="w-4 h-4 text-[#111] fill-[#111]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#111]">Watch Keynote</span>
               </div>
            </div>
            <div className="lg:col-span-5 p-12 lg:p-20 flex flex-col justify-center border-l border-[#111]/10">
               <div className="flex items-center gap-3 mb-8">
                 <span className="w-10 h-[1px] bg-[#111]"></span>
                 <span className="text-[11px] font-bold uppercase tracking-widest text-[#111]">Featured Trending</span>
               </div>
               <h2 className="text-[40px] lg:text-[48px] font-medium leading-[1.1] text-[#111] mb-10 group-hover:text-[#555] transition-colors tracking-tight">
                 State of Global Hiring Report 2026
               </h2>
               <p className="text-xl text-[#444] leading-relaxed mb-12 max-w-xl">
                 Our 2026 definitive study on how the top 1% of global teams are managing talent, compliance, and culture in the age of borderless work.
               </p>
               <Link to="#" className="flex items-center gap-4 text-lg font-bold group/btn translate-y-0 hover:-translate-y-1 transition-transform duration-300">
                 Read full report <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEWS & ARTICLES --- */}
      <section className="py-32 px-6 lg:px-12 max-w-[1440px] mx-auto border-t border-gray-100">
        <div className="flex justify-between items-end mb-20">
          <div>
             <h2 className="text-[44px] lg:text-[56px] font-medium tracking-tight text-[#111] mb-4">Latest updates</h2>
             <p className="text-lg text-[#666]">News and deep-dives from our engineering and legal teams.</p>
          </div>
          <button className="px-10 py-5 border border-[#111] text-[#111] font-bold hover:bg-[#111] hover:text-white transition-all">Explore all news</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           <ArticleCard 
             category="Policy"
             title="How to Equip Your Remote Team in Spain with Flowboard IT"
             img="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
           />
           <ArticleCard 
             category="Compliance"
             title="Navigating Compliance: Hiring Contractors in Brazil vs Mexico"
             img="https://images.unsplash.com/photo-1454165833767-13a6ad0a78b6?q=80&w=2070&auto=format&fit=crop"
           />
           <ArticleCard 
             category="Strategy"
             title="Employer of Record for Mine Construction and Exploration Projects"
             img="https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?q=80&w=2070&auto=format&fit=crop"
           />
        </div>
      </section>

      {/* --- TOPICS SCROLL --- */}
      <section className="py-32 px-6 lg:px-12 bg-[#0a0a0a] text-white">
        <div className="max-w-[1440px] mx-auto mb-20 flex justify-between items-end">
           <div>
              <h2 className="text-[44px] lg:text-[56px] font-medium tracking-tight mb-4">Browse by topic</h2>
              <p className="text-white/60 text-lg">Deep dives into the mechanics of global work.</p>
           </div>
           <div className="flex gap-4">
              <button className="p-5 border border-white/20 rounded-full hover:bg-white/10 transition-colors"><ChevronLeft className="w-8 h-8" /></button>
              <button className="p-5 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"><ChevronRight className="w-8 h-8" /></button>
           </div>
        </div>
        
        <div className="flex gap-10 overflow-x-auto pb-10 scrollbar-hide px-0">
           <TopicCard title="Global Expansion" img="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2006&auto=format&fit=crop" />
           <TopicCard title="Legal & Compliance" img="https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070&auto=format&fit=crop" />
           <TopicCard title="AI in HR & Payroll" img="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop" />
           <TopicCard title="Immigration" img="https://images.unsplash.com/photo-1436450412740-6b988f486c6b?q=80&w=2070&auto=format&fit=crop" />
        </div>
      </section>

      {/* --- HELP CENTER & GUIDES --- */}
      <section className="py-32 px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4">
                <span className="text-[11px] font-mono tracking-widest text-[#888] mb-6 block uppercase">Help & Support</span>
                <h2 className="text-[48px] font-medium tracking-tight text-[#111] mb-8 leading-[1.1]">The Guide Library</h2>
                <p className="text-xl text-[#444] leading-relaxed mb-12">
                  Everything you need to set up, manage, and scale your global workforce from scratch.
                </p>
                <div className="p-10 bg-[#fdfcfa] border border-gray-100 flex flex-col gap-8">
                   <h3 className="text-2xl font-bold">Search the Help Center</h3>
                   <div className="relative">
                      <input type="text" placeholder="Search for answers..." className="w-full h-14 border-b-2 border-[#111] bg-transparent text-lg focus:outline-none" />
                      <HelpCircle className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-[#111]" />
                   </div>
                </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <GuideCard 
                  type="Manual"
                  title="2026 Global Payroll Strategy: A Masterclass"
                  icon={<BookOpen className="w-10 h-10 text-emerald-600" />}
                />
                <GuideCard 
                  type="Download"
                  title="Remote Infrastructure & Hardware Provisioning Template"
                  icon={<Download className="w-10 h-10 text-blue-600" />}
                />
                <GuideCard 
                  type="Audit"
                  title="Compliance Health Check: Avoiding Remote Legal Pitfalls"
                  icon={<FileText className="w-10 h-10 text-amber-600" />}
                />
                <GuideCard 
                  type="Playbook"
                  title="Culture & Onboarding in Discord-Native Teams"
                  icon={<Users className="w-10 h-10 text-purple-600" />}
                />
            </div>
        </div>
      </section>

      {/* --- CAREERS & PARTNERS --- */}
      <section className="py-24 px-6 lg:px-12 border-t border-gray-100 bg-[#fdfcfa]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-1 px-4">
            <CtaBox 
              title="Work with us"
              desc="We're always looking for the best talent to build the future of work."
              btnText="View open positions"
              icon={<Briefcase className="w-8 h-8" />}
              to="/careers/open-positions"
            />
            <CtaBox 
              title="Partner program"
              desc="Scale your service offerings with Flowboard's global infrastructure."
              btnText="Become a partner"
              icon={<Users className="w-8 h-8" />}
              to="/partners/apply"
            />
        </div>
      </section>

      <PreparedFooter />
    </main>
  );
}

function ArticleCard({ category, title, img }: { category: string; title: string; img: string }) {
  return (
    <div className="group cursor-pointer">
       <div className="aspect-[4/3] bg-gray-100 mb-10 overflow-hidden relative">
          <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt={title} />
          <div className="absolute top-0 left-0 w-full h-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
             <span className="px-8 py-3 bg-white text-black font-bold scale-90 group-hover:scale-100 transition-transform duration-500">Read Artcle</span>
          </div>
       </div>
       <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-gray-200">New</span>
          <span className="text-[10px] font-mono tracking-widest text-[#888] uppercase">{category}</span>
       </div>
       <h3 className="text-3xl font-medium tracking-tight text-[#111] group-hover:text-[#555] transition-colors leading-[1.1]">{title}</h3>
    </div>
  );
}

function TopicCard({ title, img }: { title: string; img: string }) {
  return (
    <div className="min-w-[400px] h-[550px] relative group cursor-pointer overflow-hidden border border-white/5">
      <img src={img} className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt={title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
      <div className="absolute bottom-12 left-12 right-12">
        <span className="text-[10px] font-mono tracking-widest text-white/50 mb-4 block uppercase">LEARNING TRACK</span>
        <h3 className="text-[32px] font-medium tracking-tight text-white mb-8 leading-tight">{title}</h3>
        <button className="flex items-center gap-3 text-sm font-bold group-hover:gap-5 transition-all">
          Explore Topic <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function GuideCard({ type, title, icon }: { type: string; title: string; icon: React.ReactNode }) {
  return (
    <div className="p-12 bg-white border border-[#111]/5 hover:border-[#111]/20 hover:shadow-2xl transition-all duration-700 group cursor-pointer flex flex-col items-start gap-10">
       <div className="p-6 bg-gray-50 rounded-sm">
          {icon}
       </div>
       <div className="flex flex-col gap-4">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#888] uppercase">{type}</span>
          <h3 className="text-2xl font-medium leading-tight text-[#111] group-hover:translate-x-2 transition-transform duration-500">{title}</h3>
       </div>
    </div>
  );
}

function CtaBox({ title, desc, btnText, icon, to }: { title: string; desc: string; btnText: string; icon: React.ReactNode; to: string }) {
  return (
    <Link to={to} className="bg-white p-12 lg:p-20 border border-[#111]/5 hover:bg-[#111] group transition-all duration-700 cursor-pointer block">
       <div className="text-[#111] group-hover:text-white transition-colors mb-12">
          {icon}
       </div>
       <h3 className="text-4xl lg:text-5xl font-medium text-[#111] group-hover:text-white transition-colors mb-8 tracking-tight">{title}</h3>
       <p className="text-xl text-[#555] group-hover:text-white/70 transition-colors mb-12 max-w-sm">{desc}</p>
       <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-[#111] group-hover:text-white transition-colors">
          {btnText} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
       </div>
    </Link>
  );
}
