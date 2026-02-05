import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Github,
  Linkedin,
  TrendingUp,
  FileText,
  Bell,
  CalendarDays,
  MoreHorizontal
} from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

export function TalentDashboard() {
  const { profile } = useOutletContext<{ profile: any }>();

  const stats = [
    { label: "Profile Views", value: "124", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Active Jobs", value: "08", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Search Hits", value: "42", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-10">
      
      {/* 1. HERO SECTION - Dark Mobile / Glassy Desktop */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#050B1E] p-6 md:p-10 lg:p-12 text-white shadow-2xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 bg-blue-500/20 blur-[80px] rounded-full" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-6">
            
            {/* Big Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black ring-4 ring-white/10 shrink-0 shadow-2xl">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover rounded-[2.5rem]" alt="Avatar" />
              ) : (
                profile?.full_name?.charAt(0)
              )}
            </div>

            {/* Role Info */}
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                  {profile?.full_name}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-slate-400 font-bold text-lg">{profile?.primary_role}</p>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-2">{profile?.location}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            <div className="flex gap-2 justify-center">
               {[Github, Linkedin].map((Icon, i) => (
                 <button key={i} className="flex-1 sm:flex-none p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                   <Icon size={20} className="mx-auto" />
                 </button>
               ))}
            </div>
            <Link to="/dashboard/profile" className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30">
              Edit Profile <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-[2rem] border border-slate-100 p-6 flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-0.5">{stat.label}</p>
                <p className="text-xl font-black text-[#050B1E]">{stat.value}</p>
              </div>
            </div>
            <MoreHorizontal size={18} className="text-slate-200" />
          </div>
        ))}
      </div>

      {/* 3. ACTIVITY AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-black text-[#050B1E] mb-6 flex items-center gap-2">
              <Bell className="text-blue-600" size={20} />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <CalendarDays size={18} className="text-blue-600" />
                 </div>
                 <div>
                   <p className="font-black text-sm text-slate-900">Portfolio Update</p>
                   <p className="text-xs text-slate-500 font-bold">Recruiters are looking for updated projects.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE COMPLETION */}
        <div className="bg-[#050B1E] rounded-[2.5rem] p-8 text-white text-center shadow-xl">
           <p className="text-[10px] font-black tracking-widest uppercase text-blue-400 mb-6">Profile Strength</p>
           <div className="text-4xl font-black mb-2">85%</div>
           <div className="w-full bg-white/10 h-2 rounded-full mb-8">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }} />
           </div>
           <button className="w-full py-4 rounded-2xl bg-white text-[#050B1E] font-black text-sm">
             Complete Profile
           </button>
        </div>
      </div>
    </div>
  );
}