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
  Rocket
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function DashboardIndex() {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    }
    fetchProfile();
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || "George";

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Welcome Header */}
      <div className="text-center pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-[#1A1C21] tracking-tight">
          Welcome, {firstName} 👋
        </h1>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-3xl mx-auto relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00A86B] transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text"
          placeholder="Search for people, pages, apps or ask Talent AI"
          className="w-full h-16 pl-16 pr-20 bg-white border border-[#EEEEF0] rounded-2xl shadow-sm text-sm font-medium outline-none focus:border-[#00A86B] transition-all"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400">
          <span className="text-xs">⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="bg-[#EEEEF0]/50 p-1.5 rounded-2xl flex items-center gap-1">
          {["All", "Teams", "Finance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTab === tab 
                  ? "bg-white text-[#1A1C21] shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === "All" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                {tab === "Teams" && <Plus className="w-3.5 h-3.5" />}
                {tab === "Finance" && <Wallet className="w-3.5 h-3.5" />}
                {tab}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Drive Growth Banner */}
      <div className="relative h-[240px] rounded-2xl bg-[#FFE58A] overflow-hidden flex items-center group shadow-sm border border-amber-200">
        <div className="relative z-10 pl-12 md:pl-20 max-w-xl space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-[#1A1C21] tracking-tight leading-tight">
            Drive growth with Engage
          </h2>
          <p className="text-sm md:text-base font-bold text-[#1A1C21]/60 leading-relaxed">
            Align on goals, automate 360° feedback, and unlock performance insights—all in one integrated platform.
          </p>
          <button className="px-6 py-3 bg-white border border-amber-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-50 transition-all shadow-sm">
            Learn more
          </button>
        </div>
        
        {/* Right Illustration Mockup */}
        <div className="absolute right-0 top-0 h-full w-1/3 md:w-1/2 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop')] bg-cover opacity-10" />
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block">
           <div className="w-64 h-40 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl overflow-hidden p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
              </div>
              <div className="h-4 w-3/4 bg-slate-900/10 rounded-full" />
              <div className="h-4 w-1/2 bg-slate-900/5 rounded-full" />
              <div className="flex justify-between items-end mt-4">
                <div className="h-12 w-12 bg-blue-500/20 rounded-xl" />
                <div className="h-12 w-12 bg-emerald-500/20 rounded-xl" />
              </div>
           </div>
        </div>

        <button className="absolute top-6 right-6 p-2 text-[#1A1C21]/20 hover:text-[#1A1C21] transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 opacity-100" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 opacity-20" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 opacity-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payments Tracker Card */}
        <div className="bg-white border border-[#EEEEF0] rounded-2xl p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#1A1C21] uppercase tracking-widest">
              <Wallet className="w-4 h-4 text-[#00A86B]" /> Payments tracker
            </h3>
            <button className="text-xs font-black text-slate-400 hover:text-[#00A86B] uppercase tracking-widest">
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 border border-[#EEEEF0] rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unpaid invoices</span>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <span className="text-3xl font-black text-[#1A1C21]">$0</span>
                <p className="text-[10px] font-bold text-slate-400 mt-1">USD • 0 invoices</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border border-[#EEEEF0] rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing payments</span>
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <span className="text-3xl font-black text-[#1A1C21]">$0</span>
                <p className="text-[10px] font-bold text-slate-400 mt-1">USD • 0 payments</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#EEEEF0]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending invoices details</p>
            <div className="p-4 bg-slate-50/50 border border-dashed border-[#EEEEF0] rounded-xl text-center">
              <p className="text-xs font-bold text-slate-400">There are no pending invoices</p>
            </div>
          </div>
        </div>

        {/* For You Today Card */}
        <div className="bg-white border border-[#EEEEF0] rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#1A1C21] uppercase tracking-widest">
              <CheckSquare className="w-4 h-4 text-[#00A86B]" /> For you today
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase">Manage</span>
              <X className="w-4 h-4 text-slate-300 cursor-pointer hover:text-slate-500" />
            </div>
          </div>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To-dos that require your attention</p>

          <div className="space-y-4">
             {/* Security Nudge */}
             <div className="p-5 bg-white border border-[#EEEEF0] rounded-2xl flex items-center gap-4 group hover:border-[#00A86B]/30 transition-all cursor-pointer">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-[#1A1C21]">Boost your account security</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">Setting up 2FA on your account helps protect your data.</p>
                </div>
                <X className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>

             {/* Onboarding Complete */}
             <div className="p-6 bg-slate-50 border border-[#EEEEF0] rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-black text-[#1A1C21]">Complete your onboarding</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white border border-[#EEEEF0] rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#EEEEF0] rounded-full flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-center mb-2">
                         <p className="text-xs font-black text-[#1A1C21]">Set up basics</p>
                         <span className="text-[10px] font-black text-slate-400">33%</span>
                       </div>
                       <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                         <div className="w-1/3 h-full bg-[#00A86B]" />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 mt-2">Next up: <span className="text-slate-600">Set up your entities</span></p>
                    </div>
                    <button className="px-4 py-2 bg-[#1A1C21] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-all">
                      Continue
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
