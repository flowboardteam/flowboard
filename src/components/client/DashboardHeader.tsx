"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Menu, Bell, Search, Sun, Moon,
  User, Settings, LogOut, ChevronDown,
  Briefcase, UserPlus, Zap, BookmarkCheck,
  Users, Send, Clock, FolderKanban,
  Grid, Wallet, BarChart3, Cpu, FileText, LayoutDashboard, Building2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import GroupSwitcher from "./GroupSwitcher";

const NAV_GROUPS = [
  {
    label: "Roles & Talent",
    items: [
      { name: "All Roles",      path: "/client/roles",           icon: Briefcase     },
      { name: "Create Role",    path: "/client/roles/create",    icon: UserPlus      },
      { name: "Haraka01",       path: "/client/haraka",          icon: Zap           },
      { name: "Applications",   path: "/client/applications",    icon: FileText      },
      { name: "Interviews",     path: "/client/interviews",      icon: Clock         },
      { name: "Shortlisted",    path: "/client/shortlist",       icon: BookmarkCheck },
      { name: "Talent Pool",    path: "/client/talent-pool",     icon: Users         },
      { name: "Reviews",        path: "/client/reviews",         icon: Grid          },
      { name: "Offers",         path: "/client/offers",          icon: Send          },
    ],
  },
  {
    label: "Workforce",
    items: [
      { name: "Active Workforce", path: "/client/workforce",     icon: Zap           },
      { name: "Team",             path: "/client/teams",         icon: Users         },
      { name: "Projects",         path: "/client/projects",      icon: FolderKanban  },
      { name: "Time Tracker",     path: "/client/tracker",       icon: Clock         },
    ],
  },
  {
    label: "Admin & Finance",
    items: [
      { name: "Groups",            path: "/client/settings/groups", icon: Building2    },
      { name: "Apps & Tools",      path: "/client/apps",          icon: Grid          },
      { name: "Payroll",           path: "/client/payroll",       icon: Wallet        },
      { name: "Hiring Analytics",  path: "/client/analytics/hiring", icon: BarChart3    },
      { name: "Performance AI",    path: "/client/analytics/performance", icon: Cpu      },
    ],
  },
];

export default function DashboardHeader({
  onMenuClick,
  theme,
  toggleTheme,
}: {
  onMenuClick: () => void;
  theme: string;
  toggleTheme: () => void;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role_type, avatar_url")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      fetchNotifications(user.id);
    };

    init();
  }, []);

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const notifs = data || [];
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.is_read).length);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/client/login");
  };

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--sidebar-bg)] flex items-center justify-between px-6 lg:px-10 shrink-0 relative z-50">
      <div className="flex items-center gap-8">
        {/* Branding & Group Switcher */}
        <div className="flex items-center gap-4">
          <GroupSwitcher />
        </div>

        {/* Desktop Navigation Row */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link 
            to="/client/dashboard" 
            className={`px-4 py-2 text-sm font-black rounded-xl transition-all ${
              location.pathname === "/client/dashboard" ? "text-emerald-600 bg-emerald-500/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Home
          </Link>
          {NAV_GROUPS.map((group) => (
            <div 
              key={group.label}
              className="relative group/nav"
              onMouseEnter={() => setActiveGroup(group.label)}
              onMouseLeave={() => setActiveGroup(null)}
            >
              <button
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-black transition-all rounded-xl ${
                  activeGroup === group.label || group.items.some(i => location.pathname === i.path)
                    ? "text-emerald-600 bg-emerald-500/5"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {group.label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeGroup === group.label ? "rotate-180" : ""}`} />
              </button>

              {/* Mega Dropdown */}
              {activeGroup === group.label && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[var(--border-color)] rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-3">
                      Go to {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-xs ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Actions Row */}
        <div className="hidden sm:flex items-center bg-slate-100/50 dark:bg-slate-800/50 border border-[var(--border-color)] rounded-xl px-4 py-2 w-48 lg:w-64 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            placeholder="Search..."
            className="bg-transparent border-none text-xs outline-none w-full text-[var(--text-main)] placeholder:text-slate-500"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all relative"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--sidebar-bg)] shadow-lg">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 rounded-xl bg-slate-50/50 hover:bg-emerald-500/5 border border-[var(--border-color)] transition-all"
          >
             <div className="w-8 h-8 rounded-lg bg-slate-200 border border-[var(--border-color)] flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="hidden sm:block text-left pr-2">
              <p className="text-[11px] font-black text-slate-900 leading-none">{profile?.full_name?.split(" ")[0] || "Me"}</p>
              <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-1 opacity-80">{profile?.role_type || "Client"}</p>
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-3 w-56 bg-white border border-[var(--border-color)] rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-50 mb-1">
                   <p className="text-[10px] font-black uppercase text-slate-400">Account</p>
                   <p className="text-sm font-black text-slate-900 truncate">{profile?.full_name}</p>
                </div>
                <Link to="/client/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/5 rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
                  <User className="w-4 h-4" /> Profile Settings
                </Link>
                <Link to="/client/settings" className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/5 rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
                  <Settings className="w-4 h-4" /> System Preference
                </Link>
                <div className="h-px bg-slate-50 my-1" />
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-xs font-black text-red-500 hover:bg-red-50 hover:text-red-600 w-full rounded-xl transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>

        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}