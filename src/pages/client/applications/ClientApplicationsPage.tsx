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
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientApplicationsPage() {
  const navigate = useNavigate();
  const { activeGroup } = useGroups();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rolesWithCounts, setRolesWithCounts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const groupId = activeGroup?.id || "default-group";
        
        // 1. Fetch roles for this specific group from localStorage
        let localRoles: any[] = [];
        const localKey = `flowboard_roles_${groupId}`;
        const existing = localStorage.getItem(localKey);
        if (existing) {
          try { localRoles = JSON.parse(existing); } catch(e){}
        }

        // 2. Fetch shortlist to count applicants per role
        const [{ data: shortlistData }, { data: notifData }] = await Promise.all([
          supabase
            .from("role_shortlist")
            .select("id, role_id")
            .eq("organization_id", user.id),
          supabase
            .from("notifications")
            .select("message")
            .eq("user_id", user.id)
            .eq("type", "job_application")
        ]);
          
        const localShortlistKey = `flowboard_local_shortlist_${user.id}`;
        const existingShortlist = localStorage.getItem(localShortlistKey);
        const localShortlist = existingShortlist ? JSON.parse(existingShortlist) : [];
        
        const notifShortlist: any[] = [];
        if (notifData) {
          notifData.forEach(n => {
            if (n.message && n.message.includes("[APP_DATA:")) {
              try {
                notifShortlist.push(JSON.parse(n.message.split("[APP_DATA:")[1].split("]")[0]));
              } catch(e) {}
            }
          });
        }

        const combinedShortlist = [...(shortlistData || []), ...localShortlist, ...notifShortlist];

        const shortListCountMap = combinedShortlist.reduce((acc: any, curr: any) => {
          acc[curr.role_id] = (acc[curr.role_id] || 0) + 1;
          return acc;
        }, {});

        // 3. Map counts
        const mapped = localRoles.map(role => ({
          ...role,
          applicantCount: shortListCountMap[role.id] || 0
        }));

        setRolesWithCounts(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeGroup?.id]);

  const filteredRoles = rolesWithCounts.filter(role => 
    role.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Node: Active Roles / Applications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Applications
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl">
            Select a job below to review the talent that have applied and advance them through your hiring pipeline.
          </p>
        </div>

        <div className="relative w-full md:w-72 flex-shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles..."
            className="w-full bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Loading roles...</p>
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
                className="group relative bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[#A079FF]/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-[#A079FF]/10 overflow-hidden flex flex-col"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#A079FF]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#A079FF]/10 border border-[#A079FF]/20 flex items-center justify-center text-[#A079FF] shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    
                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                      role.applicantCount > 0 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-[var(--border-color)]'
                    }`}>
                      <Users className="w-3 h-3" />
                      {role.applicantCount} {role.applicantCount === 1 ? 'Applicant' : 'Applicants'}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-black dark:text-white tracking-tight leading-tight mb-2 pr-4 group-hover:text-[#A079FF] transition-colors">
                      {role.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 opacity-70" /> {role.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 opacity-70" /> {role.type?.replace("_", " ") || 'Full-Time'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {role.department || 'General'}
                    </span>
                    <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-[#A079FF] group-hover:translate-x-1 transition-transform">
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
           <p className="font-medium text-slate-500 mb-8 max-w-md mx-auto">Create a role to start receiving applications and building your talent pipeline.</p>
           <Link to="/client/roles/create" className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all inline-flex items-center shadow-md shadow-blue-600/20">
             Create Role
           </Link>
        </div>
      )}
    </div>
  );
}
