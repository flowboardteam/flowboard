import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Wallet,
  ShieldCheck,
  Clock,
  Users,
  Layers,
  Grid,
  Inbox,
  ArrowRightLeft,
  FolderKanban,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const MENU_GROUPS = [
  {
    group: "Core Marketplace",
    items: [
      { name: "Dashboard",       path: "/talent/dashboard",    icon: LayoutDashboard },
      { name: "Find Jobs",       path: "/talent/jobs",         icon: Search          },
      { name: "My Applications", path: "/talent/applications", icon: Briefcase       },
      { name: "Hire Offers",     path: "/talent/offers",       icon: Inbox,           badge: "offers"    },
    ],
  },
  {
    group: "Workforce & AI",
    items: [
      { name: "Active Contracts", path: "/talent/contracts",        icon: Layers                          },
      { name: "Time Tracker",     path: "/talent/tracker",          icon: Clock                           },
{ name: "My Project", path: "/talent/project", icon: FolderKanban } ,     
{ name: "Contract Changes", path: "/talent/contract-changes", icon: ArrowRightLeft, badge: "contracts" },
    ],
  },
  {
    group: "Finance & Admin",
    items: [
      { name: "Invoice & Payments", path: "/talent/payroll",    icon: Wallet      },
      { name: "Compliance",         path: "/talent/compliance", icon: ShieldCheck },
      { name: "Apps & Tools",       path: "/talent/apps",       icon: Grid        },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const [pendingOffers,    setPendingOffers]    = useState(0);
  const [pendingContracts, setPendingContracts] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

    fetchCounts();

    const channel = supabase
      .channel("talent-sidebar-badges")
      .on("postgres_changes", { event: "*", schema: "public", table: "hire_inquiries" },           fetchCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "contract_change_requests" }, fetchCounts)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getBadgeCount = (badge?: string) => {
    if (badge === "offers")    return pendingOffers;
    if (badge === "contracts") return pendingContracts;
    return 0;
  };

  return (
    <aside className="w-full h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-none flex items-center justify-center shadow-sm">
          <img src="/flowboardlogo.png" alt="FlowBoard Logo" className="w-20 h-20 object-contain" />
        </div>
        <span className="text-xl font-black tracking-tighter text-[var(--text-main)]">Flowboard</span>
      </div>

      <nav className="flex-1 space-y-8">
        {MENU_GROUPS.map(group => (
          <div key={group.group}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-4">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map(item => {
                const badgeCount = getBadgeCount((item as any).badge);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-none transition-all font-bold text-sm ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-500 hover:bg-blue-500/10 hover:text-blue-500"
                      }`
                    }
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {badgeCount > 0 && (
                      <span className="ml-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-none min-w-[20px] text-center shrink-0 shadow-md shadow-amber-500/30">
                        {badgeCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}