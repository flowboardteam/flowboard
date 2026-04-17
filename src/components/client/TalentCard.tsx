import { MapPin, Briefcase } from "lucide-react";

interface TalentCardProps {
  talent: any;
  onReview: (talent: any) => void;
}

export function TalentCard({ talent, onReview }: TalentCardProps) {
  const displayScore = talent.profile_completion > 0 ? talent.profile_completion : 85;

  return (
    <div className="bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-none sm:rounded-none p-4 sm:p-6 hover:border-emerald-500/50 transition-all group relative flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
      <div className="flex justify-between items-start mb-4 sm:mb-6">
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {/* Fixed Avatar Container */}
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-none sm:rounded-none bg-slate-100 dark:bg-slate-800/50 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {talent.avatar_url && talent.avatar_url.trim() !== "" ? (
              <img 
                src={talent.avatar_url} 
                alt={talent.full_name || "Talent"} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-lg sm:text-xl font-black text-slate-400 dark:text-slate-500 uppercase">
                {talent.full_name?.charAt(0) || "T"}
              </span>
            )}
          </div>
          
          <div className="truncate">
            <h3 className="font-black text-[var(--text-main)] dark:text-slate-100 text-sm sm:text-base uppercase tracking-tight truncate">
              {talent.full_name}
            </h3>
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
              <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500/80" />
              <span className="truncate">{talent.primary_role || "Professional"}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center shrink-0 ml-2">
            <div className="text-[9px] sm:text-[10px] font-black text-emerald-500 mb-1 leading-none">{displayScore}%</div>
            <div className="w-8 sm:w-10 h-1 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${displayScore}%` }} 
                />
            </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-2">Capabilities</p>
          <div className="flex flex-wrap gap-1.5">
            {talent.skills?.slice(0, 3).map((skill: string) => (
              <span key={skill} className="px-2 sm:px-2.5 py-1 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-none text-[9px] sm:text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 dark:border-emerald-500/20">
                {skill}
              </span>
            ))}
            {!talent.skills?.length && <span className="text-[9px] sm:text-[10px] text-slate-400 italic">General Expertise</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 border-t border-[var(--border-color)] pt-4">
          <div>
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Seniority</p>
            <p className="text-[10px] sm:text-[11px] font-black text-[var(--text-main)] dark:text-slate-200 uppercase truncate">
              {talent.experience_level || "Junior"}
            </p>
          </div>
          <div>
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Location</p>
            <p className="text-[10px] sm:text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500/50" /> 
              {talent.location?.split(',')[0] || "Global"}
            </p>
          </div>
        </div>

        <button 
          onClick={() => onReview(talent)}
          className="w-full mt-2 py-3 sm:py-3.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-none font-black text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
        >
          Review Profile
        </button>
      </div>
    </div>
  );
}