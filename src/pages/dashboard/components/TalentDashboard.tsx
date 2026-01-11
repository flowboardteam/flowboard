import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Github,
  Linkedin,
  TrendingUp,
  FileText,
  Bell,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  Zap,
  Globe,
  MoreHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";

export function TalentDashboard({ profile }: { profile: any }) {
  const stats = [
    { label: "Profile Views", value: "124", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Active Jobs", value: "08", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Search Hits", value: "42", icon: Globe, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const alerts = [
    {
      label: "Interview Scheduled",
      description: "Frontend Engineer • Tomorrow 10:00 AM",
      icon: CalendarDays,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      label: "Action Required",
      description: "Complete your skill assessment for 'React Expert'",
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      label: "Profile Verified",
      description: "Your profile is now boosted for recruiters",
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      
      {/* 1. HERO HEADER - Glassmorphic Design */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white/40 backdrop-blur-md p-8 lg:p-12 shadow-xl shadow-slate-200/50">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 h-80 w-80 bg-blue-400/10 blur-[100px] rounded-full" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-bet
         en gap-8">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-[2.5rem] bg-[#050B1E] p-1 shadow-2xl shadow-blue-900/20 transition-transform duration-500 group-hover:rotate-3">
                <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black text-white">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Avatar" />
                  ) : (
                    profile.full_name?.charAt(0)
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-[6px] border-white rounded-full shadow-lg" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-[#050B1E] tracking-tight">
                  Hi, {profile.full_name?.split(" ")[0]}!
                </h1>
                <CheckCircle2 className="w-6 h-6 text-blue-600 fill-blue-50" />
              </div>
              <p className="text-slate-500 font-bold text-lg flex items-center gap-3">
                {profile.primary_role} 
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> 
                <span className="text-slate-400">{profile.location}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
               {[Github, Linkedin].map((Icon, i) => (
                 <button key={i} className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                   <Icon size={20} />
                 </button>
               ))}
            </div>
            <Link to="/dashboard/profile" className="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-10 py-5 text-white font-black shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Edit Profile <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID - Minimal High-Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-[2rem] border border-slate-100 p-8 flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-[#050B1E]">{stat.value}</p>
              </div>
            </div>
            <MoreHorizontal className="text-slate-200 group-hover:text-slate-400 cursor-pointer" />
          </div>
        ))}
      </div>

      {/* 3. MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ALERTS SECTION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-[#050B1E] flex items-center gap-3">
                <Bell className="text-blue-600" size={22} />
                Recent Activity
              </h3>
              <button className="text-xs font-bold text-blue-600 hover:underline">Mark all as read</button>
            </div>

            <div className="space-y-4">
              {alerts.map((alert, i) => (
                <div key={i} className={`group flex items-center gap-5 p-5 rounded-3xl ${alert.bg} border ${alert.border} cursor-pointer transition-all hover:shadow-md`}>
                  <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    <alert.icon size={22} className={alert.color} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[#050B1E] leading-tight mb-0.5">{alert.label}</p>
                    <p className="text-sm text-slate-500 font-bold opacity-80">{alert.description}</p>
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* RESUME CARD - Cleaner Look */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm overflow-hidden relative">
            <div className="flex items-center gap-3 mb-8">
               <FileText className="text-blue-600" size={22} />
               <h3 className="text-xl font-black text-[#050B1E]">Resume Information</h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
               <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                   <FileText size={32} className="text-blue-600" />
                 </div>
                 <div>
                    <p className="font-black text-[#050B1E] text-lg">My_Resume_v2.pdf</p>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Uploaded 2 days ago</p>
                 </div>
               </div>
               <button className="w-full md:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200 text-[#050B1E] font-black text-sm hover:bg-[#050B1E] hover:text-white transition-all">
                  Manage Files
               </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR: STRENGTH & UPCOMING */}
        <div className="space-y-8">
          {/* PROFILE STRENGTH - The Dark Card */}
          <div className="bg-[#050B1E] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full" />
            
            <div className="relative z-10 text-center">
              <p className="text-[10px] font-black tracking-[0.3em] text-blue-400 uppercase mb-8">Profile Score</p>
              
              <div className="relative w-32 h-32 mx-auto mb-8">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                   <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                     strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.85)} 
                     className="text-blue-500 stroke-linecap-round transition-all duration-1000" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">85%</span>
                 </div>
              </div>

              <h4 className="text-lg font-black mb-2">Almost there!</h4>
              <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed px-2">
                Profiles with 100% visibility get <span className="text-blue-400 font-bold">4x more</span> inquiries.
              </p>
              
              <button className="w-full py-4 rounded-2xl bg-white text-[#050B1E] font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
                Complete Now
              </button>
            </div>
          </div>

          {/* NEXT INTERVIEW - The Blue Accent Card */}
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-600/30 relative overflow-hidden group">
            <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-6">
                 <CalendarDays size={20} className="text-blue-200" />
                 <span className="text-[10px] font-black tracking-widest uppercase text-blue-100">Upcoming Meeting</span>
               </div>
               <h4 className="text-xl font-black mb-1">Frontend Lead</h4>
               <p className="text-blue-100 text-sm font-bold opacity-80 mb-8">TechFlow Inc. • 10:00 AM</p>
               
               <button className="w-full py-4 rounded-2xl bg-white text-blue-600 font-black text-sm shadow-xl hover:bg-blue-50 transition-all">
                 Join Video Call
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}