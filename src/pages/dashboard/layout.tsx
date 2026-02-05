"use client";

import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ProtectedRoute } from "@/components/ProtectedRoutes";
import { Sidebar } from "./components/Sidebar";
import { Loader2, Search, Bell, Calendar } from "lucide-react";

export default function DashboardLayout() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#050B1E]">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
        
        {/* SIDEBAR - This component now handles its own mobile/desktop logic internally */}
        <Sidebar profile={profile} />

        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-6 md:px-10 shrink-0 border-b border-slate-100 bg-white/40 backdrop-blur-md">
            <div className="flex flex-col">
              <h2 className="text-slate-900 font-bold text-base md:text-lg">
                Hi, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
              </h2>
              <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                <Calendar className="w-3 h-3" />
                {today}
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 w-64 shadow-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none text-sm ml-2 outline-none w-full" />
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <button className="relative p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-10 custom-scrollbar">
            <div className="w-full lg:max-w-[1400px] lg:mx-auto">
              <Outlet context={{ profile }} />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}