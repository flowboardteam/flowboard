import { Briefcase, Calendar, MapPin, ChevronRight } from "lucide-react";
import { ApplicationStatus } from "./mockApplications";

interface ApplicationCardProps {
  app: {
    id: string;
    jobTitle: string;
    company: string;
    companyLogo: string;
    appliedDate: string;
    status: ApplicationStatus;
    location: string;
  };
}

const getStatusStyles = (status: ApplicationStatus) => {
  switch (status) {
    case 'Applied': return "bg-blue-50 text-blue-600 border-blue-100";
    case 'Shortlisted': return "bg-purple-50 text-purple-600 border-purple-100";
    case 'Interview': return "bg-amber-50 text-amber-600 border-amber-100";
    case 'Offer': return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case 'Rejected': return "bg-slate-100 text-slate-500 border-slate-200";
    default: return "bg-slate-50 text-slate-500 border-slate-100";
  }
};

export function ApplicationCard({ app }: ApplicationCardProps) {
  return (
    <div className="group bg-white p-6 rounded-none border border-slate-200 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Job Info */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#050B1E] rounded-none flex items-center justify-center text-white font-black text-lg group-hover:bg-blue-600 transition-colors">
            {app.companyLogo}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              {app.jobTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {app.company}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {app.location}</span>
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-12 border-t lg:border-none pt-4 lg:pt-0">
          <div className="flex flex-col lg:items-end gap-1">
            <span className={`px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(app.status)}`}>
              {app.status}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-1 uppercase">
              <Calendar className="w-3.5 h-3.5" /> Applied {app.appliedDate}
            </span>
          </div>

          <button className="flex items-center justify-center w-10 h-10 rounded-none bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}