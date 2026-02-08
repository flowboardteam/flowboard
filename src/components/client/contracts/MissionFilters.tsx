import { Filter, Target } from "lucide-react";

export default function MissionFilters() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#00A86B]" /> Mission Filters
        </h3>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Category</label>
            <div className="flex flex-col gap-2">
              {["All Missions", "AI-Assisted", "Human Core", "Full Contract"].map((t) => (
                <button 
                  key={t} 
                  className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent bg-slate-500/5 text-slate-500 hover:border-[#00A86B]/30 hover:text-[#00A86B] transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}