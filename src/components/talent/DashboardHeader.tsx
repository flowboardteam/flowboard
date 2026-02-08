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
  unreadCount,
}: any) {
  const [profile, setProfile] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  useEffect(() => {
    const syncAndFetch = async () => {
      // 1. Get the Auth User (Source of Truth for Social Pic)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Get the Profile (Your Database)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role_type, avatar_url")
        .eq("id", user.id)
        .single();

      const socialPic =
        user.user_metadata?.picture || user.user_metadata?.avatar_url;

      // CHECK: Do we have a social pic but NO database pic?
      if (socialPic && !profileData?.avatar_url) {
        // 3. Update the database
        await supabase
          .from("profiles")
          .update({ avatar_url: socialPic })
          .eq("id", user.id);

        // 4. THE MAGIC: Force a reload so the header and everything else is fresh
        // We use a small timeout to ensure the DB write finishes
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // Otherwise, just set the profile state normally
        setProfile(profileData);
      }
    };

    syncAndFetch();

    const fetchNotifications = async () => {
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      console.log("No user found for notifications");
      return;
    }

    console.log("Fetching notifications for user:", user.id);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id) // Ensure this column name is correct
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Fetched Data:", data);
      setNotifications(data || []);
    }
  };

  fetchNotifications();

  fetchNotifications();
  }, [unreadCount]);

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

        <div className="relative">
  <button
    onClick={() => setIsNotifyOpen(!isNotifyOpen)}
    className="p-2 text-slate-400 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-full transition-all relative"
  >
    <Bell className="w-6 h-6" />
    {unreadCount > 0 && (
      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-[var(--sidebar-bg)]">
        {unreadCount}
      </span>
    )}
  </button>

  {isNotifyOpen && (
    <>
      {/* Overlay: Fixed for mobile, Absolute for desktop backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none" 
        onClick={() => setIsNotifyOpen(false)} 
      />
      
      {/* Dropdown Container */}
      <div className="
        fixed inset-x-4 top-20 z-[70]             /* Mobile: Centered floating */
        lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-3 /* Desktop: Anchored */
        w-auto lg:w-80 
        bg-[var(--sidebar-bg)] 
        border border-[var(--border-color)] 
        rounded-[2rem] lg:rounded-2xl 
        shadow-2xl overflow-hidden 
        animate-in fade-in slide-in-from-top-4 lg:slide-in-from-top-2 duration-200
      ">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-500/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Notifications</h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#00A86B]/10 text-[#00A86B] text-[9px] font-black rounded-full uppercase">
              {unreadCount} New
            </span>
            <button 
              onClick={() => setIsNotifyOpen(false)}
              className="lg:hidden text-slate-400 p-1"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[60vh] lg:max-h-80 overflow-y-auto overscroll-contain">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-5 border-b border-[var(--border-color)] last:border-0 hover:bg-slate-500/5 transition-colors cursor-pointer group ${!n.is_read ? 'bg-[#00A86B]/[0.03]' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[11px] font-black text-[var(--text-main)] group-hover:text-[#00A86B] transition-colors">
                    {n.title}
                  </p>
                  {!n.is_read && <span className="w-1.5 h-1.5 bg-[#00A86B] rounded-full mt-1" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
                  {n.message}
                </p>
                <p className="text-[9px] text-slate-400 mt-3 font-black uppercase tracking-widest opacity-60">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-500/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Signal clear</p>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <Link
          to="/talent/messages"
          onClick={() => setIsNotifyOpen(false)}
          className="block p-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white bg-[#00A86B] hover:bg-[#008f5b] transition-all"
        >
          Open Inbox
        </Link>
      </div>
    </>
  )}
</div>

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
              <p className="text-xs font-black text-[var(--text-main)] leading-none truncate max-w-[100px] tracking-tighter">
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
                    Signed in as
                  </p>
                  <p className="text-sm font-black text-[var(--text-main)] truncate tracking-tight">
                    {profile?.full_name}
                  </p>
                </div>

                <Link
                  to="/talent/profile"
                  className="flex items-center gap-3 px-4 py-3 text-[11px] font-black tracking-widest text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-xl transition-all"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </Link>

                <Link
                  to="/talent/settings"
                  className="flex items-center gap-3 px-4 py-3 text-[11px] font-black tracking-widest text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-xl transition-all"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  System Prefference
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
