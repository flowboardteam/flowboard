import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";

export default function TalentJobsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("roles")
          .select(`
            *,
            organization:profiles!roles_organization_id_fkey(company_name, avatar_url)
          `)
          .eq("status", "open")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        console.error("Fetch jobs error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.organization?.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 font-jakarta">
      {/* Header Section */}
      <header className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Job Board
            </h1>
            <p className="text-slate-500 font-medium mt-4 max-w-lg">
              Explore high-impact roles at leading global companies. Our AI matching engine prioritizes the best fits for your skillset.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex -space-x-2 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className="inline-block h-10 w-10 rounded-xl ring-2 ring-[var(--bg-main)] object-cover"
                  src={`https://i.pravatar.cc/100?u=company${i}`}
                  alt=""
                />
              ))}
            </div>
            <div className="text-sm font-bold flex flex-col justify-center">
              <span className="text-blue-600">500+ Companies</span>
              <span className="text-slate-400 text-[10px] uppercase tracking-widest">Actively Hiring</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-30 bg-[var(--bg-main)]/80 backdrop-blur-xl py-4 -mx-4 px-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search roles, skills, or companies..."
              className="w-full pl-12 pr-4 py-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors whitespace-nowrap">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center col-span-full">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Missions...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className={`group relative p-8 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-600/10 cursor-pointer overflow-hidden`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-slate-100 flex items-center justify-center ring-1 ring-slate-200 rounded-xl shrink-0 overflow-hidden">
                    {job.organization?.avatar_url ? (
                      <img src={job.organization.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Briefcase className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{job.title}</h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg">
                        {job.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500 font-medium font-jakarta">
                      <span className="flex items-center gap-1.5 font-jakarta">
                        <Building2 className="w-4 h-4 text-slate-300" />
                        {job.organization?.company_name || "Enterprise"}
                      </span>
                      <span className="flex items-center gap-1.5 font-jakarta">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1.5 font-jakarta">
                          <DollarSign className="w-4 h-4 text-slate-300" />
                          {job.salary}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {job.skills?.slice(0, 5).map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold uppercase transition-colors group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 font-jakarta rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }} className="px-8 py-4 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group/btn">
                    View & Apply
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No missions found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Empty State Mockup */}
      {searchTerm && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No missions found matching "{searchTerm}"</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
