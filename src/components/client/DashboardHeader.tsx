"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Menu, Bell, Search, Sun, Moon,
  User, Settings, LogOut, ChevronDown,
  CheckCircle2, Briefcase, Send, Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Notification icon by type ────────────────────────────────────────────────
function NotifIcon({ type }: { type: string }) {
  const base = "w-7 h-7 rounded-xl flex items-center justify-center shrink-0";
  if (type === "offer_accepted")
    return <div className={`${base} bg-emerald-500/10`}><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></div>;
  if (type === "hire_offer" || type === "inquiry")
    return <div className={`${base} bg-blue-500/10`}><Send className="w-3.5 h-3.5 text-blue-500" /></div>;
  if (type === "hired")
    return <div className={`${base} bg-amber-500/10`}><Zap className="w-3.5 h-3.5 text-amber-500" /></div>;
  return <div className={`${base} bg-slate-500/10`}><Bell className="w-3.5 h-3.5 text-slate-400" /></div>;
}

export default function DashboardHeader({
  onMenuClick,
  theme,
  toggleTheme,
}: {
  onMenuClick: () => void;
  theme: string;
  toggleTheme: () => void;
}) {
  const [profile, setProfile]             = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen]   = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const navigate = useNavigate();

  // ── Fetch profile + notifications ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role_type, avatar_url")
        .eq("id", user.id)
        .single();

      const socialPic = user.user_metadata?.picture || user.user_metadata?.avatar_url;
      if (socialPic && !profileData?.avatar_url) {
        await supabase.from("profiles").update({ avatar_url: socialPic }).eq("id", user.id);
        setTimeout(() => window.location.reload(), 500);
      } else {
        setProfile(profileData);
      }

      // Notifications
      await fetchNotifications(user.id);
    };

    init();
  }, []);

  const fetchNotifications = async (userId?: string) => {
    const uid = userId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(15);

    const notifs = data ?? [];
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.is_read).length);
  };

  // Realtime — bell updates when new notification arrives
  useEffect(() => {
    let userId: string;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      userId = user.id;

      const channel = supabase
        .channel("client-notifications-realtime")
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "notifications",
          filter: `user_id=eq.${userId}`,
        }, () => fetchNotifications(userId))
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    });
  }, []);

  // Mark all as read when dropdown opens
  const handleOpenNotifications = async () => {
    setIsNotifyOpen(v => !v);
    if (!isNotifyOpen && unreadCount > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/client/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className="h-20 border-b border-[var(--border-color)] bg-[var(--sidebar-bg)] flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 relative z-50">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center bg-[var(--bg-main)] border border-[var(--border-color)] rounded-full px-4 py-2 w-72 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            placeholder="Search talent, roles, projects..."
            className="bg-transparent border-none text-xs outline-none w-full text-[var(--text-main)] placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-full transition-all"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* ── Notifications ── */}
        <div className="relative">
          <button
            onClick={handleOpenNotifications}
            className="p-2 text-slate-400 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-full transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--sidebar-bg)] shadow-lg">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifyOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
                onClick={() => setIsNotifyOpen(false)}
              />

              {/* Dropdown — bottom sheet feel on mobile */}
              <div className="
                fixed inset-x-4 top-20 z-[70]
                lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-3
                w-auto lg:w-96
                bg-[var(--sidebar-bg)]
                border border-[var(--border-color)]
                rounded-[1.5rem] lg:rounded-2xl
                shadow-2xl overflow-hidden
                animate-in fade-in slide-in-from-top-2 duration-200
              ">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-slate-500/5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-[#00A86B]/10 text-[#00A86B] text-[9px] font-black rounded-full uppercase">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsNotifyOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 transition-colors lg:hidden"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* List */}
                <div className="max-h-[55vh] lg:max-h-80 overflow-y-auto overscroll-contain divide-y divide-[var(--border-color)]">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-5 py-4 hover:bg-slate-500/5 transition-colors cursor-pointer ${!n.is_read ? "bg-[#00A86B]/[0.03]" : ""}`}
                      >
                        <NotifIcon type={n.type} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] font-black text-[var(--text-main)] leading-snug">
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <span className="w-2 h-2 bg-[#00A86B] rounded-full shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium mt-0.5">
                            {n.message}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1.5 font-black uppercase tracking-widest opacity-60">
                            {timeAgo(n.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 bg-slate-500/5 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">All clear</p>
                      <p className="text-xs text-slate-400 mt-1">No notifications yet</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <Link
                  to="/client/offers"
                  onClick={() => setIsNotifyOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-[#00A86B] hover:bg-[#008f5b] transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> View all offers sent
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ── Profile dropdown ── */}
        <div className="relative ml-1">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:pr-3 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] hover:border-[#00A86B]/30 transition-all"
          >
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shadow-sm">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-slate-500 font-black text-xs">{profile ? getInitials(profile.full_name) : "..."}</span>
                }
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00A86B] border-2 border-[var(--sidebar-bg)] rounded-full">
                <span className="absolute inset-0 rounded-full bg-[#00A86B] animate-ping opacity-75" />
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-[var(--text-main)] leading-none truncate max-w-[90px] tracking-tighter">
                {profile?.full_name || "Loading..."}
              </p>
              <p className="text-[9px] text-[#00A86B] font-black uppercase tracking-widest mt-1 opacity-80">
                {profile?.role_type || "Client"}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 hidden sm:block ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-3 w-56 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200 ring-1 ring-black/5 z-50">
                <div className="px-4 py-3 border-b border-[var(--border-color)] mb-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Signed in as</p>
                  <p className="text-sm font-black text-[var(--text-main)] truncate tracking-tight">{profile?.full_name}</p>
                </div>
                <Link to="/client/profile" onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black tracking-widest text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-xl transition-all">
                  <User className="w-4 h-4" /> Profile Settings
                </Link>
                <Link to="/client/settings" onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black tracking-widest text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-xl transition-all">
                  <Settings className="w-4 h-4" /> System Preferences
                </Link>
                <div className="h-px bg-[var(--border-color)] my-1" />
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 w-full rounded-xl transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}