import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ApplicationCard } from "./ApplicationCard";
import { Search, Filter, Loader2, Inbox } from "lucide-react";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchApps() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data, error } = await supabase
          .from("job_applications")
          .select(`
            id,
            status,
            created_at,
            role:roles(id, title, location, organization:profiles(company_name, avatar_url))
          `)
          .eq("talent_id", user.id)
          .order("created_at", { ascending: false });

        let combined = data || [];

        const localKey = `job_applications_${user.id}`;
        const existing = localStorage.getItem(localKey);
        const appsList = existing ? JSON.parse(existing) : [];

        if (appsList.length > 0) {
          const { data: dbRoles } = await supabase
            .from("roles")
            .select("id, title, location, organization:profiles(company_name, avatar_url)")
            .in("id", appsList);

          let localRoles: any[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("flowboard_roles_")) {
              const dStr = localStorage.getItem(key);
              if (dStr) {
                try {
                  const parsed = JSON.parse(dStr);
                  if (Array.isArray(parsed)) localRoles.push(...parsed);
                } catch(e){}
              }
            }
          }

          appsList.forEach((rId: string) => {
            if (combined.some((a: any) => a.role?.id === rId)) return;
            
            const dbFound = dbRoles?.find((r: any) => r.id === rId);
            const locFound = localRoles.find((r: any) => r.id === rId);
            const targetRole = dbFound || locFound;

            if (targetRole) {
              combined.push({
                id: `app-${rId}`,
                status: 'pending',
                created_at: new Date().toISOString(),
                role: {
                  id: targetRole.id,
                  title: targetRole.title,
                  location: targetRole.location,
                  organization: targetRole.organization || {
                    company_name: targetRole.organization_name || "Enterprise",
                    avatar_url: targetRole.organization_avatar || null
                  }
                }
              });
            }
          });
        }

        setApps(combined);
      } catch (err) {
        console.error("Fetch apps error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const filteredApps = apps.filter(app => 
    (app.role?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.role?.organization?.company_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
          <p className="text-slate-500 font-medium mt-1">Track and manage your active job applications.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search apps..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-none text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-none hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* APPLICATIONS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Applications...</p>
          </div>
        ) : filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))
        ) : (
          <div className="py-24 text-center space-y-4 bg-slate-500/5 rounded-2xl border border-dashed border-slate-200">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-black tracking-tighter uppercase">No applications yet</h3>
            <p className="text-sm text-slate-400 font-medium">You haven't applied to any missions yet. Visit the Job Board to find your next goal.</p>
          </div>
        )}
      </div>
    </div>
  );
}