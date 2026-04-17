import { mockApplications } from "./mockApplications";
import { ApplicationCard } from "./ApplicationCard";
import { Search, Filter } from "lucide-react";

export default function ApplicationsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
          <p className="text-slate-500 font-medium mt-1">Track and manage your active job pursuits.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search apps..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-none text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-none hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* APPLICATIONS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {mockApplications.map((app) => (
          <ApplicationCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}