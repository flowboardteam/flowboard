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
  Briefcase,
  Sparkles,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGroups } from "@/contexts/GroupContext";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function ClientDashboardIndex() {
  const [profile, setProfile] = useState<any>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { activeGroup, acceptPendingInvite, declinePendingInvite } = useGroups();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, onboarding_completed")
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
      {/* Incomplete Onboarding Notice (Styled like BMG CRM header banner) */}
      {profile && !profile.onboarding_completed && !bannerDismissed && (
        <div className="relative overflow-hidden rounded-xl bg-[#24346e] border border-blue-400/20 px-4 py-2.5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] shrink-0">
                Setup Incomplete
              </span>
              <span className="text-white/80 font-normal">
                - Finish setting up your organization profile to unlock all platform and AI capabilities.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Link
              to="/client/onboarding"
              className="text-xs font-semibold px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-all flex items-center border border-white/20 shadow-sm"
            >
              Complete Setup
            </Link>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-white/60 hover:text-white p-1 rounded transition-colors"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pending invitation banner */}
      {activeGroup?.is_pending_invite && (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap size={22} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Organization Invitation</p>
              <h3 className="text-lg font-black tracking-tight text-white">
                You've been invited to join <span className="text-emerald-400 font-extrabold">{activeGroup.name}</span> as an Administrator.
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Accepting this invitation grants you access to their team, project pipelines, and workforce management.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              disabled={isAccepting || isDeclining}
              onClick={async () => {
                setIsAccepting(true);
                const success = await acceptPendingInvite(activeGroup.id, activeGroup.invite_token || "");
                setIsAccepting(false);
                if (!success) {
                  alert("Failed to accept invitation. Please try again.");
                }
              }}
              className="flex-1 md:flex-none px-6 py-3.5 bg-emerald-600 hover:bg-[#1A1C21] disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-2"
            >
              {isAccepting ? <Loader2 size={14} className="animate-spin" /> : "Accept Invite"}
            </button>
            <button
              disabled={isAccepting || isDeclining}
              onClick={async () => {
                if (confirm("Are you sure you want to decline this invitation?")) {
                  setIsDeclining(true);
                  const success = await declinePendingInvite(activeGroup.invite_token || "");
                  setIsDeclining(false);
                  if (!success) {
                    alert("Failed to decline invitation.");
                  }
                }
              }}
              className="flex-1 md:flex-none px-6 py-3.5 bg-slate-800 hover:bg-slate-700 hover:text-rose-400 disabled:opacity-50 text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl border border-slate-700 transition-all flex items-center justify-center"
            >
              {isDeclining ? <Loader2 size={14} className="animate-spin" /> : "Decline"}
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1C21]">
          Welcome, {profile?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        
        {/* Omni-Search */}
        <div className="relative max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#A079FF] transition-colors" />
          <input 
            type="text"
            placeholder="Search roles, candidates, or invoices..."
            className="w-full h-11 pl-11 pr-16 bg-white border border-[var(--border-color)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A079FF]/10 focus:border-[#A079FF]/40 transition-all text-xs sm:text-sm font-medium text-slate-600"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-400 border border-slate-200">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Main Growth Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#A079FF] p-6 sm:p-8 text-white min-h-[250px] flex flex-col justify-end group border border-[#A079FF]/80">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 blur-[90px] rounded-full -mr-40 -mt-40 group-hover:bg-white/30 transition-all duration-700" />
          
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold leading-[1.15] tracking-tight">
              Find your next <br /> big talent.
            </h2>
            <p className="max-w-md text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
              Source top-tier talent filtered by Haraka. Create your next role.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/client/roles" className="px-5 py-2.5 bg-white hover:bg-slate-50 text-[#A079FF] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-black/10 flex items-center gap-1.5 group/btn">
                Browse Contracts <Plus size={14} className="group-hover:rotate-90 transition-transform" />
              </Link>
              <Link to="/client/haraka" className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all">
                Run AI Search
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100/50 w-fit rounded-lg border border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Banners and Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidates to Review Section */}
          <div className="bg-white rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
             <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                   <Users className="text-[#A079FF] w-4 h-4" />
                   <h3 className="text-sm font-bold text-[#1A1C21] tracking-tight">Candidates to review</h3>
                </div>
                <Link to="/client/roles" className="text-[10px] font-bold uppercase tracking-widest text-[#A079FF] hover:text-[#9165f7] transition-colors">See all</Link>
             </div>
             <div className="p-5 space-y-3">
                  {stats.candidates.length > 0 ? stats.candidates.map((c: any, idx: number) => (
                     <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:border-[#A079FF]/30">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-slate-200 border border-slate-200 overflow-hidden flex items-center justify-center">
                             {c.img ? (
                               <img src={c.img} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <span className="text-xs font-bold text-slate-400 uppercase">
                                 {c.name.split(' ').map((x:any)=>x[0]).join('')}
                               </span>
                             )}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-[#1A1C21]">{c.name}</p>
                              <p className="text-[10px] font-medium text-slate-400 tracking-wider mt-0.5">{c.role}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-bold text-[#A079FF] uppercase tracking-wider">{c.match} Match</p>
                              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">{c.tag}</p>
                           </div>
                           <Link to="/client/shortlist" className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-400 hover:text-[#A079FF] hover:border-[#A079FF]/30 transition-all shadow-sm">
                             <ArrowUpRight size={16} />
                           </Link>
                        </div>
                     </div>
                  )) : (
                     <div className="text-center py-8 text-slate-400 text-xs font-medium">
                       No candidates to review for this group.
                     </div>
                  )}
             </div>
          </div>
        </div>

        {/* Right Column: Tracking and Status */}
        <div className="space-y-6">
          
          {/* Ongoing Payroll Tracker */}
          <div className="bg-white rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm flex flex-col p-5">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#A079FF]/10 text-[#A079FF] flex items-center justify-center border border-[#A079FF]/20">
                <Wallet size={18} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#A079FF]/10 border border-[#A079FF]/20 text-[#A079FF] text-[9px] font-bold uppercase tracking-wider">
                Live
              </span>
            </div>
            
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1 px-1">Payroll Cycle</p>
            <h3 className="text-xl font-semibold text-[#1A1C21] tracking-tight mb-5 px-1">{stats.payroll}</h3>
            
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium tracking-tight">Contractors</span>
                <span className="text-[#1A1C21] font-bold">{stats.contractors}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium tracking-tight">Full-time</span>
                <span className="text-[#1A1C21] font-bold">{stats.fullTime}</span>
              </div>
            </div>

            <Link to="/client/payroll" className="mt-6 flex items-center justify-between p-3 bg-slate-50 hover:bg-[#A079FF]/5 hover:text-[#A079FF] rounded-xl transition-all border border-slate-100 font-bold text-[10px] uppercase tracking-wider">
              View Invoices <ArrowRight size={13} />
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
             <div className="p-4 bg-white rounded-xl border border-[var(--border-color)] shadow-sm">
                <Briefcase size={15} className="text-slate-400 mb-2" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Active Roles</p>
                <p className="text-lg font-semibold text-[#1A1C21]">{stats.activeRoles}</p>
             </div>
             <div className="p-4 bg-white rounded-xl border border-[var(--border-color)] shadow-sm">
                <Clock size={15} className="text-slate-400 mb-2" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Time Logs</p>
                <p className="text-lg font-semibold text-[#1A1C21]">{stats.timeLogs}</p>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
