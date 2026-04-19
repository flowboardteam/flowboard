import { Briefcase, Calendar, MapPin, ChevronRight, Building2 } from "lucide-react";

interface ApplicationCardProps {
  app: {
    id: string;
    status: string;
    created_at: string;
    role: {
      title: string;
      location: string;
      organization: {
        company_name: string | null;
        avatar_url: string | null;
      };
    };
  };
}

const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  switch (s) {
    case 'pending': 
    case 'applied': return "bg-blue-50 text-blue-600 border-blue-100";
    case 'shortlisted': return "bg-purple-50 text-purple-600 border-purple-100";
    case 'interview': return "bg-amber-50 text-amber-600 border-amber-100";
    case 'offer': return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case 'rejected': 
    case 'declined': return "bg-slate-100 text-slate-500 border-slate-200";
    default: return "bg-slate-50 text-slate-500 border-slate-100";
  }
};

export function ApplicationCard({ app }: ApplicationCardProps) {
  const orgName = app.role?.organization?.company_name || "Enterprise";
  const avatarUrl = app.role?.organization?.avatar_url;
  const appliedDate = new Date(app.created_at).toLocaleDateString();

  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Job Info */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-50 border border-black/5 rounded-xl flex items-center justify-center overflow-hidden shrink-0 group-hover:border-blue-600 transition-colors">
            {avatarUrl ? (
              <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              <Building2 className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {app.role?.title || "Role not found"}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5 font-bold"><Briefcase className="w-4 h-4 text-slate-300" /> {orgName}</span>
              <span className="flex items-center gap-1.5 font-bold"><MapPin className="w-4 h-4 text-slate-300" /> {app.role?.location || "Remote"}</span>
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-12 border-t lg:border-none pt-4 lg:pt-0">
          <div className="flex flex-col lg:items-end gap-1">
            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(app.status)}`}>
              {app.status}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-1 uppercase">
              <Calendar className="w-3.5 h-3.5" /> Applied {appliedDate}
            </span>
          </div>

          <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}