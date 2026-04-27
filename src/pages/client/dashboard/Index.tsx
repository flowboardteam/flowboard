"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ArrowUpRight, 
  Wallet, 
  Users, 
  ArrowRight,
  Plus,
  Zap,
  Clock,
  Briefcase
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGroups } from "@/contexts/GroupContext";
import { Link } from "react-router-dom";

export default function ClientDashboardIndex() {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { activeGroup } = useGroups();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const getGroupStats = () => {
    if (!activeGroup) return { payroll: "$0.00", contractors: "$0.00", fullTime: "$0.00", activeRoles: "0", timeLogs: "0", candidates: [] };
    const name = activeGroup.name || "";
    if (name.toLowerCase().includes("flowboard")) {
      return {
        payroll: "$94,000.00",
        contractors: "$52,000.00",
        fullTime: "$42,000.00",
        activeRoles: "3",
        timeLogs: "24",
        candidates: [
          { name: "Alex Rivers", role: "Senior DevOps Expert", match: "98%", tag: "Haraka Node", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" },
          { name: "Sarah Lopez", role: "React Specialist", match: "94%", tag: "Verification Pass", img: null }
        ]
      };
    } else if (name.toLowerCase().includes("vanguard")) {
      return {
        payroll: "$13,000.00",
        contractors: "$8,000.00",
        fullTime: "$5,000.00",
        activeRoles: "2",
        timeLogs: "12",
        candidates: [
          { name: "Eleanor Vance", role: "Fullstack Developer", match: "92%", tag: "Vetted", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" }
        ]
      };
    } else if (name.toLowerCase().includes("gablecorp")) {
      return {
        payroll: "$25,500.00",
        contractors: "$15,000.00",
        fullTime: "$10,500.00",
        activeRoles: "6",
        timeLogs: "36",
        candidates: [
          { name: "Mason Reed", role: "Data Engineer", match: "95%", tag: "Haraka Node", img: null },
          { name: "Elena Fisher", role: "UI/UX Designer", match: "91%", tag: "Portfolio Vetted", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" }
        ]
      };
    }
    return {
      payroll: "$0.00",
      contractors: "$0.00",
      fullTime: "$0.00",
      activeRoles: "0",
      timeLogs: "0",
      candidates: []
    };
  };

  const stats = getGroupStats();

  const TABS = [
    { id: "all", label: "All" },
    { id: "roles", label: "Roles" },
    { id: "finance", label: "Finance" },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1A1C21]">
          Welcome, {profile?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        
        {/* Omni-Search */}
        <div className="relative max-w-2xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#A079FF] transition-colors" />
          <input 
            type="text"
            placeholder="Search roles, candidates, or invoices..."
            className="w-full h-16 pl-14 pr-20 bg-white border border-[var(--border-color)] rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-[#A079FF]/5 focus:border-[#A079FF]/30 transition-all font-medium text-slate-600"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase">⌘</span>
            <span className="text-[10px] font-black text-slate-400 uppercase">K</span>
          </div>
        </div>          {/* Main Growth Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-[#A079FF] p-10 text-white min-h-[320px] flex flex-col justify-end group border border-[#A079FF]/80">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 blur-[100px] rounded-full -mr-48 -mt-48 group-hover:bg-white/30 transition-all duration-700" />
            
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black leading-[1.05] tracking-tighter">
                Find your next <br /> big talent.
              </h2>
              <p className="max-w-md text-white/80 font-bold leading-relaxed">
                Source top-tier talent filtered by our Haraka01 model. Create your next role today.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                 <Link to="/client/roles" className="px-8 py-4 bg-white hover:bg-slate-50 text-[#A079FF] font-black text-xs uppercase tracking-[0.15em] rounded-xl transition-all shadow-xl shadow-black/10 flex items-center gap-2 group/btn">
                  Browse Contracts <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                </Link>
                <Link to="/client/haraka" className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl transition-all">
                  Run AI Search
                </Link>
              </div>
            </div>
          </div>
        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100/50 w-fit rounded-xl border border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-[#A079FF] shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Banners and Main Actions */}
        <div className="lg:col-span-2 space-y-8">
          


          {/* Candidates to Review Section */}
          <div className="bg-white rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-sm">
             <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <Users className="text-[#A079FF] w-5 h-5" />
                   <h3 className="text-lg font-black text-[#1A1C21] tracking-tight">Candidates to review</h3>
                </div>
                <Link to="/client/roles" className="text-[10px] font-black uppercase tracking-widest text-[#A079FF] hover:text-[#A079FF] transition-colors">See all</Link>
             </div>
             <div className="p-8 space-y-6">
                 {stats.candidates.length > 0 ? stats.candidates.map((c: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:border-[#A079FF]/30">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-200 border border-slate-200 overflow-hidden flex items-center justify-center">
                            {c.img ? (
                              <img src={c.img} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-slate-400 uppercase">
                                {c.name.split(' ').map((x:any)=>x[0]).join('')}
                              </span>
                            )}
                          </div>
                          <div>
                             <p className="text-sm font-black text-[#1A1C21]">{c.name}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{c.role}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                             <p className="text-[10px] font-black text-[#A079FF] uppercase tracking-widest">{c.match} Match</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{c.tag}</p>
                          </div>
                          <Link to="/client/shortlist" className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#A079FF] hover:border-[#A079FF]/30 transition-all shadow-sm">
                            <ArrowUpRight size={18} />
                          </Link>
                       </div>
                    </div>
                 )) : (
                    <div className="text-center py-10 text-slate-400 text-xs font-bold">
                      No candidates to review for this group.
                    </div>
                 )}
              </div>
          </div>
        </div>

        {/* Right Column: Tracking and Status */}
        <div className="space-y-8">
          
          {/* Ongoing Payroll Tracker */}
          <div className="bg-white rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-sm flex flex-col p-8">
            <div className="flex justify-between items-start mb-10">
              <div className="w-12 h-12 rounded-2xl bg-[#A079FF]/10 text-[#A079FF] flex items-center justify-center border border-[#A079FF]/20">
                <Wallet size={20} />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#A079FF]/10 border border-[#A079FF]/20 text-[#A079FF] text-[10px] font-black uppercase tracking-widest">
                Live
              </span>
            </div>
            
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Payroll Cycle</p>
            <h3 className="text-3xl font-black text-[#1A1C21] tracking-tight mb-8 px-1">{stats.payroll}</h3>
            
            <div className="space-y-5 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-tight">Contractors</span>
                <span className="text-[#1A1C21] font-black">{stats.contractors}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-tight">Full-time</span>
                <span className="text-[#1A1C21] font-black">{stats.fullTime}</span>
              </div>
            </div>

            <Link to="/client/payroll" className="mt-10 flex items-center justify-between p-4 bg-slate-50 hover:bg-[#A079FF]/5 hover:text-[#A079FF] rounded-2xl transition-all border border-slate-100 font-black text-[10px] uppercase tracking-widest">
              View Invoices <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white rounded-2xl border border-[var(--border-color)] shadow-sm">
                <Briefcase size={16} className="text-slate-400 mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Roles</p>
                <p className="text-2xl font-black text-[#1A1C21]">{stats.activeRoles}</p>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-[var(--border-color)] shadow-sm">
                <Clock size={16} className="text-slate-400 mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Logs</p>
                <p className="text-2xl font-black text-[#1A1C21]">{stats.timeLogs}</p>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
