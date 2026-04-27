import { useEffect, useState } from "react";
import { PreparedNavbar } from "@/components/landing/PreparedNavbar";
import { PreparedFooter } from "@/components/landing/PreparedFooter";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Briefcase, DollarSign, Clock, Search, Building2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface JobRole {
  id: string;
  title: string;
  department: string | null;
  type: string;
  location: string;
  salary: string | null;
  experience_level: string | null;
  description: string;
  status: string;
  created_at: string;
  organization_name?: string;
  organization_avatar?: string;
}

export default function OpenPositions() {
  const [jobs, setJobs] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All types");

  useEffect(() => {
    async function fetchAllJobs() {
      setLoading(true);
      try {
        // 1. Direct roles table
        const { data: directRoles } = await supabase.from("roles").select("*").eq("status", "open");
        
        // 2. Scoped jobs from client prefs
        const { data: clients } = await supabase.from("profiles").select("*");

        let aggregated: JobRole[] = [];

        if (directRoles) {
          aggregated = directRoles.map(r => ({
            ...r,
            organization_name: "Flowboard Team"
          }));
        }

        (clients || []).forEach((client: any) => {
          const profileJobs = client.system_prefs?.public_jobs || [];
          profileJobs.forEach((job: any) => {
            if (job.status === "open") {
              aggregated.push({
                ...job,
                organization_name: job.organization_name || client.company_name || client.full_name || "Enterprise Partner",
                organization_avatar: job.organization_avatar || client.avatar_url
              });
            }
          });
        });

        // Sort by created_at desc
        aggregated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setJobs(aggregated);
      } catch (err) {
        console.error("Fetch all jobs error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllJobs();
  }, []);

  const filtered = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
                         (j.department || "").toLowerCase().includes(search.toLowerCase()) ||
                         (j.organization_name || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesType = selectedType === "All types" || j.type === selectedType;
    return matchesSearch && matchesType;
  });

  const jobTypes = ["All types", ...Array.from(new Set(jobs.map(j => j.type)))];

  return (
    <main className="min-h-screen bg-[#f4f2ee] font-jakarta selection:bg-[#ffb038] selection:text-[#111] overflow-x-hidden">
      <PreparedNavbar />
      
      <section className="relative w-full pt-40 pb-24">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>

          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <span className="absolute top-[8%] left-[4%] text-[8rem] font-black text-[#111]/[0.02] tracking-tighter uppercase whitespace-nowrap">HIRING</span>
            <span className="absolute top-[25%] right-[2%] text-[6rem] font-black text-[#111]/[0.02] tracking-tighter uppercase whitespace-nowrap rotate-6">TALENT POOL</span>
          </div>

          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
             <div className="text-center mb-16">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 block">Open positions</span>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#111] leading-[1.1] mb-6 uppercase">
                  JOB <span className="text-[#A079FF]">BOARD.</span>
                </h1>
                <p className="text-base text-slate-500 font-medium leading-[1.6] max-w-xl mx-auto tracking-tight">
                  Find top-tier roles for your expertise. Available only on Flowboard.
                </p>
             </div>

             {/* Search & Filters */}
             <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row gap-4 relative z-20">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by role, department, or company..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-[#EEEEF0] rounded-md text-sm font-medium focus:outline-none focus:border-[#A079FF] transition-all shadow-sm"
                  />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-6 py-4 bg-white border border-[#EEEEF0] rounded-md text-xs font-black uppercase tracking-widest cursor-pointer focus:outline-none focus:border-[#A079FF] transition-all shadow-sm"
                >
                  {jobTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
             </div>

             {/* Jobs List */}
             <div className="max-w-4xl mx-auto space-y-4 relative z-20 pb-20">
               {loading ? (
                 <div className="py-20 flex flex-col items-center justify-center">
                   <Loader2 className="w-10 h-10 text-[#A079FF] animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gathering listings...</p>
                 </div>
               ) : filtered.length > 0 ? (
                 filtered.map(job => (
                   <Link 
                     key={job.id} 
                     to={`/jobs/${job.id}`}
                     className="block p-6 lg:p-8 bg-white hover:bg-slate-50 border border-[#EEEEF0] hover:border-[#A079FF]/30 rounded-md transition-all hover:-translate-y-0.5 shadow-sm group"
                   >
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="space-y-3 flex-1">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-[#EEEEF0] shrink-0">
                             {job.organization_avatar ? (
                               <img src={job.organization_avatar} alt="" className="w-6 h-6 object-contain" />
                             ) : (
                               <Building2 className="w-4 h-4 text-slate-400" />
                             )}
                           </div>
                           <div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1C21]/40 block leading-none mb-1">
                               {job.organization_name}
                             </span>
                             <h2 className="text-xl font-black text-[#1A1C21] tracking-tight leading-tight group-hover:text-[#A079FF] transition-colors">
                               {job.title}
                             </h2>
                           </div>
                         </div>

                         <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-slate-500 pt-1">
                           <span className="flex items-center gap-1.5">
                             <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                           </span>
                           <span className="flex items-center gap-1.5">
                             <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.type}
                           </span>
                           {job.salary && (
                             <span className="flex items-center gap-1.5">
                               <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {job.salary}
                             </span>
                           )}
                           <span className="flex items-center gap-1.5">
                             <Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(job.created_at).toLocaleDateString()}
                           </span>
                         </div>
                       </div>

                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A1C21] bg-slate-100 group-hover:bg-[#A079FF] group-hover:text-white px-4 py-3 rounded-md transition-all self-start md:self-center">
                         Apply <ArrowRight className="w-3.5 h-3.5" />
                       </div>
                     </div>
                   </Link>
                 ))
               ) : (
                 <div className="py-24 text-center bg-white/40 backdrop-blur-xl border border-dashed border-[#EEEEF0] rounded-md space-y-4">
                   <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                   <h3 className="text-lg font-black tracking-tight uppercase text-[#1A1C21]">No missions found</h3>
                   <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto">Try adjusting your search criteria or check back later for active opportunities.</p>
                 </div>
               )}
             </div>
          </div>
      </section>

      {/* CTA Block */}
      <section className="relative w-full pb-40 bg-[#f4f2ee]">
         <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-20">
             <div className="w-full min-h-[350px] rounded-2xl bg-gradient-to-br from-[#1a1a1a] via-[#333] to-[#111] p-12 flex flex-col justify-center relative overflow-hidden shadow-2xl">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-30 blur-2xl"></div>
                   <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-8 text-white">
                       <div className="flex flex-col">
                           <span className="text-[12px] tracking-[0.2em] text-white/70 mb-6 uppercase font-jakarta">BUILD WITH US</span>
                          <h2 className="text-[40px] lg:text-[56px] font-medium tracking-tight leading-[1] max-w-lg mb-8">
                              Expand your talent pool seamlessly.
                          </h2>
                          <div>
                             <Link to="/client/signup" className="px-8 py-4 border border-white text-white font-black hover:bg-white hover:text-black transition-all rounded-none uppercase tracking-[0.2em] text-[10px]">
                                 Create Client Account
                             </Link>
                          </div>
                       </div>
                       <ArrowRight className="w-24 h-24 text-white opacity-80 shrink-0 stroke-[1px]" />
                   </div>
             </div>
         </div>
      </section>

      <PreparedFooter />
    </main>
  );
}
