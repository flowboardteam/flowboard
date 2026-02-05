// pages/dashboard/components/Sidebar.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, User, Search, Briefcase, Settings, LogOut, ChevronRight, 
  Bell, PanelLeftClose, ShieldCheck, FileBadge, CalendarDays, BadgeDollarSign, FileText, UserCircle, Menu, X
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Sidebar({ profile }: { profile: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // New state for mobile
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isTalent = profile?.role_type === "talent";
  const readyRoutes = ["/dashboard", "/dashboard/profile", "/dashboard/settings"];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navigation = [
    { group: "MENU", items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }, { label: isTalent ? "Find Jobs" : "Find Talent", icon: Search, href: "/dashboard/search" }, { label: isTalent ? "Applications" : "Job Postings", icon: Briefcase, href: "/dashboard/applications" }] },
    { group: "STATUS", items: [{ label: "Profile Status", icon: UserCircle, href: "/dashboard/status" }, { label: "Verification", icon: ShieldCheck, href: "/dashboard/verify" }, { label: "Assessments", icon: FileBadge, href: "/dashboard/assessments" }] },
    { group: "ALERTS", items: [{ label: "Notifications", icon: Bell, href: "/dashboard/notifications" }, { label: "Interviews", icon: CalendarDays, href: "/dashboard/interviews" }] },
    { group: "ENGAGEMENTS", items: [{ label: "Offers", icon: BadgeDollarSign, href: "/dashboard/offers" }, { label: "Contracts", icon: FileText, href: "/dashboard/contracts" }] }
  ];

  const NavItem = ({ item }: { item: any }) => {
    const active = pathname === item.href;
    const isReady = readyRoutes.includes(item.href);
    const destination = isReady ? item.href : "/dashboard/coming-soon";
    
    return (
      <div className="px-4">
        <Link to={destination} className={`flex items-center rounded-2xl transition-all duration-300 group relative ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-4 py-3 gap-4 w-full"} ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
          <item.icon className={`w-5 h-5 shrink-0 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} />
          {!isCollapsed && <div className="flex items-center justify-between w-full"><span className="text-[13px] font-bold tracking-tight">{item.label}</span>{!isReady && !active && <span className="text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md font-black uppercase">Soon</span>}</div>}
        </Link>
      </div>
    );
  };

  return (
    <>
      {/* MOBILE HAMBURGER TOGGLE (Floating) */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
      >
        <Menu size={24} />
      </button>

      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-[70] flex flex-col h-full bg-[#050B1E] transition-all duration-500 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-[90px]" : "w-[280px]"}`}
      >
        {/* MOBILE CLOSE BUTTON */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-6 right-6 text-slate-400"
        >
          <X size={24} />
        </button>
        
        {/* LOGO SECTION */}
        <div className={`flex items-center min-h-[100px] lg:min-h-[120px] px-7 border-b border-white/5 mb-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
               <img src="/flowboardlogo.png" alt="L" className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-500">
                <h1 className="text-white font-black text-lg tracking-tighter">FLOWBOARD</h1>
                <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">{isTalent ? "Talent" : "Recruiter"}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button onClick={() => setIsCollapsed(true)} className="hidden lg:block p-2 hover:bg-white/5 rounded-xl text-slate-500"><PanelLeftClose size={18} /></button>
          )}
        </div>

        {/* NAV AREA */}
        <nav className="flex-1 py-4 space-y-7 overflow-y-auto scrollbar-hide">
          {navigation.map((group) => (
            <div key={group.group}>
              {!isCollapsed && <p className="px-9 text-[10px] font-black text-slate-600 tracking-widest uppercase mb-4">{group.group}</p>}
              <div className="space-y-1">
                {group.items.map((item) => <NavItem key={item.label} item={item} />)}
              </div>
            </div>
          ))}
        </nav>

        {/* FOOTER AREA */}
        <div className="mt-auto py-6 border-t border-white/5 bg-black/10">
          <NavItem item={{ label: "Profile", icon: User, href: "/dashboard/profile" }} />
          <div className="px-4 pt-2">
            <button onClick={handleSignOut} className={`flex items-center rounded-2xl transition-all duration-300 text-red-400 hover:bg-red-500/10 w-full ${isCollapsed ? "justify-center h-12" : "px-4 py-3 gap-4"}`}>
              <LogOut className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="text-[13px] font-bold">Log Out</span>}
            </button>
          </div>
        </div>

        {/* DESKTOP COLLAPSE TOGGLE */}
        {isCollapsed && (
          <button onClick={() => setIsCollapsed(false)} className="hidden lg:flex absolute -right-3 top-12 w-7 h-7 bg-blue-600 rounded-full items-center justify-center text-white border-4 border-[#050B1E] z-50"><ChevronRight size={12} /></button>
        )}
      </aside>
    </>
  );
}