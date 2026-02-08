"use client";

import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  UserPlus,
  Users,
  Cpu,
  Zap,
  Clock,
  Projector,
  Grid,
  BarChart3,
  Wallet,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const CLIENT_MENU = [
  { name: "Dashboard", path: "/client/dashboard", icon: LayoutDashboard },
  {
    group: "Roles & Jobs",
    icon: Briefcase,
    items: [
      { name: "Create Roles", path: "/client/roles/create", icon: UserPlus },
      { name: "All Roles", path: "/client/contracts", icon: Briefcase },
    ],
  },
  {
    group: "Talent & AI",
    icon: Cpu,
    items: [
      { name: "Talent Pool", path: "/client/talent-pool", icon: Users },
      { name: "AI Agent", path: "/client/ai-matcher", icon: Zap },
    ],
  },
  { name: "Active Workforce", path: "/client/workforce", icon: Zap },
  { name: "Time Tracker", path: "/client/tracker", icon: Clock },
  { name: "Team", path: "/client/teams", icon: Users },
  { name: "Project", path: "/client/projects", icon: Projector },
  { name: "Apps", path: "/client/apps", icon: Grid },
  {
    group: "Analytics",
    icon: BarChart3,
    items: [
      { name: "Hiring Pool", path: "/client/analytics/hiring", icon: BarChart3 },
      { name: "AI vs Human", path: "/client/analytics/performance", icon: Cpu },
    ],
  },
  { name: "Payroll & Compliance", path: "/client/payroll", icon: Wallet },
];

export default function ClientSidebar({ onClose }: { onClose?: () => void }) {
  const [openGroups, setOpenGroups] = useState<string[]>(["Roles & Jobs"]);
  const [profile, setProfile] = useState<any>(null);
  const [showMiniMenu, setShowMiniMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role_type")
        .eq("id", user.id)
        .single();
      
      setProfile(data);
    };
    fetchProfile();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/client/login");
  };

  return (
    <aside className="w-full h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col p-6 overflow-y-auto no-scrollbar relative">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
          <img src="/flowboardlogo.png" alt="Logo" className="w-6 h-6 object-contain" />
        </div>
        <span className="text-lg font-black tracking-tight text-[var(--text-main)]">
          Flowboard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {CLIENT_MENU.map((item) => {
          if (item.group) {
            const isOpen = openGroups.includes(item.group);
            return (
              <div key={item.group} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.group!)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all font-bold text-sm group"
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    <span>{item.group}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="ml-8 space-y-1 border-l border-slate-500/10">
                    {item.items?.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        onClick={onClose}
                        className={({ isActive }) => `
                          flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all font-semibold text-[13px]
                          ${isActive ? "text-emerald-500 bg-emerald-500/5" : "text-slate-400 hover:text-emerald-500"}
                        `}
                      >
                        {subItem.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm
                ${isActive ? "bg-emerald-500/10 text-emerald-500 shadow-sm" : "text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-600"}
              `}
            >
              <item.icon className="w-4 h-4 opacity-70" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Profile Section */}
      <div className="mt-10 pt-6 border-t border-[var(--border-color)] relative">
        {showMiniMenu && (
          <div className="absolute bottom-full left-0 mb-4 w-full bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200 z-50 ring-1 ring-black/5">
            <button 
              onClick={() => { navigate("/client/profile"); setShowMiniMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black tracking-widest text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-600 rounded-xl transition-all"
            >
              <User className="w-3.5 h-3.5" /> Profile Settings
            </button>
            <button 
              onClick={() => { navigate("/client/settings"); setShowMiniMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black tracking-widest text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-600 rounded-xl transition-all"
            >
              <Settings className="w-3.5 h-3.5" /> System Preferences
            </button>
            <div className="h-px bg-[var(--border-color)] my-1" />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}

        <button 
          onClick={() => setShowMiniMenu(!showMiniMenu)}
          className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-500/5 transition-all group"
        >
          <div className="flex items-center gap-3">
            {/* AVATAR BOX: Consistent with DashboardHeader */}
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shadow-sm shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-500 font-black text-xs">
                  {profile ? getInitials(profile.full_name) : "..."}
                </span>
              )}
            </div>
            
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-black text-[var(--text-main)] tracking-tight truncate max-w-[100px]">
                {profile?.full_name || "Loading..."}
              </span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-0.5 opacity-80">
                {profile?.role_type || "MANAGER"}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${showMiniMenu ? "rotate-180" : ""}`} />
        </button>
      </div>
    </aside>
  );
}