import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useGroups } from "@/contexts/GroupContext";
import { 
  Briefcase, 
  Users, 
  MapPin, 
  ChevronRight, 
  Loader2, 
  FileText,
  Clock,
  Search,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientApplicationsPage() {
  const navigate = useNavigate();
  const { activeGroup } = useGroups();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rolesWithCounts, setRolesWithCounts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRoles: 0, totalApplicants: 0, totalHired: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch ALL roles for this organization from Supabase
      const { data: rolesData } = await supabase
        .from("roles")
        .select("*")
        .eq("organization_id", user.id)
        .order("created_at", { ascending: false });

      const roles = rolesData || [];

      // 2. Also pull from localStorage (roles created locally / offline)
      const groupId = activeGroup?.id || "default-group";
      const localKey = `flowboard_roles_${groupId}`;
      const localRaw = localStorage.getItem(localKey);
      let localRoles: any[] = [];
      if (localRaw) {
        try {
          const parsed = JSON.parse(localRaw);
          const dbIds = new Set(roles.map((r: any) => r.id));
          localRoles = parsed.filter((r: any) => !dbIds.has(r.id));
        } catch(e) {}
      }

      const allRoles = [...roles, ...localRoles];

      // 3. Fetch hire_inquiries for this org to count accepted offers per role
      const { data: inquiriesData } = await supabase
        .from("hire_inquiries")
        .select("role_id, status")
        .eq("client_id", user.id);

      const acceptedByRole: Record<string, number> = {};
      const pendingByRole: Record<string, number> = {};
      (inquiriesData || []).forEach((inq: any) => {
        if (!inq.role_id) return;
        if (inq.status === "accepted") {
          acceptedByRole[inq.role_id] = (acceptedByRole[inq.role_id] || 0) + 1;
        } else if (["pending", "viewed"].includes(inq.status)) {
          pendingByRole[inq.role_id] = (pendingByRole[inq.role_id] || 0) + 1;
        }
      });

      // 4. Fetch role_shortlist counts
      const { data: shortlistData } = await supabase
        .from("role_shortlist")
        .select("role_id, status")
        .eq("organization_id", user.id);

      const shortlistByRole: Record<string, number> = {};
      (shortlistData || []).forEach((s: any) => {
        if (s.role_id) shortlistByRole[s.role_id] = (shortlistByRole[s.role_id] || 0) + 1;
      });

      // 5. Map everything together
      const mapped = allRoles.map((role: any) => ({
        ...role,
        applicantCount: (shortlistByRole[role.id] || 0) + (pendingByRole[role.id] || 0),
        hiredCount: acceptedByRole[role.id] || role.applicants_count || 0,
      }));

      setRolesWithCounts(mapped);
      setStats({
        totalRoles: mapped.length,
        totalApplicants: mapped.reduce((s: number, r: any) => s + r.applicantCount, 0),
        totalHired: mapped.reduce((s: number, r: any) => s + r.hiredCount, 0),
      });

      // Keep localStorage fresh
      localStorage.setItem(localKey, JSON.stringify(allRoles));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeGroup?.id]);

  const filteredRoles = rolesWithCounts.filter(role => 
    role.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Applications
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl">
            Track talent through your hiring pipeline. Each role shows candidates shortlisted, offers sent and hires confirmed.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={fetchData}
            className="p-3 rounded-xl bg-[var(--sidebar-bg)] border border-[var(--border-color)] text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles..."
              className="w-full bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:border-slate-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Open Roles", value: stats.totalRoles, icon: Briefcase, color: "text-[#1A1C21]", bg: "bg-slate-100" },
            { label: "In Pipeline", value: stats.totalApplicants, icon: Users, color: "text-slate-900", bg: "bg-slate-100" },
            { label: "Total Hires", value: stats.totalHired, icon: CheckCircle2, color: "text-slate-900", bg: "bg-slate-100" },
          ].map(s => (
            <div key={s.label} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black dark:text-white">{s.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#1A1C21] animate-spin" />
          <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Loading pipeline...</p>
        </div>
      ) : filteredRoles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRoles.map(role => (
              <motion.div
                key={role.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => navigate(`/client/roles/${role.id}/shortlist`)}
                className="group relative bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-slate-400 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-slate-900/5 overflow-hidden flex flex-col"
              >
                {/* Decorative hover element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#1A1C21] shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    
                    {/* Status badge */}
                    <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      role.status === "open"
                        ? "bg-slate-100 text-slate-900 border-slate-200"
                        : role.status === "draft"
                        ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>{role.status || "draft"}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-black dark:text-white tracking-tight leading-tight mb-1 pr-2 group-hover:text-[#1A1C21] transition-colors">
                      {role.title}
                    </h3>
                    {role.department && (
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{role.department}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 opacity-70" /> {role.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 opacity-70" /> {role.type?.replace("_", " ") || 'Full-Time'}
                      </span>
                    </div>
                  </div>

                  {/* Pipeline counters */}
                  <div className="mt-5 pt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        role.applicantCount > 0
                          ? 'bg-slate-100 text-slate-900 border border-slate-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-[var(--border-color)]'
                      }`}>
                        <Users className="w-3 h-3" />
                        {role.applicantCount} In pipeline
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        role.hiredCount > 0
                          ? 'bg-[#1A1C21] text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-[var(--border-color)]'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {role.hiredCount} Hired
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-[#1A1C21] group-hover:translate-x-1 transition-transform">
                      View Pipeline <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--sidebar-bg)]/50">
           <div className="w-16 h-16 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
             <Briefcase className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">No Active Roles</h3>
           <p className="font-medium text-slate-500 mb-8 max-w-md mx-auto">
             Create a role to start receiving applications and building your talent pipeline.
           </p>
           <Link to="/client/roles/create" className="bg-[#1A1C21] text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all inline-flex items-center gap-2 shadow-md shadow-slate-900/10">
             <TrendingUp className="w-4 h-4" /> Create Role
           </Link>
        </div>
      )}
    </div>
  );
}
