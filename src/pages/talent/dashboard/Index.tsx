"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  Wallet, 
  Calendar, 
  CheckSquare, 
  ArrowUpRight, 
  X,
  CreditCard,
  Target,
  Rocket,
  Layers,
  Clock,
  FolderKanban,
  ArrowRightLeft,
  Sparkles,
  ArrowRight,
  Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function DashboardIndex() {
  const [profile, setProfile] = useState<any>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, onboarding_completed")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    }
    fetchProfile();
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || "";

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Incomplete Onboarding Notice (Styled like BMG CRM header banner) */}
      {profile && !profile.onboarding_completed && !bannerDismissed && (
        <div className="relative overflow-hidden rounded-xl bg-[#24346e] border border-blue-400/20 px-4 py-2.5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] shrink-0">
                Profile Incomplete
              </span>
              <span className="text-white/80 font-normal">
                - Finish setting up your talent profile to get discovered by global companies and receive contracts.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Link
              to="/talent/onboarding"
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

      {/* Welcome Header */}
      <div className="text-center pt-4">
        <h1 className="text-2xl sm:text-3xl font-medium text-[#1A1C21] tracking-tight">
          Welcome{firstName ? `, ${firstName}` : ""} 👋
        </h1>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-2xl mx-auto relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A079FF] transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text"
          placeholder="Search for people, pages, apps or ask Talent AI"
          className="w-full h-11 pl-11 pr-16 bg-white border border-[#EEEEF0] rounded-xl shadow-sm text-xs sm:text-sm font-medium outline-none focus:border-[#A079FF] transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-medium text-slate-400">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="bg-[#EEEEF0]/50 p-1 rounded-xl flex items-center gap-1">
          {["All", "Teams", "Finance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab 
                  ? "bg-white text-[#1A1C21] shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {tab === "All" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                {tab === "Teams" && <Plus className="w-3 h-3" />}
                {tab === "Finance" && <Wallet className="w-3 h-3" />}
                {tab}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Drive Growth Banner */}
      {(activeTab === "All" || activeTab === "Teams") && (
        <div className="relative h-[200px] rounded-2xl bg-[#A079FF]/10 overflow-hidden flex items-center group shadow-sm border border-[#A079FF]/30">
          <div className="relative z-10 pl-8 md:pl-12 max-w-lg space-y-2.5">
            <h2 className="text-base sm:text-lg font-medium text-[#1A1C21] tracking-tight leading-snug">
              Drive growth with Engage
            </h2>
            <p className="text-xs sm:text-sm font-normal text-[#1A1C21]/70 leading-relaxed">
              Align on goals, automate 360° feedback, and unlock performance insights—all in one integrated platform.
            </p>
            <button className="px-4 py-2 bg-white border border-[#A079FF]/40 rounded-lg text-xs font-medium hover:bg-[#A079FF]/10 transition-all shadow-sm">
              Learn more
            </button>
          </div>
          
          {/* Right Illustration Mockup */}
          <div className="absolute right-0 top-0 h-full w-1/3 md:w-1/2 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop')] bg-cover opacity-10" />
          <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block">
             <div className="w-64 h-36 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl overflow-hidden p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
                <div className="h-3.5 w-3/4 bg-slate-900/10 rounded-full" />
                <div className="h-3.5 w-1/2 bg-slate-900/5 rounded-full" />
                <div className="flex justify-between items-end mt-3">
                  <div className="h-10 w-10 bg-blue-500/20 rounded-lg" />
                  <div className="h-10 w-10 bg-emerald-500/20 rounded-lg" />
                </div>
             </div>
          </div>

          <button className="absolute top-4 right-4 p-1.5 text-[#1A1C21]/20 hover:text-[#1A1C21] transition-colors">
            <X className="w-4 h-4" />
          </button>

          {/* Carousel indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 opacity-100" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 opacity-20" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 opacity-20" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payments Tracker Card */}
        {(activeTab === "All" || activeTab === "Finance") && (
        <div className="bg-white border border-[#EEEEF0] rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-medium text-[#1A1C21] uppercase tracking-wider">
              <Wallet className="w-3.5 h-3.5 text-[#A079FF]" /> Payments tracker
            </h3>
            <button className="text-[11px] font-medium text-slate-400 hover:text-[#A079FF] uppercase tracking-wider">
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 border border-[#EEEEF0] rounded-xl space-y-2.5">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Unpaid invoices</span>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <span className="text-xl font-medium text-[#1A1C21]">$0</span>
                <p className="text-[9px] font-normal text-slate-400 mt-0.5">USD • 0 invoices</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-[#EEEEF0] rounded-xl space-y-2.5">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Processing payments</span>
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <span className="text-xl font-medium text-[#1A1C21]">$0</span>
                <p className="text-[9px] font-normal text-slate-400 mt-0.5">USD • 0 payments</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#EEEEF0]">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-4">Pending invoices details</p>
            <div className="p-4 bg-slate-50/50 border border-dashed border-[#EEEEF0] rounded-xl text-center">
              <p className="text-xs font-medium text-slate-400">There are no pending invoices</p>
            </div>
          </div>
        </div>
        )}

        {/* Teams / Workforce Card */}
        {(activeTab === "All" || activeTab === "Teams") && (
        <div className="bg-white border border-[#EEEEF0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-medium text-[#1A1C21] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#A079FF]" /> Work
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/talent/contracts" className="p-4 bg-slate-50 hover:bg-[#A079FF]/5 border border-[#EEEEF0] hover:border-[#A079FF]/30 rounded-xl space-y-2.5 transition-all group cursor-pointer block">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-medium text-slate-500 group-hover:text-[#A079FF] uppercase tracking-wider">Active Contracts</span>
                <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#A079FF]" />
              </div>
              <div>
                <span className="text-xl font-medium text-[#1A1C21]">0</span>
                <p className="text-[9px] font-normal text-slate-400 mt-0.5">Ongoing engagements</p>
              </div>
            </Link>

            <Link to="/talent/project" className="p-4 bg-slate-50 hover:bg-[#A079FF]/5 border border-[#EEEEF0] hover:border-[#A079FF]/30 rounded-xl space-y-2.5 transition-all group cursor-pointer block">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-medium text-slate-500 group-hover:text-[#A079FF] uppercase tracking-wider">Projects</span>
                <FolderKanban className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#A079FF]" />
              </div>
              <div>
                <span className="text-xl font-medium text-[#1A1C21]">0</span>
                <p className="text-[9px] font-normal text-slate-400 mt-0.5">Active projects</p>
              </div>
            </Link>

            <Link to="/talent/contract-changes" className="p-4 bg-slate-50 hover:bg-[#A079FF]/5 border border-[#EEEEF0] hover:border-[#A079FF]/30 rounded-xl space-y-2.5 transition-all group cursor-pointer block">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-medium text-slate-500 group-hover:text-[#A079FF] uppercase tracking-wider">Contract Changes</span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#A079FF]" />
              </div>
              <div>
                <span className="text-xl font-medium text-[#1A1C21]">0</span>
                <p className="text-[9px] font-normal text-slate-400 mt-0.5">Pending requests</p>
              </div>
            </Link>
          </div>
        </div>
        )}

        {/* For You Today Card */}
        {(activeTab === "All") && (
        <div className="bg-white border border-[#EEEEF0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-medium text-[#1A1C21] uppercase tracking-wider">
              <CheckSquare className="w-3.5 h-3.5 text-[#A079FF]" /> For you today
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-medium text-slate-500 uppercase">Manage</span>
              <X className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-slate-500" />
            </div>
          </div>

          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">To-dos that require your attention</p>

          <div className="space-y-3">
             {/* Security Nudge */}
             <div className="p-3.5 bg-white border border-[#EEEEF0] rounded-xl flex items-center gap-3 group hover:border-[#A079FF]/30 transition-all cursor-pointer">
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A1C21]">Boost your account security</p>
                  <p className="text-[10px] font-normal text-slate-400 mt-0.5 truncate">Setting up 2FA on your account helps protect your data.</p>
                </div>
                <X className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>

             {/* Onboarding Complete */}
             <div className="p-4 bg-slate-50 border border-[#EEEEF0] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#1A1C21]">Complete your onboarding</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-white border border-[#EEEEF0] rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#EEEEF0] rounded-full flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-center mb-1.5">
                         <p className="text-xs font-medium text-[#1A1C21]">Set up basics</p>
                         <span className="text-[9px] font-medium text-slate-400">33%</span>
                       </div>
                       <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                         <div className="w-1/3 h-full bg-[#A079FF]" />
                       </div>
                       <p className="text-[9px] font-normal text-slate-400 mt-1.5">Next: <span className="text-slate-600">Set up your entities</span></p>
                    </div>
                    <button className="px-3 py-1.5 bg-[#1A1C21] text-white text-[9px] font-medium uppercase tracking-wider rounded hover:bg-black transition-all">
                      Continue
                    </button>
                  </div>
                </div>
              </div>
           </div>
        </div>
        )}
      </div>
    </div>
  );
}

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
