"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardHeader({
  onMenuClick,
  theme,
  toggleTheme,
}: any) {
  const [profile, setProfile] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  let userGuid: string;

  const fetchAndListen = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      userGuid = user.id;

      // 1. Initial Fetch
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role_type, avatar_url")
        .eq("id", user.id)
        .single();
      setProfile(data);

      // 2. Realtime Listener: Watch for changes to THIS specific user's profile
      const channel = supabase
        .channel(`profile-changes-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            // When the sync logic updates the database, this triggers!
            console.log("Profile updated in realtime:", payload.new);
            setProfile(payload.new);
          }
        )
        .subscribe();

      return channel;
    }
  };

  const subscriptionPromise = fetchAndListen();

  // Cleanup subscription on unmount
  return () => {
    subscriptionPromise.then((channel) => {
      if (channel) supabase.removeChannel(channel);
    });
  };
}, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/talent/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-20 border-b border-[var(--border-color)] bg-[var(--sidebar-bg)] flex items-center justify-between px-6 lg:px-10 shrink-0 relative z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center bg-[var(--bg-main)] border border-[var(--border-color)] rounded-full px-4 py-2 w-80">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            placeholder="Search projects or agents..."
            className="bg-transparent border-none text-xs outline-none w-full text-[var(--text-main)] placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-full transition-all"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        <button className="relative p-2 text-slate-400 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#00A86B] rounded-full border-2 border-[var(--sidebar-bg)]"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] hover:border-[#00A86B]/30 transition-all group"
          >
            <div className="relative">
              {/* AVATAR LOGIC: Show image if exists, else initials */}
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shadow-sm">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-500 font-black text-xs">
                    {profile ? getInitials(profile.full_name) : "..."}
                  </span>
                )}
              </div>

              {/* Status Indicator - Emerald Theme */}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#00A86B] border-2 border-[var(--sidebar-bg)] rounded-full shadow-sm">
                <span className="absolute inset-0 rounded-full bg-[#00A86B] animate-ping opacity-75"></span>
              </span>
            </div>
            
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-[var(--text-main)] leading-none truncate max-w-[100px] uppercase tracking-tighter">
                {profile?.full_name || "Loading..."}
              </p>
              <p className="text-[9px] text-[#00A86B] font-black uppercase tracking-widest mt-1 opacity-80">
                {profile?.role_type || "Talent"}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Actual Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="absolute right-0 mt-3 w-60 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200 ring-1 ring-black/5">
                <div className="px-4 py-4 border-b border-[var(--border-color)] mb-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                    Node Operator
                  </p>
                  <p className="text-sm font-black text-[var(--text-main)] truncate uppercase tracking-tight">
                    {profile?.full_name}
                  </p>
                </div>

                <Link
                  to="/talent/profile"
                  className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-xl transition-all"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </Link>

                <Link
                  to="/talent/settings"
                  className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-xl transition-all"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  System Prefs
                </Link>

                <div className="h-px bg-[var(--border-color)] my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 w-full rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}