"use client";

import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, UserPlus, Users, Cpu, Zap,
  Clock, Projector, Grid, BarChart3, Wallet, ChevronDown,
  Settings, LogOut, User, BookmarkCheck, ListChecks, Send,
  FolderKanban, Building2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const BASE_MENU = [
  { name: "Dashboard", path: "/client/dashboard", icon: LayoutDashboard },
  {
    group: "Roles & Jobs",
    icon: Briefcase,
    items: [
      { name: "All Roles",   path: "/client/roles",        icon: Briefcase, end: true },
      { name: "Create Role", path: "/client/roles/create", icon: UserPlus            },
    ],
  },
  {
    group: "Talent & AI",
    icon: Cpu,
    items: [
      { name: "AI Agent",      path: "/client/haraka",      icon: Zap,           badge: null           },
      { name: "Shortlisted",   path: "/client/shortlist",   icon: BookmarkCheck, badge: "shortlist"    },
      { name: "Talent Pool",   path: "/client/talent-pool", icon: Users,         badge: null           },
      { name: "Offers Sent",   path: "/client/offers",      icon: Send,          badge: "offersPending"},
    ],
  },
  { name: "Active Workforce",     path: "/client/workforce",            icon: Zap       },
  { name: "Time Tracker",         path: "/client/tracker",              icon: Clock     },
  { name: "Team",                 path: "/client/teams",                icon: Users     },
  { name: "Projects",              path: "/client/projects",             icon: FolderKanban },
  { name: "Apps",                 path: "/client/apps",                 icon: Grid      },
  {
    group: "Analytics",
    icon: BarChart3,
    items: [
      { name: "Hiring Pool", path: "/client/analytics/hiring",       icon: BarChart3 },
      { name: "AI vs Human", path: "/client/analytics/performance",  icon: Cpu       },
    ],
  },
  { name: "Payroll & Compliance", path: "/client/payroll", icon: Wallet },
];

export default function ClientSidebar({ onClose }: { onClose?: () => void }) {
  const [openGroups, setOpenGroups]           = useState<string[]>(["Roles & Jobs", "Talent & AI"]);
  const [profile, setProfile]                 = useState<any>(null);
  const [showMiniMenu, setShowMiniMenu]       = useState(false);
  const [shortlistCount, setShortlistCount]   = useState(0);
  const [roleShortlistCount, setRoleShortlistCount] = useState(0);
  const [offersPendingCount, setOffersPendingCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const roleIdMatch  = location.pathname.match(/\/client\/roles\/([^/]+)\/(source|shortlist)/);
  const activeRoleId = roleIdMatch?.[1] ?? null;

  useEffect(() => {
    const fetchSidebarData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role_type")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Haraka shortlist
      const { count: sc } = await supabase
        .from("shortlisted_talent")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setShortlistCount(sc ?? 0);

      // Role shortlist
      const { count: rc } = await supabase
        .from("role_shortlist")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", user.id);
      setRoleShortlistCount(rc ?? 0);

      // Pending offers sent (talent hasn't responded yet)
      const { count: oc } = await supabase
        .from("hire_inquiries")
        .select("*", { count: "exact", head: true })
        .eq("client_id", user.id)
        .in("status", ["pending", "viewed"]);
      setOffersPendingCount(oc ?? 0);
    };

    fetchSidebarData();

    const channel = supabase
      .channel("sidebar-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "shortlisted_talent" }, fetchSidebarData)
      .on("postgres_changes", { event: "*", schema: "public", table: "role_shortlist" },     fetchSidebarData)
      .on("postgres_changes", { event: "*", schema: "public", table: "hire_inquiries" },     fetchSidebarData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev =>
      prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/client/login");
  };

  // Inject shortlisted candidates link when on a role-specific page
  const menu = BASE_MENU.map(item => {
    if (!("group" in item) || item.group !== "Roles & Jobs") return item;
    if (!activeRoleId) return item;
    return {
      ...item,
      items: [
        ...(item.items ?? []),
        {
          name:  "Shortlisted Candidates",
          path:  `/client/roles/${activeRoleId}/shortlist`,
          icon:  ListChecks,
          badge: "roleShortlist",
          end:   true,
        },
      ],
    };
  });

  const getBadge = (badge?: string | null): number | null => {
    if (badge === "shortlist"      && shortlistCount      > 0) return shortlistCount;
    if (badge === "roleShortlist"  && roleShortlistCount  > 0) return roleShortlistCount;
    if (badge === "offersPending"  && offersPendingCount  > 0) return offersPendingCount;
    return null;
  };

  // Badge colour by type
  const getBadgeColor = (badge?: string | null): string => {
    if (badge === "offersPending") return "bg-amber-500 text-white";
    return "bg-blue-600 text-white";
  };

  return (
    <aside className="w-full h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col p-6 overflow-y-auto no-scrollbar relative">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
          <img src="/flowboardlogo.png" alt="Logo" className="w-6 h-6 object-contain" />
        </div>
        <span className="text-lg font-black tracking-tight text-[var(--text-main)]">Flowboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menu.map(item => {
          if ("group" in item && item.group) {
            const isOpen    = openGroups.includes(item.group);
            const GroupIcon = item.icon;
            return (
              <div key={item.group} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.group!)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all font-bold text-sm group"
                >
                  <div className="flex items-center gap-4">
                    <GroupIcon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    <span>{item.group}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="ml-8 space-y-1 border-l border-slate-500/10">
                    {item.items?.map(sub => {
                      const SubIcon    = (sub as any).icon;
                      const badge      = getBadge((sub as any).badge);
                      const badgeColor = getBadgeColor((sub as any).badge);
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          end={(sub as any).end ?? false}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-4 py-2.5 rounded-lg transition-all font-semibold text-[13px] ${
                              isActive
                                ? "text-emerald-500 bg-emerald-500/5"
                                : "text-slate-400 hover:text-emerald-500"
                            }`
                          }
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {SubIcon && <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                            <span className="truncate">{sub.name}</span>
                          </div>
                          {badge !== null && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg min-w-[20px] text-center shrink-0 ${badgeColor}`}>
                              {badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const TopIcon = (item as any).icon;
          return (
            <NavLink
              key={(item as any).path}
              to={(item as any).path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500 shadow-sm"
                    : "text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-600"
                }`
              }
            >
              {TopIcon && <TopIcon className="w-4 h-4 opacity-70" />}
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-[var(--border-color)] relative">
        {showMiniMenu && (
          <div className="absolute bottom-full left-0 mb-4 w-full bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-2 z-50 ring-1 ring-black/5">
            <button onClick={() => { navigate("/client/profile"); setShowMiniMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black tracking-widest text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-600 rounded-xl transition-all">
              <User className="w-3.5 h-3.5" /> Profile Settings
            </button>
            <button onClick={() => { navigate("/client/settings"); setShowMiniMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black tracking-widest text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-600 rounded-xl transition-all">
              <Settings className="w-3.5 h-3.5" /> System Preferences
            </button>
            <button onClick={() => { navigate("/client/settings/groups"); setShowMiniMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black tracking-widest text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-600 rounded-xl transition-all">
              <Building2 className="w-3.5 h-3.5" /> Organization Groups
            </button>
            <div className="h-px bg-[var(--border-color)] my-1" />
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}
        <button
          onClick={() => setShowMiniMenu(!showMiniMenu)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-500/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shadow-sm shrink-0">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                : <span className="text-slate-500 font-black text-xs">{profile ? getInitials(profile.full_name) : "..."}</span>
              }
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