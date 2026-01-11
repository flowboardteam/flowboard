import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  User,
  Search,
  Briefcase,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  PanelLeftClose,
  ShieldCheck,
  FileBadge,
  CalendarDays,
  BadgeDollarSign,
  FileText,
  UserCircle
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Sidebar({ profile }: { profile: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isTalent = profile?.role_type === "talent";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navigation = [
    {
      group: "MENU",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { label: isTalent ? "Find Jobs" : "Find Talent", icon: Search, href: "/dashboard/search" },
        { label: isTalent ? "Applications" : "Job Postings", icon: Briefcase, href: "/dashboard/applications" },
      ]
    },
    {
      group: "STATUS",
      items: [
        { label: "Profile Status", icon: UserCircle, href: "/dashboard/status" },
        { label: "Verification", icon: ShieldCheck, href: "/dashboard/verify" },
        { label: "Assessments", icon: FileBadge, href: "/dashboard/assessments" },
      ]
    },
    {
      group: "ALERTS",
      items: [
        { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
        { label: "Interviews", icon: CalendarDays, href: "/dashboard/interviews" },
      ]
    },
    {
      group: "ENGAGEMENTS",
      items: [
        { label: "Offers", icon: BadgeDollarSign, href: "/dashboard/offers" },
        { label: "Contracts", icon: FileText, href: "/dashboard/contracts" },
      ]
    }
  ];

  const NavItem = ({ item, isRed = false }: { item: any; isRed?: boolean }) => {
    const active = pathname === item.href;
    
    return (
      <div className="px-4">
        <Link
          to={item.href}
          className={`flex items-center rounded-2xl transition-all duration-300 group
          ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-4 py-3 gap-4 w-full"}
          ${active 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" 
            : isRed 
              ? "text-red-400 hover:bg-red-500/10" 
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 
            ${active ? "scale-110" : "group-hover:text-blue-400 group-hover:scale-110"}`} 
          />
          {!isCollapsed && (
            <span className="text-[13px] font-bold tracking-tight truncate">
              {item.label}
            </span>
          )}
        </Link>
      </div>
    );
  };

  return (
    <aside 
      className={`flex flex-col h-full bg-[#050B1E] transition-all duration-500 ease-in-out relative
      ${isCollapsed ? "w-[90px]" : "w-[280px]"}`}
    >
      
      {/* HEADER: LOGO SECTION */}
      <div className={`flex items-center min-h-[120px] px-7 border-b border-white/5 mb-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-white/5 shrink-0 overflow-hidden">
             {/* If logo.png is missing, fallback to first letter of brand */}
             <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h1 className="text-white font-black text-xl tracking-tighter leading-none">FLOWBOARD</h1>
              <p className="text-[9px] text-blue-400 font-bold tracking-[0.2em] uppercase mt-1.5 opacity-80">
                {isTalent ? "Talent Cloud" : "Recruiter Cloud"}
              </p>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* NAVIGATION: SCROLLABLE AREA */}
      <nav className="flex-1 py-4 space-y-7 overflow-y-auto scrollbar-hide">
        {navigation.map((group) => (
          <div key={group.group}>
            {!isCollapsed && (
              <p className="px-9 text-[10px] font-black text-slate-600 tracking-[0.25em] uppercase mb-4">
                {group.group}
              </p>
            )}
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER: ACCOUNT & LOGOUT */}
      <div className="mt-auto py-6 border-t border-white/5 bg-black/10">
        {!isCollapsed && (
          <p className="px-9 text-[10px] font-black text-slate-600 tracking-[0.25em] uppercase mb-4">Account</p>
        )}
        <div className="space-y-1.5">
          <NavItem item={{ label: "Profile", icon: User, href: "/dashboard/profile" }} />
          <NavItem item={{ label: "Settings", icon: Settings, href: "/dashboard/settings" }} />
          
          <div className="px-4 pt-2">
            <button 
              onClick={handleSignOut}
              className={`flex items-center rounded-2xl transition-all duration-300 text-red-400 hover:bg-red-500/10 group
              ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-4 py-3.5 gap-4 w-full"}`}
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
              {!isCollapsed && <span className="text-[13px] font-bold tracking-tight">Log Out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* COLLAPSE TOGGLE (The small floating button) */}
      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(false)} 
          className="absolute -right-3 top-12 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-[#F1F5F9] hover:scale-110 transition-all z-50 shadow-lg"
        >
          <ChevronRight size={12} strokeWidth={3} />
        </button>
      )}
    </aside>
  );
}