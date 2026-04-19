"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Search,
  Briefcase,
  Inbox,
  Layers,
  Clock,
  FolderKanban,
  ArrowRightLeft,
  Wallet,
  ShieldCheck,
  Grid,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV_GROUPS = [
  {
    label: "Talent Account",
    items: [
      { name: "Dashboard",       path: "/talent/dashboard",    icon: LayoutDashboard },
      { name: "Find Jobs",       path: "/talent/jobs",         icon: Search          },
      { name: "My Applications", path: "/talent/applications", icon: Briefcase       },
      { name: "Offers",     path: "/talent/offers",       icon: Inbox,           badge: "offers"    },
    ],
  },
  {
    label: "Workforce & AI",
    items: [
      { name: "Active Contracts", path: "/talent/contracts",        icon: Layers                          },
      { name: "Time Tracker",     path: "/talent/tracker",          icon: Clock                           },
      { name: "My Project",        path: "/talent/project",          icon: FolderKanban                    },
      { name: "Contract Changes", path: "/talent/contract-changes", icon: ArrowRightLeft, badge: "contracts" },
    ],
  },
  {
    label: "Finance & Admin",
    items: [
      { name: "Invoice & Payments", path: "/talent/payroll",    icon: Wallet      },
      { name: "Compliance",         path: "/talent/compliance", icon: ShieldCheck },
      { name: "Apps & Tools",       path: "/talent/apps",       icon: Grid        },
    ],
  },
];

export default function DashboardHeader({
  onMenuClick,
  theme,
  toggleTheme,
  unreadCount,
}: any) {
  const [profile, setProfile] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [pendingOffers, setPendingOffers] = useState(0);
  const [pendingContracts, setPendingContracts] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role_type, avatar_url")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Fetch Counts for Badges
      const [{ count: offerCount }, { count: contractCount }] = await Promise.all([
        supabase
          .from("hire_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("talent_id", user.id)
          .in("status", ["pending", "viewed"]),
        supabase
          .from("contract_change_requests")
          .select("*", { count: "exact", head: true })
          .eq("talent_id", user.id)
          .in("status", ["pending", "viewed"]),
      ]);

      setPendingOffers(offerCount ?? 0);
      setPendingContracts(contractCount ?? 0);
    };

    syncAndFetch();
  }, [unreadCount]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/talent/login");
  };

  const getBadgeCount = (badge?: string) => {
    if (badge === "offers") return pendingOffers;
    if (badge === "contracts") return pendingContracts;
    return 0;
  };

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--sidebar-bg)] flex items-center justify-between px-6 lg:px-10 shrink-0 relative z-50">
      <div className="flex items-center gap-8">
        {/* Branding */}
        <Link to="/talent/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/flowboardlogo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg font-black tracking-tighter text-[var(--text-main)] uppercase hidden sm:block">Talent</span>
        </Link>

        {/* Desktop Navigation Row */}
        <nav className="hidden lg:flex items-center gap-2">
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
                    ? "text-[#00A86B] bg-[#00A86B]/5"
                    : "text-slate-500 hover:text-slate-900"
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
                        const badgeCount = getBadgeCount(item.badge);
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold text-xs ${
                              isActive
                                ? "bg-[#00A86B]/10 text-[#00A86B]"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#00A86B]" : "text-slate-400"}`} />
                              <span className="truncate">{item.name}</span>
                            </div>
                            {badgeCount > 0 && (
                              <span className="ml-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg">
                                {badgeCount}
                              </span>
                            )}
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
        {/* Search - Hidden on mobile if needed, but Deel has it in Content. We'll keep it as a button here. */}
        <button className="p-2 text-slate-400 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-xl transition-all">
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-xl transition-all"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
            className="p-2 text-slate-400 hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-xl transition-all relative"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[var(--sidebar-bg)]">
                {unreadCount}
              </span>
            )}
          </button>
          {/* Notifications dropdown omitted for brevity, same logic as before */}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 rounded-xl bg-slate-50 focus:outline-none transition-all"
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
                <Link to="/talent/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/5 rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
                  <User className="w-4 h-4" /> Profile Settings
                </Link>
                <Link to="/talent/settings" className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/5 rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
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

        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
